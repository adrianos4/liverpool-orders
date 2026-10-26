import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { customersApi } from "./api/customersApi";
import { ordersApi } from "./api/ordersApi";
import type {
  Customer,
  Order,
  OrderRequest,
  OrderSource,
  OrderStatus,
  ShippingAddress,
} from "./types/order";
import CustomersPage from "./components/CustomerPage";
import "./App.css";

const PAGE_SIZE = 10;

const EMPTY_ADDRESS: ShippingAddress = {
  street: "",
  exteriorNumber: "",
  interiorNumber: "",
  neighborhood: "",
  city: "Ciudad de Mexico",
  state: "CDMX",
  postalCode: "",
  references: "",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: "Creado",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_OPTIONS: OrderStatus[] = [
  "CREATED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function customerName(customer: Customer) {
  return [
    customer.firstName,
    customer.lastName,
    customer.motherLastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface ItemForm {
  productCode: string;
  productName: string;
  quantity: string;
  unitPrice: string;
}

const EMPTY_ITEM: ItemForm = {
  productCode: "",
  productName: "",
  quantity: "1",
  unitPrice: "",
};

interface OrderFormProps {
  order: Order | null;
  customers: Customer[];
  onClose: () => void;
  onSaved: (order: Order) => void;
}

function OrderForm({ order, customers, onClose, onSaved }: OrderFormProps) {
  const [customerId, setCustomerId] = useState(order?.customer.id ?? "");
  const [source, setSource] = useState<OrderSource>(order?.source ?? "WEB");
  const [status, setStatus] = useState<OrderStatus>(
    order?.status ?? "CREATED",
  );
  const [address, setAddress] = useState<ShippingAddress>(
    order?.shippingAddress ?? { ...EMPTY_ADDRESS },
  );
  const [items, setItems] = useState<ItemForm[]>(
    order?.items.map((item) => ({
      productCode: item.productCode,
      productName: item.productName,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })) ?? [{ ...EMPTY_ITEM }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const estimatedTotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.unitPrice);

    if (
      Number.isFinite(quantity) &&
      Number.isFinite(price) &&
      quantity > 0 &&
      price > 0
    ) {
      return total + quantity * price;
    }

    return total;
  }, 0);

  function updateAddress(
    field: keyof ShippingAddress,
    value: string,
  ) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function updateItem(
    index: number,
    field: keyof ItemForm,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [...current, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!customerId) {
      setError("Selecciona un cliente para el pedido.");
      return;
    }

    if (items.length === 0) {
      setError("Agrega al menos un producto.");
      return;
    }

    const parsedItems = items.map((item) => ({
      productCode: item.productCode.trim(),
      productName: item.productName.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

    if (
      parsedItems.some(
        (item) =>
          !item.productCode ||
          !item.productName ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice <= 0,
      )
    ) {
      setError(
        "Revisa los productos: completa sus datos y usa cantidades y precios válidos.",
      );
      return;
    }

    const payload: OrderRequest = {
      customerId,
      shippingAddress: address,
      items: parsedItems,
      source,
      status,
    };

    setSaving(true);

    try {
      const saved = order
        ? await ordersApi.update(order.id, payload)
        : await ordersApi.create(payload);

      onSaved(saved);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  const addressFields: {
    key: keyof ShippingAddress;
    label: string;
    required?: boolean;
  }[] = [
    { key: "street", label: "Calle", required: true },
    { key: "exteriorNumber", label: "Número exterior", required: true },
    { key: "interiorNumber", label: "Número interior" },
    { key: "neighborhood", label: "Colonia", required: true },
    { key: "city", label: "Ciudad", required: true },
    { key: "state", label: "Estado", required: true },
    { key: "postalCode", label: "Código postal", required: true },
    { key: "references", label: "Referencias", required: true },
  ];

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        className="order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-form-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {order ? "ACTUALIZAR PEDIDO" : "NUEVO PEDIDO"}
            </span>
            <h2 id="order-form-title">
              {order ? order.orderNumber : "Crear pedido"}
            </h2>
            <p>Completa la información del pedido y su entrega.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar formulario"
            disabled={saving}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-section">
            <h3>Información general</h3>

            <div className="form-grid">
              <label className="field field-full">
                Cliente *
                <select
                  required
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                >
                  <option value="">Seleccionar cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customerName(customer)} — {customer.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                Canal de venta *
                <select
                  value={source}
                  onChange={(event) =>
                    setSource(event.target.value as OrderSource)
                  }
                >
                  <option value="WEB">Sitio web</option>
                  <option value="APP">Aplicación móvil</option>
                </select>
              </label>

              <label className="field">
                Estado *
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as OrderStatus)
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {STATUS_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Dirección de entrega</h3>
            <div className="form-grid">
              {addressFields.map(({ key, label, required }) => (
                <label
                  className={`field ${
                    key === "references" ? "field-full" : ""
                  }`}
                  key={key}
                >
                  {label} {required ? "*" : ""}
                  <input
                    required={required}
                    value={address[key]}
                    onChange={(event) => updateAddress(key, event.target.value)}
                    maxLength={key === "references" ? 250 : 100}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="section-heading-row">
              <div>
                <h3>Productos</h3>
                <p>Agrega los artículos incluidos en el pedido.</p>
              </div>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={addItem}
              >
                <Plus size={16} />
                Agregar producto
              </button>
            </div>

            <div className="item-form-list">
              {items.map((item, index) => (
                <div className="item-form-row" key={index}>
                  <label className="field">
                    Código *
                    <input
                      required
                      value={item.productCode}
                      onChange={(event) =>
                        updateItem(index, "productCode", event.target.value)
                      }
                      maxLength={60}
                    />
                  </label>

                  <label className="field">
                    Producto *
                    <input
                      required
                      value={item.productName}
                      onChange={(event) =>
                        updateItem(index, "productName", event.target.value)
                      }
                      maxLength={150}
                    />
                  </label>

                  <label className="field">
                    Cantidad *
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                    />
                  </label>

                  <label className="field">
                    Precio unitario *
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItem(index, "unitPrice", event.target.value)
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="icon-button remove-item"
                    aria-label={`Eliminar producto ${index + 1}`}
                    disabled={items.length === 1}
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            <div className="estimated-total">
              <span>Total estimado</span>
              <strong>{formatCurrency(estimatedTotal)}</strong>
            </div>
            <p className="field-hint">
              El total definitivo lo calcula y valida el servidor.
            </p>
          </div>

          {error && (
            <div className="inline-error" role="alert">
              <CircleAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={saving}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Check size={17} />
              )}
              {saving ? "Guardando..." : "Guardar pedido"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formOrder, setFormOrder] = useState<Order | null | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<"orders" | "customers">(
    "orders",
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await ordersApi.getAll({
        search,
        status: statusFilter,
        page,
        size: PAGE_SIZE,
      });

      setOrders(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);

      setSelectedOrder((current) =>
        current
          ? result.content.find((order) => order.id === current.id) ?? current
          : null,
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const loadCustomers = useCallback(async () => {
    try {
      const result = await customersApi.getAll();
      setCustomers(result.content);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadOrders());
  }, [loadOrders]);

  useEffect(() => {
    void Promise.resolve().then(() =>loadCustomers());
  }, [loadCustomers]);

  const metrics = useMemo(
    () => ({
      created: orders.filter((order) => order.status === "CREATED").length,
      processing: orders.filter(
        (order) =>
          order.status === "PROCESSING" || order.status === "CONFIRMED",
      ).length,
      shipped: orders.filter((order) => order.status === "SHIPPED").length,
    }),
    [orders],
  );

  function handleSaved(order: Order) {
    setFormOrder(undefined);
    setSelectedOrder(order);
    setNotice(
      formOrder ? "El pedido se actualizó correctamente." : "El pedido se creó correctamente.",
    );
    setPage(0);
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    window.setTimeout(() => setNotice(""), 4000);
    void loadCustomers();
    // Refresh after the filters have been reset.    
  }

  async function handleDelete() {
    if (!selectedOrder) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el pedido ${selectedOrder.orderNumber}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await ordersApi.delete(selectedOrder.id);
      setSelectedOrder(null);
      setNotice("El pedido se eliminó correctamente.");
      setPage(0);
      window.setTimeout(() => setNotice(""), 4000);
      await loadOrders();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  }

  const showingFrom =
    totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const showingTo = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShoppingBag size={23} strokeWidth={2.4} />
          </div>
          <div className="brand-copy">
            <strong>liverpool</strong>
            <span>Order Management</span>
          </div>
        </div>

        <div className="sidebar-label">MENÚ PRINCIPAL</div>
        <button
          type="button"
          className={`sidebar-link ${activeSection === "orders" ? "active" : ""}`}
          onClick={() => setActiveSection("orders")}
        >
          <ClipboardList size={18} />
          <span>Pedidos</span>
        </button>

        <button
          type="button"
          className={`sidebar-link ${activeSection === "customers" ? "active" : ""}`}
          onClick={() => setActiveSection("customers")}
        >
          <Users size={18} />
          <span>Clientes</span>
        </button>

        <div className="sidebar-note">
          <div className="sidebar-note-icon">
            <Box size={19} />
          </div>
          <strong>Gestión de pedidos</strong>
          <p>Administra las órdenes de venta de la aplicación y el sitio web.</p>
        </div>

        <div className="sidebar-footer">
          <span className="online-dot" />
          API de pedidos
          <span className="connection-label">Local</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Operaciones</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activeSection === "customers" ? "Clientes" : selectedOrder ? "Detalle del pedido" : "Pedidos"}</strong>
          </div>
          <div className="topbar-right">
            <span className="environment-label">ENTORNO DE DESARROLLO</span>
            <div className="avatar" aria-label="Usuario administrador">
              AD
            </div>
          </div>
        </header>

        <div className="page-content">
          {activeSection === "customers" ? (
            <CustomersPage
              onBack={() => setActiveSection("orders")}
              onCustomerChanged={() => {
                void loadCustomers();
              }}
              />
            ) : selectedOrder ? (
            <section className="detail-page">
              <button
                className="back-link"
                type="button"
                onClick={() => setSelectedOrder(null)}
              >
                <ArrowLeft size={17} />
                Volver a pedidos
              </button>

              <div className="detail-heading">
                <div>
                  <div className="eyebrow">DETALLE DE PEDIDO</div>
                  <h1>{selectedOrder.orderNumber}</h1>
                  <p>Creado el {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="detail-actions">
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => setFormOrder(selectedOrder)}
                  >
                    Editar pedido
                  </button>
                  <button
                    className="button button-danger"
                    type="button"
                    disabled={deleting}
                    onClick={() => void handleDelete()}
                  >
                    {deleting ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <Trash2 size={17} />
                    )}
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="detail-status-panel">
                <div>
                  <span className="muted-label">Estado actual</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <span className="muted-label">Canal de venta</span>
                  <strong>
                    {selectedOrder.source === "WEB"
                      ? "Sitio web"
                      : "Aplicación móvil"}
                  </strong>
                </div>
                <div>
                  <span className="muted-label">Total del pedido</span>
                  <strong className="detail-total">
                    {formatCurrency(selectedOrder.total)}
                  </strong>
                </div>
              </div>

              <div className="detail-grid">
                <section className="content-card">
                  <div className="card-heading">
                    <div className="card-icon">
                      <UserRound size={19} />
                    </div>
                    <div>
                      <h2>Información del cliente</h2>
                      <p>Datos asociados al pedido</p>
                    </div>
                  </div>
                  <div className="info-list">
                    <div>
                      <span>Nombre completo</span>
                      <strong>{customerName(selectedOrder.customer)}</strong>
                    </div>
                    <div>
                      <span>Correo electrónico</span>
                      <strong>{selectedOrder.customer.email}</strong>
                    </div>
                    <div>
                      <span>ID de cliente</span>
                      <strong className="monospace">
                        {selectedOrder.customer.id}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="content-card">
                  <div className="card-heading">
                    <div className="card-icon">
                      <MapPin size={19} />
                    </div>
                    <div>
                      <h2>Dirección de entrega</h2>
                      <p>Destino del pedido</p>
                    </div>
                  </div>
                  <div className="address-block">
                    <strong>
                      {selectedOrder.shippingAddress.street}{" "}
                      {selectedOrder.shippingAddress.exteriorNumber}
                      {selectedOrder.shippingAddress.interiorNumber
                        ? `, Int. ${selectedOrder.shippingAddress.interiorNumber}`
                        : ""}
                    </strong>
                    <span>{selectedOrder.shippingAddress.neighborhood}</span>
                    <span>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}
                    </span>
                    <span>
                      C.P. {selectedOrder.shippingAddress.postalCode}
                    </span>
                    {selectedOrder.shippingAddress.references && (
                      <p>
                        <span>Referencias: </span>
                        {selectedOrder.shippingAddress.references}
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <section className="content-card products-card">
                <div className="card-heading">
                  <div className="card-icon">
                    <Package size={19} />
                  </div>
                  <div>
                    <h2>Productos del pedido</h2>
                    <p>{selectedOrder.items.length} artículo(s)</p>
                  </div>
                </div>

                <div className="table-scroll">
                  <table className="data-table detail-products-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Código</th>
                        <th className="align-right">Precio unitario</th>
                        <th className="align-center">Cantidad</th>
                        <th className="align-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={`${item.productCode}-${index}`}>
                          <td>
                            <div className="product-cell">
                              <div className="product-icon">
                                <Package size={18} />
                              </div>
                              <strong>{item.productName}</strong>
                            </div>
                          </td>
                          <td className="muted-cell">{item.productCode}</td>
                          <td className="align-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="align-center">{item.quantity}</td>
                          <td className="align-right strong-cell">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="order-total-row">
                  <span>Total del pedido</span>
                  <strong>{formatCurrency(selectedOrder.total)}</strong>
                </div>
              </section>
            </section>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">CENTRO DE OPERACIONES</div>
                  <h1>Pedidos</h1>
                  <p>
                    Consulta, busca y administra los pedidos de tus clientes.
                  </p>
                </div>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => setFormOrder(null)}
                >
                  <Plus size={18} />
                  Crear pedido
                </button>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-top">
                    <span>Total de pedidos</span>
                    <div className="metric-icon metric-icon-blue">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                  <strong className="metric-value">{totalElements}</strong>
                  <span className="metric-caption">Según los filtros actuales</span>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span>Pedidos nuevos</span>
                    <div className="metric-icon metric-icon-purple">
                      <Clock3 size={20} />
                    </div>
                  </div>
                  <strong className="metric-value">{metrics.created}</strong>
                  <span className="metric-caption">En esta página</span>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span>En preparación</span>
                    <div className="metric-icon metric-icon-orange">
                      <Box size={20} />
                    </div>
                  </div>
                  <strong className="metric-value">{metrics.processing}</strong>
                  <span className="metric-caption">Confirmados o en proceso</span>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span>Enviados</span>
                    <div className="metric-icon metric-icon-green">
                      <Truck size={20} />
                    </div>
                  </div>
                  <strong className="metric-value">{metrics.shipped}</strong>
                  <span className="metric-caption">En esta página</span>
                </div>
              </div>

              <section className="content-card orders-card">
                <div className="orders-toolbar">
                  <div>
                    <h2>Todos los pedidos</h2>
                    <p>Listado de órdenes registradas en el sistema.</p>
                  </div>
                  <button
                    type="button"
                    className="button button-secondary refresh-button"
                    onClick={() => void loadOrders()}
                    disabled={loading}
                  >
                    <LoaderCircle
                      size={16}
                      className={loading ? "spin" : ""}
                    />
                    Actualizar
                  </button>
                </div>

                <div className="filter-bar">
                  <label className="search-field">
                    <Search size={18} />
                    <input
                      type="search"
                      placeholder="Buscar por pedido o cliente..."
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      aria-label="Buscar pedidos"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        className="search-clear"
                        aria-label="Limpiar búsqueda"
                        onClick={() => setSearchInput("")}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </label>

                  <label className="status-filter">
                    <span>Estado:</span>
                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(
                          event.target.value as OrderStatus | "",
                        );
                        setPage(0);
                      }}
                    >
                      <option value="">Todos los estados</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {STATUS_LABELS[option]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-chevron" size={15} />
                  </label>
                </div>

                {notice && (
                  <div className="inline-success" role="status">
                    <Check size={17} />
                    {notice}
                  </div>
                )}

                {error && (
                  <div className="inline-error page-error" role="alert">
                    <CircleAlert size={18} />
                    <span>{error}</span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => void loadOrders()}
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="state-panel">
                    <LoaderCircle className="spin" size={30} />
                    <strong>Cargando pedidos...</strong>
                    <span>Estamos consultando el servicio de pedidos.</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="state-panel">
                    <div className="empty-icon">
                      <ClipboardList size={28} />
                    </div>
                    <strong>
                      {search || statusFilter
                        ? "No encontramos pedidos"
                        : "Todavía no hay pedidos"}
                    </strong>
                    <span>
                      {search || statusFilter
                        ? "Prueba con otro término de búsqueda o cambia los filtros."
                        : "Crea tu primer pedido para empezar."}
                    </span>
                    {(search || statusFilter) && (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => {
                          setSearchInput("");
                          setSearch("");
                          setStatusFilter("");
                          setPage(0);
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="table-scroll">
                      <table className="data-table orders-table">
                        <thead>
                          <tr>
                            <th>Pedido</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Canal</th>
                            <th>Estado</th>
                            <th className="align-right">Total</th>
                            <th className="align-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td>
                                <button
                                  type="button"
                                  className="order-number-link"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  {order.orderNumber}
                                </button>
                              </td>
                              <td>
                                <div className="customer-cell">
                                  <div className="customer-avatar">
                                    {order.customer.firstName
                                      .charAt(0)
                                      .toUpperCase()}
                                    {order.customer.lastName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div className="customer-cell-copy">
                                    <strong>{customerName(order.customer)}</strong>
                                    <span>{order.customer.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="date-cell">
                                {formatDate(order.createdAt)}
                              </td>
                              <td>
                                <span className="source-label">
                                  {order.source === "WEB"
                                    ? "Sitio web"
                                    : "App móvil"}
                                </span>
                              </td>
                              <td>
                                <StatusBadge status={order.status} />
                              </td>
                              <td className="align-right strong-cell">
                                {formatCurrency(order.total)}
                              </td>
                              <td className="align-center">
                                <button
                                  type="button"
                                  className="icon-button view-button"
                                  aria-label={`Ver pedido ${order.orderNumber}`}
                                  title="Ver detalles"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="table-footer">
                      <span>
                        Mostrando <strong>{showingFrom}–{showingTo}</strong>{" "}
                        de <strong>{totalElements}</strong> pedidos
                      </span>
                      <div className="pagination">
                        <button
                          type="button"
                          className="pagination-button"
                          aria-label="Página anterior"
                          disabled={page === 0}
                          onClick={() => setPage((current) => current - 1)}
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <span>
                          Página <strong>{page + 1}</strong> de{" "}
                          <strong>{Math.max(totalPages, 1)}</strong>
                        </span>
                        <button
                          type="button"
                          className="pagination-button"
                          aria-label="Página siguiente"
                          disabled={page + 1 >= totalPages}
                          onClick={() => setPage((current) => current + 1)}
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </section>

              <footer className="page-footer">
                <span>Gestión de pedidos · Liverpool</span>
                <span>React · TypeScript · Spring Boot</span>
              </footer>
            </>
          )}
        </div>
      </main>

      {formOrder !== undefined && (
        <OrderForm
          key={formOrder?.id ?? "new-order"}
          order={formOrder}
          customers={customers}
          onClose={() => setFormOrder(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default App;
