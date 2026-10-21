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

export function formatCurrency(value) {
  return moeda.format(Number(value) || 0);
}

export function formatNumber(value) {
  return numero.format(Number(value) || 0);
}

export function parseCurrency(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyInput(value) {
  if (value === "" || value === null || value === undefined) return "";
  return moeda.format(Number(value) || 0).replace("R$", "").trim();
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("pt-BR");
}

export function formatTime(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "—";
  return `${formatDate(date)} às ${formatTime(date)}`;
}

export function formatDateTimeDash(value) {
  const date = toDate(value);
  if (!date) return "—";
  return `${formatDate(date)} - ${formatTime(date)}`;
}

export function formatShortDateTime(value) {
  const date = toDate(value);
  if (!date) return "—";
  return `${formatDate(date)} - ${formatTime(date)}`;
}

export function formatTodayTime(value) {
  const date = toDate(value);
  if (!date) return "—";
  const hoje = new Date();
  const mesmoDia =
    date.getDate() === hoje.getDate() &&
    date.getMonth() === hoje.getMonth() &&
    date.getFullYear() === hoje.getFullYear();
  if (mesmoDia) return `Hoje, ${formatTime(date)}`;
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function formatPeriod(start, end) {
  const inicio = toDate(start);
  const fim = toDate(end);
  if (!inicio) return "—";
  if (!fim) return formatDate(inicio);
  const mesmoMes =
    inicio.getMonth() === fim.getMonth() &&
    inicio.getFullYear() === fim.getFullYear();
  if (mesmoMes) {
    return `${inicio.getDate()}–${fim.getDate()} de ${
      MESES[inicio.getMonth()]
    } de ${inicio.getFullYear()}`;
  }
  return `${formatDate(inicio)} – ${formatDate(fim)}`;
}

export function toDateInput(value) {
  const date = toDate(value);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

export function toDateTimeInput(value) {
  const date = toDate(value);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function pluralize(word, count, plural) {
  if (Number(count) === 1) return word;
  if (plural) return plural;
  return word.endsWith("l") ? `${word}is` : `${word}s`;
}

export function pluralizeCategory(name) {
  if (!name) return "";
  if (/s$/i.test(name)) return name;
  if (/l$/i.test(name)) return `${name}is`;
  if (/m$/i.test(name)) return `${name}ns`;
  return `${name}s`;
}

export function initials(name) {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
