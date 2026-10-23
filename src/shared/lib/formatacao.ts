const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numero = new Intl.NumberFormat("pt-BR");

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatarMoeda(value: unknown): string {
  return moeda.format(Number(value) || 0);
}

export function formatarNumero(value: unknown): string {
  return numero.format(Number(value) || 0);
}

export function converterMoeda(value: unknown): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatarEntradaMoeda(value: unknown): string {
  if (value === "" || value === null || value === undefined) return "";
  return moeda.format(Number(value) || 0).replace("R$", "").trim();
}

function paraData(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatarData(value: unknown): string {
  const date = paraData(value);
  if (!date) return "—";
  return date.toLocaleDateString("pt-BR");
}

export function formatarHora(value: unknown): string {
  const date = paraData(value);
  if (!date) return "—";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarDataHora(value: unknown): string {
  const date = paraData(value);
  if (!date) return "—";
  return `${formatarData(date)} às ${formatarHora(date)}`;
}

export function formatarDataHoraTraco(value: unknown): string {
  const date = paraData(value);
  if (!date) return "—";
  return `${formatarData(date)} - ${formatarHora(date)}`;
}

export function formatarDataHoraCurta(value: unknown): string {
  const date = paraData(value);
  if (!date) return "—";
  return `${formatarData(date)} - ${formatarHora(date)}`;
}

export function formatarHoraHoje(value: unknown): string {
  const date = paraData(value);
  if (!date) return "—";
  const hoje = new Date();
  const mesmoDia =
    date.getDate() === hoje.getDate() &&
    date.getMonth() === hoje.getMonth() &&
    date.getFullYear() === hoje.getFullYear();
  if (mesmoDia) return `Hoje, ${formatarHora(date)}`;
  return `${formatarData(date)}, ${formatarHora(date)}`;
}

export function formatarPeriodo(start: unknown, end: unknown): string {
  const inicio = paraData(start);
  const fim = paraData(end);
  if (!inicio) return "—";
  if (!fim) return formatarData(inicio);
  const mesmoMes =
    inicio.getMonth() === fim.getMonth() &&
    inicio.getFullYear() === fim.getFullYear();
  if (mesmoMes) {
    return `${inicio.getDate()}–${fim.getDate()} de ${
      MESES[inicio.getMonth()]
    } de ${inicio.getFullYear()}`;
  }
  return `${formatarData(inicio)} – ${formatarData(fim)}`;
}

export function paraEntradaData(value: unknown): string {
  const date = paraData(value);
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

export function paraEntradaDataHora(value: unknown): string {
  const date = paraData(value);
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function pluralizar(word: string, count: number, plural?: string): string {
  if (Number(count) === 1) return word;
  if (plural) return plural;
  return word.endsWith("l") ? `${word}is` : `${word}s`;
}

export function pluralizarCategoria(name: string | null | undefined): string {
  if (!name) return "";
  if (/s$/i.test(name)) return name;
  if (/l$/i.test(name)) return `${name}is`;
  if (/m$/i.test(name)) return `${name}ns`;
  return `${name}s`;
}

export function iniciais(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
