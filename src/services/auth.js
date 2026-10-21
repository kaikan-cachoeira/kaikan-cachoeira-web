import api from "./api";

export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function requestPasswordRecovery(email) {
  const { data } = await api.post("/auth/recover", { email });
  return data;
}
