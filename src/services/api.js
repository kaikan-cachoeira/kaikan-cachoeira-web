import axios from "axios";
import { demoAdapter } from "./demo/adapter";

export const isDemoMode = import.meta.env.VITE_DEMO_MODE !== "false";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

if (isDemoMode) {
  api.defaults.adapter = demoAdapter;
}

api.interceptors.request.use((config) => {
  const session = window.localStorage.getItem("kaikan-cachoeira-session");
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      // Sessão inválida é descartada pelo fluxo de autenticação.
    }
  }
  return config;
});

export function apiErrorMessage(
  error,
  fallback = "Não foi possível concluir a operação. Tente novamente.",
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export default api;
