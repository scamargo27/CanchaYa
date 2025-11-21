// src/AdminReservasPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

/** ================= helpers ================= */

function hoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHora(h) {
  if (!h) return "";
  // si viene "18:00:00" → "18:00"
  return h.slice(0, 5);
}

function formatPrecio(num) {
  if (num == null) return "S/ 0";
  const n = Number(num);
  if (Number.isNaN(n)) return `S/ ${num}`;
  return `S/ ${n.toFixed(0)}`;
}

function formatFechaCorta(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatFechaLarga(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE");
}

function estadoInfo(estado) {
  switch (estado) {
    case "pendiente":
      return { label: "Pendiente", classes: "bg-amber-50 text-amber-700 border border-amber-200" };
    case "confirmada":
      return { label: "Confirmada", classes: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    case "en_curso":
      return { label: "En curso", classes: "bg-blue-50 text-blue-700 border border-blue-200" };
    case "cancelada":
      return { label: "Cancelada", classes: "bg-rose-50 text-rose-700 border border-rose-200" };
    case "completada":
      return { label: "Completada", classes: "bg-slate-100 text-slate-700 border border-slate-200" };
    default:
      return { label: estado || "Desconocido", classes: "bg-slate-100 text-slate-600 border border-slate-200" };
  }
}

/** Normaliza la reserva que viene del backend */
function normalizarReserva(r) {
  const estado = r.estado || r.status || "";

  const clienteNombre =
    r.cliente_nombre ??
    r.nombre_cliente ??
    r.cliente_name ??
    r.cliente?.nombre ??
    r.cliente?.full_name ??
    "Sin nombre";

  const clienteTelefono =
    r.cliente_telefono ??
    r.telefono_cliente ??
    r.cliente?.telefono ??
    r.cliente?.telefono_movil ??
    "";

  const clienteDocumento =
    r.cliente_documento ??
    r.documento_cliente ??
    r.cliente?.documento ??
    "";

  const canchaNombre =
    r.cancha_nombre ??
    r.nombre_cancha ??
    r.cancha?.nombre ??
    "Cancha sin nombre";

  const codigo =
    r.codigo ??
    r.codigo_reserva ??
    r.reference ??
    r.reference_code ??
    `RES-${r.id ?? ""}`;

  const fecha = r.fecha || r.fecha_partido || r.dia;
  const hora_inicio = r.hora_inicio || r.hora_inicio_reserva || r.inicio;
  const hora_fin = r.hora_fin || r.hora_fin_reserva || r.fin;

  const precio =
    r.precio_total ??
    r.monto_total ??
    r.precio ??
    r.costo ??
    0;

  const metodo_pago =
    r.metodo_pago ??
    r.forma_pago ??
    r.medio_pago ??
    "No especificado";

  const comentarios =
    r.comentarios ??
    r.nota ??
    r.observaciones ??
    "";

  const creado =
    r.created_at ??
    r.fecha_reserva ??
    r.fecha_creacion ??
    null;

  return {
    id: r.id,
    estado,
    clienteNombre,
    clienteTelefono,
    clienteDocumento,
    canchaNombre,
    codigo,
    fecha,
    hora_inicio,
    hora_fin,
    precio,
    metodo_pago,
    comentarios,
    creado,
  };
}

/** ================= componente principal ================= */

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // filtros
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [fechaFiltro, setFechaFiltro] = useState(hoyISO());

  // modales
  const [reservaDetalle, setReservaDetalle] = useState(null); // objeto o null
  const [reservaCancelar, setReservaCancelar] = useState(null); // objeto o null
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  // acciones en curso
  const [cambiandoId, setCambiandoId] = useState(null);
  const [cancelandoId, setCancelandoId] = useState(null);

  /** ========== cargar reservas ========== */

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const params = {};
      if (busqueda.trim()) params.search = busqueda.trim();
      if (estadoFiltro && estadoFiltro !== "todas") params.estado = estadoFiltro;
      if (fechaFiltro) params.fecha = fechaFiltro;

      const res = await api.get("/api/reservas/reservas-club/", { params });

      const raw = res.data;
      const lista = Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw?.reservas)
        ? raw.reservas
        : Array.isArray(raw)
        ? raw
        : [];

      setReservas(lista.map(normalizarReserva));
    } catch (error) {
      console.error("Error cargando reservas del club", error);
      const detalle =
        error.response?.data?.detalle ||
        error.response?.data?.error ||
        error.message ||
        "Ocurrió un error al cargar las reservas.";
      setErrorMsg(detalle);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaFiltro, estadoFiltro]);

  /** ========== resumen ========== */

  const resumen = useMemo(() => {
    const base = {
      total: reservas.length,
      confirmadas: 0,
      pendientes: 0,
      en_curso: 0,
      canceladas: 0,
      completadas: 0,
    };
    reservas.forEach((r) => {
      if (r.estado in base) base[r.estado] += 1;
    });
    return base;
  }, [reservas]);

  /** ========== acciones sobre reservas ========== */

  const cambiarEstado = async (reserva, nuevoEstado) => {
    if (!reserva?.id) return;
    try {
      setCambiandoId(reserva.id);
      await api.patch(`/api/reservas/${reserva.id}/`, { estado: nuevoEstado });
      await cargarReservas();
    } catch (error) {
      console.error("Error cambiando estado", error);
      const detalle =
        error.response?.data?.detalle ||
        error.response?.data?.error ||
        error.message ||
        "No se pudo actualizar el estado de la reserva.";
      setErrorMsg(detalle);
    } finally {
      setCambiandoId(null);
    }
  };

  const abrirModalCancelar = (reserva) => {
    setReservaCancelar(reserva);
    setMotivoCancelacion("");
  };

  const confirmarCancelacion = async () => {
    if (!reservaCancelar?.id) return;
    try {
      setCancelandoId(reservaCancelar.id);
      await api.post(`/api/reservas/${reservaCancelar.id}/cancelar/`, {
        motivo: motivoCancelacion,
        motivo_cancelacion: motivoCancelacion,
      });
      setReservaCancelar(null);
      setMotivoCancelacion("");
      await cargarReservas();
    } catch (error) {
      console.error("Error cancelando reserva", error);
      const detalle =
        error.response?.data?.detalle ||
        error.response?.data?.error ||
        error.message ||
        "No se pudo cancelar la reserva.";
      setErrorMsg(detalle);
    } finally {
      setCancelandoId(null);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todas");
    setFechaFiltro(hoyISO());
  };

  /** ========== render ========== */

  if (loading && reservas.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
              <span className="font-bold text-xl text-blue-700">
                CanchaYa
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-500">
            Cargando reservas del club...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR CLUB */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
            <span className="font-bold text-xl text-blue-700">
              CanchaYa
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/club/home" className="text-slate-700">
              Inicio
            </Link>
            <Link to="/club/canchas" className="text-slate-700">
              Canchas
            </Link>
            <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">
              Reservas
            </span>
            <Link to="/club/perfil" className="text-slate-700">
              Perfil
            </Link>

            <Link
              to="/login"
              className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50"
            >
              <span>↪</span>
              <span>Cerrar Sesión</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-8 py-8 space-y-6">
          {/* Título + acciones */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Gestión de Reservas
              </h1>
              <p className="text-sm text-slate-500">
                Administra todas las reservas de tu complejo deportivo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  // En el futuro podrías exportar a CSV; por ahora solo imprime.
                  window.print();
                }}
              >
                <span>⬇</span>
                <span>Exportar</span>
              </button>
              <button
                type="button"
                onClick={cargarReservas}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                <span>⟳</span>
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Resumen superior */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <ResumenCard
              titulo="Total Reservas"
              valor={resumen.total}
            />
            <ResumenCard
              titulo="Confirmadas"
              valor={resumen.confirmadas}
              badgeClasses="bg-emerald-50 text-emerald-700"
            />
            <ResumenCard
              titulo="Pendientes"
              valor={resumen.pendientes}
              badgeClasses="bg-amber-50 text-amber-700"
            />
            <ResumenCard
              titulo="En Curso"
              valor={resumen.en_curso}
              badgeClasses="bg-blue-50 text-blue-700"
            />
            <ResumenCard
              titulo="Canceladas"
              valor={resumen.canceladas}
              badgeClasses="bg-rose-50 text-rose-700"
            />
            <ResumenCard
              titulo="Completadas"
              valor={resumen.completadas}
              badgeClasses="bg-slate-100 text-slate-700"
            />
          </div>

          {/* Filtros */}
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="text-base">⚲</span>
              <span className="font-semibold">Filtros</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              {/* Buscar */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Buscar
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") cargarReservas();
                    }}
                    placeholder="Cliente, cancha o código..."
                    className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Estado
                </label>
                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="todas">Todas</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="en_curso">En curso</option>
                  <option value="cancelada">Canceladas</option>
                  <option value="completada">Completadas</option>
                </select>
              </div>

              {/* Fecha */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fechaFiltro}
                  onChange={(e) => setFechaFiltro(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {/* Limpiar filtros */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    limpiarFiltros();
                    cargarReservas();
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Errores */}
          {errorMsg && (
            <p className="text-xs text-red-600 whitespace-pre-wrap">
              {errorMsg}
            </p>
          )}

          {/* Lista de reservas */}
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Reservas ({reservas.length})
            </p>

            {reservas.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
                No hay reservas para los filtros seleccionados.
              </div>
            ) : (
              reservas.map((r) => {
                const infoEstado = estadoInfo(r.estado);
                const horario =
                  `${formatHora(r.hora_inicio)}-${formatHora(r.hora_fin)}`.replace(
                    /^-|-$/g,
                    ""
                  );
                return (
                  <article
                    key={r.id}
                    className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    {/* Izquierda: cliente */}
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-sm font-semibold text-slate-900">
                        {r.clienteNombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.codigo}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <span>📞</span>
                        <span>
                          {r.clienteTelefono || "Sin teléfono"}{" "}
                          {r.clienteDocumento
                            ? `· Doc: ${r.clienteDocumento}`
                            : ""}
                        </span>
                      </p>
                    </div>

                    {/* Centro: cancha + fecha */}
                    <div className="flex-1 min-w-[220px]">
                      <p className="text-sm font-semibold text-slate-900">
                        {r.canchaNombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFechaCorta(r.fecha)}{" "}
                        {horario && (
                          <>
                            · <span>{horario}</span>
                          </>
                        )}
                      </p>
                      {r.metodo_pago && (
                        <p className="mt-1 text-xs text-slate-500">
                          Método de pago: {r.metodo_pago}
                        </p>
                      )}
                    </div>

                    {/* Derecha: precio + estado + acciones */}
                    <div className="flex flex-col items-start md:items-end gap-2 min-w-[180px]">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatPrecio(r.precio)}
                      </p>
                      {r.creado && (
                        <p className="text-[11px] text-slate-400">
                          Reservado: {formatFechaLarga(r.creado)}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={
                            "px-3 py-1 rounded-full text-[11px] font-semibold " +
                            infoEstado.classes
                          }
                        >
                          {infoEstado.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        {/* Ver */}
                        <button
                          type="button"
                          onClick={() => setReservaDetalle(r)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
                          title="Ver detalles"
                        >
                          👁
                        </button>

                        {/* En curso */}
                        <button
                          type="button"
                          disabled={
                            cambiandoId === r.id ||
                            r.estado === "en_curso" ||
                            r.estado === "completada" ||
                            r.estado === "cancelada"
                          }
                          onClick={() => cambiarEstado(r, "en_curso")}
                          className="flex items-center justify-center px-3 py-1 rounded-full border border-blue-200 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          En curso
                        </button>

                        {/* Confirmar */}
                        <button
                          type="button"
                          disabled={
                            cambiandoId === r.id ||
                            r.estado === "confirmada" ||
                            r.estado === "completada" ||
                            r.estado === "cancelada"
                          }
                          onClick={() => cambiarEstado(r, "confirmada")}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-200 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Confirmar reserva"
                        >
                          ✔
                        </button>

                        {/* Cancelar */}
                        <button
                          type="button"
                          disabled={
                            cancelandoId === r.id ||
                            r.estado === "cancelada" ||
                            r.estado === "completada"
                          }
                          onClick={() => abrirModalCancelar(r)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-rose-200 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Cancelar reserva"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* MODAL DETALLE */}
      {reservaDetalle && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Detalles de la Reserva
                </h2>
                <p className="text-xs text-slate-500">
                  Información completa de la reserva {reservaDetalle.codigo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReservaDetalle(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {/* Información del cliente */}
              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Información del Cliente
                </h3>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Nombre:</span>{" "}
                  {reservaDetalle.clienteNombre}
                </p>
                {reservaDetalle.clienteTelefono && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">Teléfono:</span>{" "}
                    {reservaDetalle.clienteTelefono}
                  </p>
                )}
                {reservaDetalle.clienteDocumento && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">Documento:</span>{" "}
                    {reservaDetalle.clienteDocumento}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Código:</span>{" "}
                  {reservaDetalle.codigo}
                </p>
              </div>

              {/* Información de la reserva */}
              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Detalles de la Reserva
                </h3>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Cancha:</span>{" "}
                  {reservaDetalle.canchaNombre}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Fecha:</span>{" "}
                  {formatFechaLarga(reservaDetalle.fecha)}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Horario:</span>{" "}
                  {formatHora(reservaDetalle.hora_inicio)} -{" "}
                  {formatHora(reservaDetalle.hora_fin)}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Precio:</span>{" "}
                  {formatPrecio(reservaDetalle.precio)}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Método de pago:</span>{" "}
                  {reservaDetalle.metodo_pago}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Estado:</span>{" "}
                  {estadoInfo(reservaDetalle.estado).label}
                </p>
              </div>

              {/* Comentarios */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Comentarios
                </h3>
                <p className="text-xs text-slate-500 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                  {reservaDetalle.comentarios || "Sin comentarios adicionales."}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setReservaDetalle(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR */}
      {reservaCancelar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Cancelar Reserva
                </h2>
                <p className="text-xs text-slate-500">
                  ¿Estás seguro de que deseas cancelar la reserva{" "}
                  {reservaCancelar.codigo}?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReservaCancelar(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 text-sm">
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-rose-500 text-base">⚠</span>
                <p>
                  Esta acción no se puede deshacer. La reserva será marcada
                  como <span className="font-semibold">cancelada</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de cancelación *
                </label>
                <textarea
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Describe el motivo de la cancelación..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReservaCancelar(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                disabled={cancelandoId === reservaCancelar.id}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCancelacion}
                disabled={cancelandoId === reservaCancelar.id}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cancelandoId === reservaCancelar.id
                  ? "Cancelando..."
                  : "Confirmar Cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tarjetica de resumen superior */
function ResumenCard({ titulo, valor, badgeClasses = "bg-slate-50 text-slate-700" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex flex-col justify-between">
      <p className="text-xs text-slate-500 mb-1">{titulo}</p>
      <p className="text-2xl font-semibold text-slate-900">{valor}</p>
      <span className={`mt-2 inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${badgeClasses}`}>
        Última actualización
      </span>
    </div>
  );
}
