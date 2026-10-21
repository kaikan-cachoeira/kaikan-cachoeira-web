import api from "./api";

export async function listCash(params = {}) {
  const { data } = await api.get("/cash", { params });
  return data;
}

export async function createCashEntry(payload) {
  const { data } = await api.post("/cash", payload);
  return data;
}

export async function cancelCashEntry(id) {
  const { data } = await api.delete(`/cash/${id}`);
  return data;
}

export async function listFiados(params = {}) {
  const { data } = await api.get("/fiados", { params });
  return data;
}

export async function settleFiado(id, payload) {
  const { data } = await api.post(`/fiados/${id}/settle`, payload);
  return data;
}

export async function unsettleFiado(id) {
  const { data } = await api.patch(`/fiados/${id}/unsettle`);
  return data;
}
