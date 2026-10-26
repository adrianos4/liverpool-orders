import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  LoaderCircle,
  Mail,
} from "lucide-react";

import {
  customersApi,
  type CustomerRequest,
} from "../api/customersApi";
import type { Customer } from "../types/order";

const EMPTY_FORM: CustomerRequest = {
  firstName: "",
  lastName: "",
  motherLastName: "",
  email: "",
};

const PAGE_SIZE = 10;

interface CustomersPageProps {
  onBack?: () => void;
  onCustomerChanged?: () => void;
}

export default function CustomersPage({
  onBack,
  onCustomerChanged,
}: CustomersPageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerRequest>(EMPTY_FORM);
  const [validationError, setValidationError] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await customersApi.getAll(search, page, PAGE_SIZE);
      setCustomers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los clientes.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    void Promise.resolve().then(() =>loadCustomers());
  }, [loadCustomers]);

  function openCreateForm() {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setValidationError("");
    setFormOpen(true);
  }

  function openEditForm(customer: Customer) {
    setEditingCustomer(customer);
    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      motherLastName: customer.motherLastName,
      email: customer.email,
    });
    setValidationError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setValidationError("");
  }

  function updateField(field: keyof CustomerRequest, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");
    setNotice("");

    const payload: CustomerRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      motherLastName: form.motherLastName.trim(),
      email: form.email.trim(),
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.motherLastName ||
      !payload.email
    ) {
      setValidationError("Completa todos los campos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setValidationError("Ingresa un correo electrónico válido.");
      return;
    }

    setSaving(true);

    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, payload);
        setNotice("Cliente actualizado correctamente.");
      } else {
        await customersApi.create(payload);
        setNotice("Cliente creado correctamente.");
        setPage(0);
      }

      setFormOpen(false);
      setEditingCustomer(null);
      setForm(EMPTY_FORM);

      // Reload using the latest search and page state.
      const result = await customersApi.getAll(
        search,
        editingCustomer ? page : 0,
        PAGE_SIZE,
      );

      setCustomers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(editingCustomer ? page : 0);

      onCustomerChanged?.();
    } catch (err) {
      setValidationError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el cliente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `¿Eliminar al cliente ${customer.firstName} ${customer.lastName} ${customer.motherLastName}?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await customersApi.delete(customer.id);
      setNotice("Cliente eliminado correctamente.");

      const nextPage =
        customers.length === 1 && page > 0 ? page - 1 : page;

      setPage(nextPage);

      const result = await customersApi.getAll(
        search,
        nextPage,
        PAGE_SIZE,
      );

      setCustomers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);

      onCustomerChanged?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el cliente.",
      );
    }
  }

  return (
    <section className="customers-page">
      <header className="customers-header">
        <div>
          <div className="customers-eyebrow">GESTIÓN DE CLIENTES</div>
          <h1>Clientes</h1>
          <p>Administra la información de los clientes registrados.</p>
        </div>

        <div className="customers-header-actions">
          {onBack && (
            <button className="customer-button secondary" onClick={onBack}>
              Volver a pedidos
            </button>
          )}

          <button className="customer-button primary" onClick={openCreateForm}>
            <Plus size={18} />
            Nuevo cliente
          </button>
        </div>
      </header>

      <div className="customers-summary">
        <div className="customers-summary-icon">
          <Users size={22} />
        </div>
        <div>
          <span>Clientes registrados</span>
          <strong>{totalElements}</strong>
        </div>
      </div>

      <div className="customers-toolbar">
        <div className="customers-search">
          <Search size={18} />
          <input
            aria-label="Buscar clientes"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
          {search && (
            <button
              aria-label="Limpiar búsqueda"
              onClick={() => {
                setSearch("");
                setPage(0);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="customers-notice" role="status">
          {notice}
        </div>
      )}

      {error && (
        <div className="customers-error" role="alert">
          {error}
        </div>
      )}

      <div className="customers-table-card">
        {loading ? (
          <div className="customers-state">
            <LoaderCircle className="spin" size={26} />
            <p>Cargando clientes...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="customers-state">
            <Users size={34} />
            <h3>{search ? "No se encontraron clientes" : "Aún no hay clientes"}</h3>
            <p>
              {search
                ? "Prueba con otro nombre o correo electrónico."
                : "Registra tu primer cliente para comenzar a crear pedidos."}
            </p>
            {!search && (
              <button className="customer-button primary" onClick={openCreateForm}>
                <Plus size={18} />
                Crear primer cliente
              </button>
            )}
          </div>
        ) : (
          <div className="customers-table-wrap">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Correo electrónico</th>
                  <th>Fecha de registro</th>
                  <th className="customer-actions-heading">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.firstName.charAt(0).toUpperCase()}
                          {customer.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>
                            {customer.firstName} {customer.lastName}{" "}
                            {customer.motherLastName}
                          </strong>
                          <span>Cliente registrado</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="customer-email">
                        <Mail size={15} />
                        {customer.email}
                      </span>
                    </td>

                    <td>
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString(
                            "es-MX",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>

                    <td>
                      <div className="customer-row-actions">
                        <button
                          className="customer-icon-button"
                          aria-label={`Editar ${customer.firstName}`}
                          title="Editar cliente"
                          onClick={() => openEditForm(customer)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="customer-icon-button danger"
                          aria-label={`Eliminar ${customer.firstName}`}
                          title="Eliminar cliente"
                          onClick={() => void handleDelete(customer)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="customers-pagination">
          <span>
            Página {page + 1} de {totalPages}
          </span>

          <div>
            <button
              className="customer-button secondary"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
            >
              Anterior
            </button>

            <button
              className="customer-button secondary"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {formOpen && (
        <div
          className="customer-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-form-title"
          >
            <header className="customer-modal-header">
              <div>
                <span className="customers-eyebrow">
                  {editingCustomer ? "ACTUALIZAR INFORMACIÓN" : "NUEVO REGISTRO"}
                </span>
                <h2 id="customer-form-title">
                  {editingCustomer ? "Editar cliente" : "Crear cliente"}
                </h2>
              </div>

              <button
                className="customer-icon-button"
                aria-label="Cerrar formulario"
                disabled={saving}
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="customer-form">
              <label>
                Nombre(s)
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  placeholder="Ej. John"
                />
              </label>

              <label>
                Apellido paterno
                <input
                  required
                  maxLength={100}
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  placeholder="Ej. Doe"
                />
              </label>

              <label>
                Apellido materno
                <input
                  required
                  maxLength={100}
                  value={form.motherLastName}
                  onChange={(event) =>
                    updateField("motherLastName", event.target.value)
                  }
                  placeholder="Ej. N"
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="cliente@correo.com"
                />
              </label>

              {validationError && (
                <div className="customers-error" role="alert">
                  {validationError}
                </div>
              )}

              <footer className="customer-form-actions">
                <button
                  type="button"
                  className="customer-button secondary"
                  disabled={saving}
                  onClick={closeForm}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="customer-button primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : editingCustomer ? "Guardar cambios" : "Crear cliente"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}