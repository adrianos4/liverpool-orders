import type {
  ApiError,
  Order,
  OrderRequest,
  OrderStatus,
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
      // The server may return an empty or non-JSON response.
    }

    const validationMessages = Object.values(
      apiError.validationErrors ?? {},
    );

    const message =
      validationMessages.length > 0
        ? validationMessages.join(". ")
        : apiError.message ?? `Request failed (${response.status})`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface OrderSearchParams {
  search?: string;
  status?: OrderStatus | "";
  page?: number;
  size?: number;
}

export const ordersApi = {
  getAll(params: OrderSearchParams = {}) {
    const query = new URLSearchParams({
      page: String(params.page ?? 0),
      size: String(params.size ?? 10),
    });

    if (params.search?.trim()) {
      query.set("search", params.search.trim());
    }

    if (params.status) {
      query.set("status", params.status);
    }

    return request<PageResponse<Order>>(
      `/api/v1/orders?${query.toString()}`,
    );
  },

  getById(id: string) {
    return request<Order>(`/api/v1/orders/${encodeURIComponent(id)}`);
  },

  create(data: OrderRequest) {
    return request<Order>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: OrderRequest) {
    return request<Order>(`/api/v1/orders/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<void>(`/api/v1/orders/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
