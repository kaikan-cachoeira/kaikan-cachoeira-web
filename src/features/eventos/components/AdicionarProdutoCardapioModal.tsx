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
import { useProdutosQuery, useCategoriasQuery } from "@/features/inventario";
import { resolverUrlApi } from "@/shared/api/urls";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { formatarNumero } from "@/shared/lib/formatacao";
import type {
  AdicionarProdutoCardapioPayload,
  ItemCardapio,
  OrigemProdutoEvento,
} from "../models";
import styles from "./AdicionarProdutoCardapioModal.module.css";

const ORIGEM_OPTIONS = [
  { value: "ESTOQUE", label: "Produto do estoque" },
  { value: "PRODUZIDO", label: "Produzido no evento" },
];

const MIME_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"]);

interface AdicionarProdutoCardapioModalProps {
  eventId: number;
  item?: ItemCardapio;
  initialType?: OrigemProdutoEvento;
  onClose: () => void;
}

interface ProdutoCardapioFormValues {
  productId: string;
  quantidadePrevista: number;
  precoVenda: number;
  nome: string;
  descricao: string;
  categoria: string;
  custoTotalIngredientes: number;
}

export default function AdicionarProdutoCardapioModal({
  eventId,
  item,
  initialType = "ESTOQUE",
  onClose,
}: AdicionarProdutoCardapioModalProps) {
  const isEdit = Boolean(item);
  const [origem, setOrigem] = useState<OrigemProdutoEvento>(
    item?.origem ?? initialType,
  );
  const [serverError, setServerError] = useState("");
  const [image, setImage] = useState<string | null>(
    resolverUrlApi(item?.fotoUrl) ?? null,
  );
  const [imageName, setImageName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const {
    adicionarProduto: addProduct,
    atualizarProduto: updateProduct,
    enviarFoto,
  } = useEventoMutations();
  const { data: productsData, isLoading: productsLoading } = useProdutosQuery({
    pageSize: 100,
  });
  const { data: categoriasData } = useCategoriasQuery("");
  const categorias = (categoriasData?.items ?? []).map((c) => c.nome);

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
      productId: item?.produtoId ? String(item.produtoId) : "",
      quantidadePrevista: item?.quantidadePrevista ?? 1,
      precoVenda: item?.precoVenda ?? 0,
      nome: item?.nome ?? "",
      descricao: item?.descricao ?? "",
      categoria: item?.categoria ?? "",
      custoTotalIngredientes: item?.custoTotalIngredientes ?? 0,
    },
  });

  const selectedProductId = watch("productId");
  const selectedProduct = (productsData?.items || []).find(
    (product) => String(product.id) === selectedProductId,
  );
  const categoryOptions = [
    { value: "", label: "Sem categoria" },
    ...categorias.map((categoria) => ({
      value: categoria,
      label: categoria,
    })),
  ];
  const carregando = salvando || addProduct.isPending || updateProduct.isPending;

  function changeOrigem(nextOrigem: string) {
    const novaOrigem = nextOrigem as OrigemProdutoEvento;
    setOrigem(novaOrigem);
    setServerError("");
    setImage(null);
    setImageName("");
    setFile(null);
    reset({
      productId: "",
      quantidadePrevista: 1,
      precoVenda: 0,
      nome: "",
      descricao: "",
      categoria: "",
      custoTotalIngredientes: 0,
    });
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!MIME_PERMITIDOS.has(selected.type)) {
      setServerError("Selecione uma imagem PNG, JPG ou WEBP.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
      setImageName(selected.name);
      setFile(selected);
      setServerError("");
    };
    reader.readAsDataURL(selected);
  }

  function montarPayload(values: ProdutoCardapioFormValues) {
    if (origem === "ESTOQUE") {
      const produtoId = item?.produtoId ?? Number(selectedProduct?.id);
      if (!Number.isInteger(produtoId) || produtoId <= 0) {
        setServerError(
          "Selecione um produto do estoque com identificador válido.",
        );
        return null;
      }

      const payload: AdicionarProdutoCardapioPayload = {
        origem: "ESTOQUE",
        produtoId,
        precoVenda: values.precoVenda,
        quantidadePrevista: values.quantidadePrevista,
      };
      return payload;
    }

    const payload: AdicionarProdutoCardapioPayload = {
      origem: "PRODUZIDO",
      nome: values.nome.trim(),
      descricao: values.descricao.trim() || undefined,
      categoria: values.categoria.trim() || undefined,
      precoVenda: values.precoVenda,
      custoTotalIngredientes: values.custoTotalIngredientes,
    };
    return payload;
  }

  const onSubmit: SubmitHandler<ProdutoCardapioFormValues> = async (values) => {
    setServerError("");
    const payload = montarPayload(values);
    if (!payload) return;

    setSalvando(true);
    let salvo: ItemCardapio;
    try {
      if (item) {
        salvo = await updateProduct.mutateAsync({
          eventId,
          itemId: item.id,
          payload,
        });
      } else {
        salvo = await addProduct.mutateAsync({ id: eventId, payload });
      }
    } catch (error) {
      setSalvando(false);
      setServerError(
        mensagemErro(
          error,
          item
            ? "Não foi possível atualizar o produto."
            : "Não foi possível adicionar o produto ao evento.",
        ),
      );
      return;
    }

    if (file) {
      try {
        await enviarFoto.mutateAsync({
          eventId,
          itemId: salvo.id,
          arquivo: file,
        });
      } catch (error) {
        setSalvando(false);
        addToast(
          mensagemErro(
            error,
            "Produto salvo, mas não foi possível enviar a foto.",
          ),
          "error",
        );
        onClose();
        return;
      }
    }

    setSalvando(false);
    addToast(
      item
        ? "Produto atualizado no cardápio."
        : "Produto adicionado ao cardápio do evento.",
    );
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Editar produto do cardápio" : "Adicionar produto ao evento"}
      subtitle={
        isEdit
          ? "Atualize os dados do produto no cardápio do evento"
          : "Adiciona o produto no cardápio do evento para venda no baiten"
      }
      onClose={carregando ? undefined : onClose}
      showClose={!carregando}
      closeOnOverlay={!carregando}
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={carregando}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-cardapio"
            loading={carregando}
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
            Origem do produto:{" "}
            {origem === "ESTOQUE"
              ? "Produto do estoque"
              : "Produzido no evento"}
          </p>
        ) : (
          <ControleSegmentado
            label="Origem do produto"
            options={ORIGEM_OPTIONS}
            value={origem}
            onChange={changeOrigem}
            columns={2}
          />
        )}

        {origem === "ESTOQUE" ? (
          <>
            {item ? (
              <p className={styles.hintBox}>
                Produto: {item.nome} · Categoria:{" "}
                {item.categoria || "Sem categoria"}
              </p>
            ) : (
              <Selecao
                id="cardapio-produto"
                label="Produto / item"
                placeholder={
                  productsLoading ? "Carregando..." : "Selecionar produto"
                }
                options={(productsData?.items || []).map((product) => ({
                  value: String(product.id),
                  label: `${product.nome} (${formatarNumero(product.quantidadeAtual)} un.)`,
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
                label="Quantidade prevista"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                required
                error={errors.quantidadePrevista?.message}
                {...register("quantidadePrevista", {
                  valueAsNumber: true,
                  validate: (value) => {
                    if (!Number.isInteger(value) || value <= 0) {
                      return "Informe uma quantidade inteira maior que zero.";
                    }
                    if (
                      !item &&
                      selectedProduct &&
                      value > Number(selectedProduct.quantidadeAtual)
                    ) {
                      return "A quantidade não pode ser maior que o estoque disponível.";
                    }
                    return true;
                  },
                })}
              />
              <Controller
                name="precoVenda"
                control={control}
                rules={{
                  validate: (value) =>
                    Number(value) > 0 ||
                    "Informe um preço de venda maior que zero.",
                }}
                render={({ field, fieldState }) => (
                  <CampoMoeda
                    id="cardapio-preco-estoque"
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
                Estoque disponível: {formatarNumero(selectedProduct.quantidadeAtual)}{" "}
                unidades · Categoria:{" "}
                {selectedProduct.categoria?.nome || "Sem categoria"}
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
                  accept="image/png,image/jpeg,image/webp"
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
              error={errors.nome?.message}
              {...register("nome", {
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
              error={errors.descricao?.message}
              {...register("descricao")}
            />

            <Selecao
              id="cardapio-categoria"
              label="Categoria"
              placeholder="Selecione"
              options={categoryOptions}
              error={errors.categoria?.message}
              {...register("categoria")}
            />

            <div className={styles.twoColumns}>
              <Controller
                name="precoVenda"
                control={control}
                rules={{
                  validate: (value) =>
                    Number(value) >= 0 || "O preço não pode ser negativo.",
                }}
                render={({ field, fieldState }) => (
                  <CampoMoeda
                    id="cardapio-preco-produzido"
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
                name="custoTotalIngredientes"
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
