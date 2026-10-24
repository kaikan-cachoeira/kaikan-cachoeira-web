import { useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import Entrada from "@/shared/components/Formulario/Entrada";
import Selecao from "@/shared/components/Formulario/Selecao";
import ControleSegmentado from "@/shared/components/Formulario/ControleSegmentado";
import AreaTexto from "@/shared/components/Formulario/AreaTexto";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import Icone from "@/shared/components/Icone/Icone";
import { useEventoMutations } from "../hooks/useEventos";
import { useProdutosQuery } from "@/features/inventario";
import type { Categoria } from "@/features/inventario";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { formatarNumero } from "@/shared/lib/formatacao";
import type {
  AdicionarProdutoCardapioPayload,
  ItemCardapio,
  AtualizarProdutoCardapioPayload,
} from "../models";
import styles from "./AdicionarProdutoCardapioModal.module.css";

const TYPE_OPTIONS = [
  { value: "ready", label: "Produto pronto" },
  { value: "made", label: "Produto feito na hora" },
];

interface AdicionarProdutoCardapioModalProps {
  eventId: string;
  item?: ItemCardapio;
  categories?: Categoria[];
  initialType?: "ready" | "made";
  onClose: () => void;
}

interface ProdutoCardapioFormValues {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  description: string;
  category: string;
  ingredientCost: number;
}

export default function AdicionarProdutoCardapioModal({
  eventId,
  item,
  categories = [],
  initialType = "ready",
  onClose,
}: AdicionarProdutoCardapioModalProps) {
  const isEdit = Boolean(item);
  const [type, setType] = useState<"ready" | "made">(
    item?.type ?? initialType,
  );
  const [serverError, setServerError] = useState("");
  const [image, setImage] = useState<string | null>(item?.image ?? null);
  const [imageName, setImageName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const {
    adicionarProduto: addProduct,
    atualizarProduto: updateProduct,
  } = useEventoMutations();
  const mutation = isEdit ? updateProduct : addProduct;
  const { data: productsData, isLoading: productsLoading } = useProdutosQuery({
    pageSize: 100,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProdutoCardapioFormValues>({
    mode: "onTouched",
    defaultValues: {
      productId: item?.productId ?? "",
      quantity: item?.expected ?? 1,
      price: item?.price ?? 0,
      name: item?.name ?? "",
      description: item?.description ?? "",
      category: item?.category ?? "",
      ingredientCost: item?.unitCost ?? 0,
    },
  });

  const selectedProductId = watch("productId");
  const selectedProduct = (productsData?.items || []).find(
    (product) => product.id === selectedProductId,
  );
  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  function changeType(nextType: string) {
    setType(nextType as "ready" | "made");
    setServerError("");
    setImage(null);
    setImageName("");
    reset({
      productId: "",
      quantity: 1,
      price: 0,
      name: "",
      description: "",
      category: "",
      ingredientCost: 0,
    });
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setServerError("Selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
      setImageName(file.name);
      setServerError("");
    };
    reader.readAsDataURL(file);
  }

  const onSubmit: SubmitHandler<ProdutoCardapioFormValues> = async (values) => {
    setServerError("");
    if (item) {
      const payload: AtualizarProdutoCardapioPayload =
        item.type === "ready"
          ? {
              type: "ready",
              productId: item.productId ?? undefined,
              quantity: values.quantity,
              price: values.price,
            }
          : {
              type: "made",
              name: values.name,
              description: values.description,
              category: values.category,
              price: values.price,
              ingredientCost: values.ingredientCost,
              image,
            };
      try {
        await updateProduct.mutateAsync({
          eventId,
          itemId: item.id,
          payload,
        });
        addToast("Produto atualizado no cardápio.");
        onClose();
      } catch (error) {
        setServerError(
          mensagemErro(error, "Não foi possível atualizar o produto."),
        );
      }
      return;
    }

    const payload: AdicionarProdutoCardapioPayload = {
      type,
      price: values.price,
      name: values.name,
      category: values.category,
    };

    if (type === "ready") {
      if (!selectedProduct) {
        setServerError("Selecione um produto do estoque.");
        return;
      }
      Object.assign(payload, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        description: selectedProduct.description || "",
        category: selectedProduct.category,
        quantity: values.quantity,
        image: selectedProduct.image || null,
      });
    } else {
      Object.assign(payload, {
        name: values.name,
        description: values.description,
        category: values.category,
        ingredientCost: values.ingredientCost,
        image,
      });
    }

    try {
      await addProduct.mutateAsync({ id: eventId, payload });
      addToast("Produto adicionado ao cardápio do evento.");
      onClose?.();
    } catch (error) {
      setServerError(
        mensagemErro(
          error,
          "Não foi possível adicionar o produto ao evento.",
        ),
      );
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar produto do cardápio" : "Adicionar produto ao evento"}
      subtitle={
        isEdit
          ? "Atualize os dados do produto no cardápio do evento"
          : "Adiciona o produto no cardápio do evento para venda no baiten"
      }
      onClose={mutation.isPending ? undefined : onClose}
      showClose={!mutation.isPending}
      closeOnOverlay={!mutation.isPending}
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-cardapio"
            loading={mutation.isPending}
          >
            {isEdit ? "Salvar alterações" : "Registrar"}
          </Botao>
        </>
      }
    >
      <form
        id="form-cardapio"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {isEdit ? (
          <p className={styles.hintBox}>
            Tipo do produto:{" "}
            {type === "ready" ? "Produto pronto do estoque" : "Feito na hora"}
          </p>
        ) : (
          <ControleSegmentado
            label="Tipo de produto"
            options={TYPE_OPTIONS}
            value={type}
            onChange={changeType}
            columns={2}
          />
        )}

        {type === "ready" ? (
          <>
            {item ? (
              <p className={styles.hintBox}>
                Produto: {item.name} · Categoria: {item.category}
              </p>
            ) : (
              <Selecao
                id="cardapio-produto"
                label="Produto / item"
                placeholder={
                  productsLoading ? "Carregando..." : "Selecionar produto"
                }
                options={(productsData?.items || []).map((product) => ({
                  value: product.id,
                  label: `${product.name} (${formatarNumero(product.quantity)} un.)`,
                }))}
                disabled={productsLoading}
                required
                error={errors.productId?.message}
                {...register("productId", {
                  required: "Selecione um produto do estoque.",
                })}
              />
            )}
            <div className={styles.twoColumns}>
              <Entrada
                id="cardapio-quantidade"
                label="Quantidade"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                required
                error={errors.quantity?.message}
                {...register("quantity", {
                  valueAsNumber: true,
                  validate: (value) => {
                    if (!Number.isInteger(value) || value <= 0) {
                      return "Informe uma quantidade inteira maior que zero.";
                    }
                    if (
                      !item &&
                      selectedProduct &&
                      value > Number(selectedProduct.quantity)
                    ) {
                      return "A quantidade não pode ser maior que o estoque disponível.";
                    }
                    return true;
                  },
                })}
              />
              <Controller
                name="price"
                control={control}
                rules={{
                  validate: (value) =>
                    Number(value) > 0 ||
                    "Informe um preço de venda maior que zero.",
                }}
                render={({ field, fieldState }) => (
                  <CampoMoeda
                    id="cardapio-preco"
                    label="Preço de venda"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    required
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            {selectedProduct && !item ? (
              <p className={styles.hintBox}>
                Estoque disponível: {formatarNumero(selectedProduct.quantity)}{" "}
                unidades · Categoria:{" "}
                {selectedProduct.category || "Sem categoria"}
              </p>
            ) : null}
          </>
        ) : (
          <>
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
                    Selecionar imagem
                  </Botao>
                  <p className={styles.uploadHint}>
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
              </div>
            </div>

            <Entrada
              id="cardapio-nome"
              label="Nome"
              placeholder="Nome do produto"
              required
              error={errors.name?.message}
              {...register("name", {
                required: "Informe o nome do produto.",
                minLength: {
                  value: 2,
                  message: "Informe ao menos 2 caracteres.",
                },
              })}
            />

            <AreaTexto
              id="cardapio-descricao"
              label="Descrição"
              rows={3}
              placeholder="Descrição do produto (opcional)"
              error={errors.description?.message}
              {...register("description")}
            />

            <Selecao
              id="cardapio-categoria"
              label="Categoria"
              placeholder="Selecione"
              options={categoryOptions}
              required
              error={errors.category?.message}
              {...register("category", {
                required: "Selecione uma categoria.",
              })}
            />

            <div className={styles.twoColumns}>
              <Controller
                name="price"
                control={control}
                rules={{
                  validate: (value) =>
                    Number(value) >= 0 || "O preço não pode ser negativo.",
                }}
                render={({ field, fieldState }) => (
                  <CampoMoeda
                    id="cardapio-preco-feito"
                    label="Preço de venda"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="ingredientCost"
                control={control}
                rules={{
                  validate: (value) =>
                    Number(value) >= 0 ||
                    "O custo dos ingredientes não pode ser negativo.",
                }}
                render={({ field, fieldState }) => (
                  <CampoMoeda
                    id="cardapio-custo"
                    label="Custo total dos ingredientes"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </>
        )}

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
