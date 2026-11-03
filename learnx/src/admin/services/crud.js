import { apiRequest } from "./api";

export const getAll = (endpoint) =>
  apiRequest(`/${endpoint}/`);

export const getOne = (endpoint, id) =>
  apiRequest(`/${endpoint}/${id}/`);

export const create = (endpoint, data) =>
  apiRequest(`/${endpoint}/`, {
    method: "POST",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

export const update = (endpoint, id, data) =>
  apiRequest(`/${endpoint}/${id}/`, {
    method: "PUT",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

export const patch = (endpoint, id, data) =>
  apiRequest(`/${endpoint}/${id}/`, {
    method: "PATCH",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

export const remove = (endpoint, id) =>
  apiRequest(`/${endpoint}/${id}/`, {
    method: "DELETE",
  });