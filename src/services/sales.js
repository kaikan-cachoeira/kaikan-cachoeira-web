import api from "./api";

export async function listSales(params = {}) {
  const { data } = await api.get("/sales", { params });
  return data;
}

export async function createSale(payload) {
  const { data } = await api.post("/sales", payload);
  return data;
}

export async function cancelSale(id) {
  const { data } = await api.patch(`/sales/${id}/cancel`);
  return data;
}
