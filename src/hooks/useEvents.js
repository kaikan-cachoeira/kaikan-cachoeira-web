import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMenuProduct,
  changeEventStatus,
  createEvent,
  createEventCost,
  deleteEvent,
  getEvent,
  getEventMenu,
  getOngoingEvent,
  listEventSales,
  listEvents,
} from "../services/events";

export function useEvents(params) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => listEvents(params),
  });
}

export function useOngoingEvent() {
  return useQuery({
    queryKey: ["events", "ongoing"],
    queryFn: getOngoingEvent,
  });
}

export function useEvent(id) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
  });
}

export function useEventMenu(id) {
  return useQuery({
    queryKey: ["event-menu", id],
    queryFn: () => getEventMenu(id),
    enabled: Boolean(id),
  });
}

export function useEventSales(id, params) {
  return useQuery({
    queryKey: ["sales", "event", id, params],
    queryFn: () => listEventSales(id, params),
    enabled: Boolean(id),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useChangeEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => changeEventStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      queryClient.invalidateQueries({ queryKey: ["fiados"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useCreateEventCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => createEventCost(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useAddMenuProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => addMenuProduct(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-menu", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
