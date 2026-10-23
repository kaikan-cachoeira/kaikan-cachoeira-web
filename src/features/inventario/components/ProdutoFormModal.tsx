import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { mensagemErro } from "@/shared/api/erros";
import Botao from "@/shared/components/Botao/Botao";
import AreaTexto from "@/shared/components/Formulario/AreaTexto";
import Entrada from "@/shared/components/Formulario/Entrada";
import Selecao from "@/shared/components/Formulario/Selecao";
import Icone from "@/shared/components/Icone/Icone";
import Modal from "@/shared/components/Modal/Modal";
import type { Produto } from "../models";
import {
  useCategoriasQuery,
  useProdutoMutations,
} from "../hooks/useInventario";
import styles from "./ModaisInventario.module.css";

interface ProdutoFormValues {
  name: string;
  description?: string;
  categoryId: string;
  minStock: number;
  image?: string | null;
}

interface ProdutoFormModalProps {
  onClose: () => void;
  onCreated: (produto: Produto) => void;
}

export default function ProdutoFormModal({
  onClose,
  onCreated,
}: ProdutoFormModalProps) {
  const { data: categories, isLoading: categoriesLoading } =
    useCategoriasQuery();
  const { criarProduto } = useProdutoMutations();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProdutoFormValues>({
    mode: "onTouched",
    defaultValues: { minStock: 0 },
  });

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setServerError("Selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setImage(reader.result);
      setImageName(file.name);
      setValue("image", reader.result);
      setServerError("");
    };
    reader.readAsDataURL(file);
  }

  const onSubmit: SubmitHandler<ProdutoFormValues> = async (values) => {
    setServerError("");
    try {
      const product = await criarProduto.mutateAsync({ ...values, image });
      onCreated(product);
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível criar o produto."),
      );
    }
  };

  const categoryOptions = (categories?.items || []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <Modal
      title="Criar Produto"
      onClose={criarProduto.isPending ? undefined : onClose}
      showClose={!criarProduto.isPending}
      closeOnOverlay={!criarProduto.isPending}
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={criarProduto.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-criar-produto"
            loading={criarProduto.isPending}
          >
            Criar Produto
          </Botao>
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
                <Icone name="image" size={28} />
              )}
            </div>
            <div className={styles.uploadInfo}>
              <Botao
                variant="secondary"
                size="compact"
                iconLeft="upload"
                onClick={() => fileRef.current?.click()}
              >
                Upload
              </Botao>
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

        <Entrada
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

        <AreaTexto
          id="produto-descricao"
          label="Descrição"
          rows={3}
          placeholder="Descrição do produto (opcional)"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className={styles.twoColumns}>
          <Selecao
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
          <Entrada
            id="produto-estoque-minimo"
            label="Estoque mínimo"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            error={errors.minStock?.message}
            {...register("minStock", {
              valueAsNumber: true,
              min: {
                value: 0,
                message: "O estoque mínimo não pode ser negativo.",
              },
              validate: (value) =>
                Number.isInteger(value) || "Informe um número inteiro.",
            })}
          />
        </div>

        {serverError ? (
          <p className={styles.serverError} role="alert">
            <Icone name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
