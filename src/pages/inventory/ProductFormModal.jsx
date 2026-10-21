import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Textarea from "../../components/Form/Textarea";
import Icon from "../../components/Icon/Icon";
import { useCategories, useCreateProduct } from "../../hooks/useInventory";
import { apiErrorMessage } from "../../services/api";
import styles from "./InventoryModals.module.css";

export default function ProductFormModal({ onClose, onCreated }) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createProduct = useCreateProduct();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: { minStock: 0 },
  });

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setServerError("Selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setImageName(file.name);
      setValue("image", reader.result);
      setServerError("");
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(values) {
    setServerError("");
    try {
      const product = await createProduct.mutateAsync({ ...values, image });
      onCreated?.(product);
    } catch (error) {
      setServerError(
        apiErrorMessage(error, "Não foi possível criar o produto."),
      );
    }
  }

  const categoryOptions = (categories?.items || []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <Modal
      title="Criar Produto"
      onClose={createProduct.isPending ? undefined : onClose}
      showClose={!createProduct.isPending}
      closeOnOverlay={!createProduct.isPending}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createProduct.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-criar-produto"
            loading={createProduct.isPending}
          >
            Criar Produto
          </Button>
        </>
      }
    >
      <form
        id="form-criar-produto"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.uploadArea}>
          <span className={styles.uploadLabel}>Imagem</span>
          <div className={styles.uploadRow}>
            <div className={styles.imagePreview}>
              {image ? (
                <img src={image} alt="Pré-visualização do produto" />
              ) : (
                <Icon name="image" size={28} />
              )}
            </div>
            <div className={styles.uploadInfo}>
              <Button
                variant="secondary"
                size="compact"
                iconLeft="upload"
                onClick={() => fileRef.current?.click()}
              >
                Upload
              </Button>
              <p className={styles.hint}>
                {imageName || "PNG, JPG ou WEBP. A imagem é opcional."}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFile}
              aria-label="Selecionar imagem do produto"
            />
            <input type="hidden" {...register("image")} />
          </div>
        </div>

        <Input
          id="produto-nome"
          label="Nome"
          placeholder="Nome do produto"
          required
          error={errors.name?.message}
          {...register("name", {
            required: "Informe o nome do produto.",
            minLength: { value: 2, message: "Informe ao menos 2 caracteres." },
          })}
        />

        <Textarea
          id="produto-descricao"
          label="Descrição"
          rows={3}
          placeholder="Descrição do produto (opcional)"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className={styles.twoColumns}>
          <Select
            id="produto-categoria"
            label="Categoria"
            placeholder={categoriesLoading ? "Carregando..." : "Selecione"}
            options={categoryOptions}
            disabled={categoriesLoading}
            required
            error={errors.categoryId?.message}
            {...register("categoryId", {
              required: "Selecione uma categoria.",
            })}
          />
          <Input
            id="produto-estoque-minimo"
            label="Estoque mínimo"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            error={errors.minStock?.message}
            {...register("minStock", {
              valueAsNumber: true,
              min: { value: 0, message: "O estoque mínimo não pode ser negativo." },
              validate: (value) =>
                Number.isInteger(value) || "Informe um número inteiro.",
            })}
          />
        </div>

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
