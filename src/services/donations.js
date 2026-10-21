import api from "./api";

export async function listDonations(params = {}) {
  const { data } = await api.get("/donations", { params });
  return data;
}

export async function createDonation(payload) {
  const { data } = await api.post("/donations", payload);
  return data;
}
