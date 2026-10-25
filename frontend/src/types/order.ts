export type OrderStatus =
  | "CREATED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderSource = "WEB" | "APP";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  motherLastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  references: string;
}

export interface OrderItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  source: OrderSource;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRequest {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRequest {
  customerId: string;
  shippingAddress: ShippingAddress;
  items: OrderItemRequest[];
  source: OrderSource;
  status?: OrderStatus;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  validationErrors?: Record<string, string>;
}
