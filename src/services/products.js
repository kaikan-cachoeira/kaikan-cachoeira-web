import api from "./api";

export async function listProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data;
}

export async function getProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post("/products", payload);
  return data;
}

export async function createMovement(productId, payload) {
  const { data } = await api.post(`/products/${productId}/movements`, payload);
  return data;
}
