import axios from "axios";
import { demoAdapter } from "./demo/adaptador";

export const modoDemoAtivo = import.meta.env.VITE_DEMO_MODE === "true";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

if (modoDemoAtivo) {
  api.defaults.adapter = demoAdapter;
}

let tokenAtual: string | null = null;

export function definirToken(token: string | null) {
  tokenAtual = token;
}

api.interceptors.request.use((config) => {
  if (tokenAtual) {
    config.headers.Authorization = `Bearer ${tokenAtual}`;
  }
  return config;
});

export default api;
