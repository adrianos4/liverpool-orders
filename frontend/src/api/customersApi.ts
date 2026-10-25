import type {
  ApiError,
  Customer,
  PageResponse,
} from "../types/order";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let apiError: ApiError = {};

    try {
      apiError = (await response.json()) as ApiError;
    } catch {
      // Keep the fallback error message.
    }

    const validationMessages = Object.values(
      apiError.validationErrors ?? {},
    );

    throw new Error(
      validationMessages.length
        ? validationMessages.join(". ")
        : apiError.message ?? `Request failed (${response.status})`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface CustomerRequest {
  firstName: string;
  lastName: string;
  motherLastName: string;
  email: string;
}

export const customersApi = {
  getAll(search = "", page = 0, size = 10) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    return request<PageResponse<Customer>>(
      `/api/v1/customers?${params.toString()}`,
    );
  },

  getById(id: string) {
    return request<Customer>(
      `/api/v1/customers/${encodeURIComponent(id)}`,
    );
  },

  create(data: CustomerRequest) {
    return request<Customer>("/api/v1/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: CustomerRequest) {
    return request<Customer>(
      `/api/v1/customers/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  delete(id: string) {
    return request<void>(
      `/api/v1/customers/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
};