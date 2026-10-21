import api from "./api";

export async function listEvents(params = {}) {
  const { data } = await api.get("/events", { params });
  return data;
}

export async function getOngoingEvent() {
  const { data } = await api.get("/events/ongoing");
  return data.event;
}

export async function getEvent(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

export async function createEvent(payload) {
  const { data } = await api.post("/events", payload);
  return data;
}

export async function changeEventStatus(id, status) {
  const { data } = await api.patch(`/events/${id}/status`, { status });
  return data;
}

export async function deleteEvent(id) {
  const { data } = await api.delete(`/events/${id}`);
  return data;
}

export async function createEventCost(id, payload) {
  const { data } = await api.post(`/events/${id}/costs`, payload);
  return data;
}

export async function getEventMenu(id) {
  const { data } = await api.get(`/events/${id}/menu`);
  return data;
}

export async function addMenuProduct(id, payload) {
  const { data } = await api.post(`/events/${id}/menu`, payload);
  return data;
}

export async function listEventSales(id, params = {}) {
  const { data } = await api.get("/sales", {
    params: { ...params, eventId: id },
  });
  return data;
}
