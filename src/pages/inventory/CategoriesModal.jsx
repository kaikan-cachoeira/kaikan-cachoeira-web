import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Textarea from "../../components/Form/Textarea";
import Icon from "../../components/Icon/Icon";
import { LoadingState, ErrorState, EmptyState } from "../../components/State/State";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useInventory";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../services/api";
import { pluralizeCategory } from "../../utils/format";
import styles from "./InventoryModals.module.css";

function CategoryFormModal({ category, onClose, onSaved }) {
  const isEditing = Boolean(category);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { addToast } = useToast();
  const [serverError, setServerError] = useState("");
  const mutation = isEditing ? updateCategory : createCategory;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  async function onSubmit(values) {
    setServerError("");
    try {
      if (isEditing) {
        await updateCategory.mutateAsync({ id: category.id, payload: values });
        addToast("Categoria atualizada com sucesso.");
      } else {
        await createCategory.mutateAsync(values);
        addToast("Categoria criada com sucesso.");
      }
      onSaved?.();
    } catch (error) {
      setServerError(
        apiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar a categoria."
            : "Não foi possível criar a categoria.",
        ),
      );
    }
  }

  return (
    <Modal
      title={isEditing ? "Editar categoria" : "Criar categoria"}
      onClose={mutation.isPending ? undefined : onClose}
      showClose={!mutation.isPending}
      closeOnOverlay={!mutation.isPending}
      size="small"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-categoria"
            loading={mutation.isPending}
          >
            {isEditing ? "Salvar categoria" : "Criar categoria"}
          </Button>
        </>
      }
    >
      <form
        id="form-categoria"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Input
          id="categoria-nome"
          label="Nome"
          placeholder="Nome da categoria"
          required
          error={errors.name?.message}
          {...register("name", {
            required: "Informe o nome da categoria.",
            minLength: { value: 2, message: "Informe ao menos 2 caracteres." },
          })}
        />
        <Textarea
          id="categoria-descricao"
          label="Descrição"
          rows={3}
          placeholder="Descrição da categoria (opcional)"
          error={errors.description?.message}
          {...register("description")}
        />
        {serverError ? (
          <p className={styles.serverError} role="alert">
            <Icon name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export default function CategoriesModal({ onClose }) {
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();
  const deleteCategory = useDeleteCategory();
  const { data, isLoading, isError, refetch } = useCategories(search);

  async function confirmDelete() {
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      addToast("Categoria excluída com sucesso.");
      setDeleteTarget(null);
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível excluir a categoria."),
        "error",
      );
    }
  }

  const items = data?.items || [];

  return (
    <>
      <Modal
        title="Menu de categorias"
        onClose={onClose}
        size="medium"
        footer={
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        }
      >
        <div className={styles.categories}>
          <div className={styles.categoriesToolbar}>
            <form
              className={styles.inlineSearch}
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(draftSearch);
              }}
            >
              <label className="sr-only" htmlFor="busca-categoria">
                Pesquisar categoria
              </label>
              <div className={styles.inlineSearchField}>
                <Icon name="search" size={18} />
                <input
                  id="busca-categoria"
                  type="search"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="Pesquisar categoria..."
                />
              </div>
              <Button variant="secondary" type="submit">
                Pesquisar
              </Button>
            </form>
            <Button
              iconLeft="plus"
              onClick={() => setFormState({ mode: "create" })}
            >
              Criar categoria
            </Button>
          </div>

          {isLoading ? (
            <LoadingState message="Carregando categorias..." />
          ) : isError ? (
            <ErrorState
              message="Não foi possível carregar as categorias."
              onRetry={refetch}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title={
                search
                  ? "Nenhuma categoria encontrada."
                  : "Nenhuma categoria cadastrada."
              }
              description={
                search
                  ? "Tente outro termo de pesquisa."
                  : "Crie a primeira categoria para organizar o estoque."
              }
              icon="ticket"
            />
          ) : (
            <ul className={styles.categoryList}>
              {items.map((category) => (
                <li key={category.id} className={styles.categoryItem}>
                  <div>
                    <h3 className={styles.categoryName}>{category.name}</h3>
                    <p className={styles.categoryDescription}>
                      {category.description || "Sem descrição"}
                    </p>
                    <p className={styles.categoryCount}>
                      {category.productCount}{" "}
                      {category.productCount === 1
                        ? "produto"
                        : "produtos"}{" "}
                      · {pluralizeCategory(category.name)}
                    </p>
                  </div>
                  <div className={styles.categoryActions}>
                    <Button
                      variant="secondary"
                      size="compact"
                      iconLeft="edit"
                      onClick={() =>
                        setFormState({ mode: "edit", category })
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="compact"
                      iconLeft="trash"
                      onClick={() => setDeleteTarget(category)}
                    >
                      Excluir
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {formState ? (
        <CategoryFormModal
          category={formState.category}
          onClose={() => setFormState(null)}
          onSaved={() => setFormState(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Excluir categoria"
          message={`Deseja excluir a categoria "${deleteTarget.name}"? Os produtos vinculados ficarão sem categoria.`}
          confirmLabel="Excluir"
          destructive
          loading={deleteCategory.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </>
  );
}
