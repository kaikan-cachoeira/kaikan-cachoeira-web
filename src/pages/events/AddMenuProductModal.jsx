import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import SegmentedControl from "../../components/Form/SegmentedControl";
import Textarea from "../../components/Form/Textarea";
import CurrencyInput from "../../components/Form/CurrencyInput";
import Icon from "../../components/Icon/Icon";
import { useAddMenuProduct } from "../../hooks/useEvents";
import { useProducts } from "../../hooks/useInventory";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../services/api";
import { formatNumber } from "../../utils/format";
import styles from "./AddMenuProductModal.module.css";

const TYPE_OPTIONS = [
  { value: "ready", label: "Produto pronto" },
  { value: "made", label: "Produto feito na hora" },
];

export default function AddMenuProductModal({
  eventId,
  categories = [],
  initialType = "ready",
  onClose,
}) {
  const [type, setType] = useState(initialType);
  const [serverError, setServerError] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const fileRef = useRef(null);
  const { addToast } = useToast();
  const addProduct = useAddMenuProduct();
  const { data: productsData, isLoading: productsLoading } = useProducts({
    pageSize: 100,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      productId: "",
      quantity: 1,
      price: 0,
      name: "",
      description: "",
      category: "",
      ingredientCost: 0,
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

  function changeType(nextType) {
    setType(nextType);
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
      setServerError("");
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(values) {
    setServerError("");
    const payload = { type, price: values.price };

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
        apiErrorMessage(
          error,
          "Não foi possível adicionar o produto ao evento.",
        ),
      );
    }
  }

  return (
    <Modal
      title="Adicionar produto ao evento"
      subtitle="Adiciona o produto no cardápio do evento para venda no baiten"
      onClose={addProduct.isPending ? undefined : onClose}
      showClose={!addProduct.isPending}
      closeOnOverlay={!addProduct.isPending}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={addProduct.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-cardapio"
            loading={addProduct.isPending}
          >
            Registrar
          </Button>
        </>
      }
    >
      <form
        id="form-cardapio"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <SegmentedControl
          label="Tipo de produto"
          options={TYPE_OPTIONS}
          value={type}
          onChange={changeType}
          columns={2}
        />

        {type === "ready" ? (
          <>
            <Select
              id="cardapio-produto"
              label="Produto / item"
              placeholder={
                productsLoading ? "Carregando..." : "Selecionar produto"
              }
              options={(productsData?.items || []).map((product) => ({
                value: product.id,
                label: `${product.name} (${formatNumber(product.quantity)} un.)`,
              }))}
              disabled={productsLoading}
              required
              error={errors.productId?.message}
              {...register("productId", {
                required: "Selecione um produto do estoque.",
              })}
            />
            <div className={styles.twoColumns}>
              <Input
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
                  <CurrencyInput
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
            {selectedProduct ? (
              <p className={styles.hintBox}>
                Estoque disponível: {formatNumber(selectedProduct.quantity)}{" "}
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
                    Selecionar imagem
                  </Button>
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

            <Input
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

            <Textarea
              id="cardapio-descricao"
              label="Descrição"
              rows={3}
              placeholder="Descrição do produto (opcional)"
              error={errors.description?.message}
              {...register("description")}
            />

            <Select
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
                  <CurrencyInput
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
                  <CurrencyInput
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
            <Icon name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
