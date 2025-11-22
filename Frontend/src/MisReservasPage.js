// src/MisReservasPage.js
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

function formatearMoneda(valor) {
  if (valor == null) return "-";
  const num = Number(valor);
  if (Number.isNaN(num)) return "-";
  return `S/ ${num.toFixed(2)}`;
}

function formatearHora(hora) {
  if (!hora) return "-";
  // admite "HH:MM" o "HH:MM:SS"
  return hora.slice(0, 5);
}

function obtenerPrecioReserva(r) {
  return (
    r.precio ??
    r.monto_total ??
    r.total_pagado ??
    r.total ??
    r.precio_final ??
    0
  );
}

function obtenerEstado(r) {
  const e =
    (r.estado || r.estado_reserva || "")
      .toString()
      .toLowerCase() || "desconocido";
  return e;
}

function estadoClases(estado) {
  switch (estado) {
    case "confirmada":
    case "pendiente":
      return "bg-slate-900 text-white";
    case "completada":
    case "completa":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "cancelada":
      return "bg-red-50 text-red-600 border border-red-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

export default function MisReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [expandedId, setExpandedId] = useState(null);

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // === Cargar reservas del backend ===
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await api.get("/api/reservas/mis-reservas/");
        const data = res.data || {};

        let lista = [];

        // Formato agrupado { proximas: {reservas:[]}, anteriores:{reservas:[]}}
        if (data.proximas?.reservas) {
          lista = lista.concat(data.proximas.reservas);
        }
        if (data.anteriores?.reservas) {
          lista = lista.concat(data.anteriores.reservas);
        }

        // O si el endpoint devuelve un array plano
        if (Array.isArray(data.reservas)) {
          lista = data.reservas;
        } else if (Array.isArray(data)) {
          lista = data;
        }

        // Ordenar: fecha + hora_inicio ascendente
        lista.sort((a, b) => {
          const fa = a.fecha || "";
          const fb = b.fecha || "";
          if (fa < fb) return -1;
          if (fa > fb) return 1;
          const ha = a.hora_inicio || "";
          const hb = b.hora_inicio || "";
          return ha.localeCompare(hb);
        });

        setReservas(lista);
      } catch (error) {
        console.error("Error cargando mis reservas", error);
        setErrorMsg("Ocurrió un error al cargar tus reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  // === Cancelar reserva en backend ===
  const cancelarReservaBackend = async (id) => {
    // 1) Intentar endpoint específico /cancelar/
    try {
      const res = await api.post(`/api/reservas/${id}/cancelar/`);
      return res.data;
    } catch (error) {
      // Si el endpoint /cancelar/ no existe, usar PATCH
      if (error.response && error.response.status === 404) {
        // IMPORTANTE: aquí usamos el valor que espera el ChoiceField del modelo
        // En tu caso, por el error, debe ser "CANCELADA" (en mayúsculas)
        const res2 = await api.patch(`/api/reservas/${id}/`, {
          estado: "CANCELADA",
        });
        return res2.data;
      }

      // Para cualquier otro error, lo re-lanzamos
      console.error(
        "[MisReservasPage] Error en cancelarReservaBackend:",
        error.response?.data || error
      );
      throw error;
    }
  };

  const abrirConfirmacionCancelacion = (reserva) => {
    setReservaParaCancelar(reserva);
    setConfirmCancelOpen(true);
  };

  const cerrarConfirmacionCancelacion = () => {
    setConfirmCancelOpen(false);
    setReservaParaCancelar(null);
  };

  const confirmarCancelarReserva = async () => {
    if (!reservaParaCancelar) return;
    const id = reservaParaCancelar.id;
    setCancellingId(id);

    try {
      const dataActualizada = await cancelarReservaBackend(id);

      // Actualizar en estado local
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...(dataActualizada.reserva || dataActualizada),
              }
            : r
        )
      );
      cerrarConfirmacionCancelacion();
    } catch (error) {
      console.error("Error cancelando reserva", error);
      const detail =
        error.response?.data?.detalle ||
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data || {});
      alert(
        "Ocurrió un error al cancelar la reserva. Intenta nuevamente.\n\nDetalle: " +
          detail
      );
    } finally {
      setCancellingId(null);
    }
  };

  const reservasConInfo = useMemo(() => reservas || [], [reservas]);

  // === Render ===
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navbar */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
              <span className="font-bold text-xl text-blue-700">CanchaYa</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-500">Cargando tus reservas...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR PERFIL DEPORTISTA */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
            <span className="font-bold text-xl text-blue-700">CanchaYa</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/deportista/buscar" className="text-slate-700">
              Buscar
            </Link>
            <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">
              Mis Reservas
            </span>
            <Link to="/deportista/notificaciones" className="text-slate-700">
              Notificaciones
            </Link>
            <Link to="/deportista/perfil" className="text-slate-700">
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
        <section className="max-w-5xl mx-auto px-8 py-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">
            Mis Reservas
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Historial completo de tus reservas.
          </p>

          {errorMsg && (
            <p className="mb-4 text-xs text-red-600">{errorMsg}</p>
          )}

          {reservasConInfo.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-sm text-slate-500">
              Aún no tienes reservas registradas.
            </div>
          ) : (
            <div className="space-y-4">
              {reservasConInfo.map((reserva) => {
                const estado = obtenerEstado(reserva);
                const precio = obtenerPrecioReserva(reserva);
                const horaInicio = formatearHora(reserva.hora_inicio);
                const horaFin = formatearHora(reserva.hora_fin);
                const canchaNombre =
                  reserva.cancha?.nombre ||
                  reserva.cancha_nombre ||
                  `Cancha ${reserva.cancha || ""}`;
                const clubNombre =
                  reserva.cancha?.club?.nombre ||
                  reserva.club_nombre ||
                  reserva.club ||
                  "-";

                const esCancelable =
                  estado === "confirmada" || estado === "pendiente";

                const expandido = expandedId === reserva.id;

                return (
                  <div
                    key={reserva.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3"
                  >
                    {/* fila principal */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {canchaNombre}
                        </p>
                        <p className="text-xs text-slate-500">{clubNombre}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{reserva.fecha}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🕒</span>
                            <span>
                              {horaInicio}–{horaFin}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span>{formatearMoneda(precio)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={
                            "px-3 py-1 rounded-full text-[11px] font-semibold capitalize inline-flex items-center justify-center " +
                            estadoClases(estado)
                          }
                        >
                          {estado}
                        </span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(expandido ? null : reserva.id)
                            }
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50"
                          >
                            {expandido ? "Ocultar Detalles" : "Ver Detalles"}
                          </button>

                          {esCancelable && (
                            <button
                              type="button"
                              onClick={() =>
                                abrirConfirmacionCancelacion(reserva)
                              }
                              disabled={cancellingId === reserva.id}
                              className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {cancellingId === reserva.id
                                ? "Cancelando..."
                                : "Cancelar"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* detalles expandibles */}
                    {expandido && (
                      <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                        <p>
                          <span className="font-semibold">ID reserva: </span>
                          {reserva.id}
                        </p>
                        {reserva.codigo && (
                          <p>
                            <span className="font-semibold">
                              Código de reserva:{" "}
                            </span>
                            {reserva.codigo}
                          </p>
                        )}
                        {reserva.deporte_nombre && (
                          <p>
                            <span className="font-semibold">Deporte: </span>
                            {reserva.deporte_nombre}
                          </p>
                        )}
                        {reserva.metodo_pago && (
                          <p>
                            <span className="font-semibold">
                              Método de pago:{" "}
                            </span>
                            {reserva.metodo_pago}
                          </p>
                        )}
                        {reserva.created_at && (
                          <p>
                            <span className="font-semibold">
                              Fecha de creación:{" "}
                            </span>
                            {reserva.created_at}
                          </p>
                        )}
                        {reserva.descripcion && (
                          <p>
                            <span className="font-semibold">
                              Descripción:{" "}
                            </span>
                            {reserva.descripcion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL CONFIRMACIÓN CANCELACIÓN */}
      {confirmCancelOpen && reservaParaCancelar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Cancelar reserva
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              ¿Estás seguro de que deseas cancelar esta reserva? Esta acción
              quedará registrada en el historial y la cancha volverá a estar
              disponible para otros usuarios.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs text-slate-700">
              <p className="font-semibold mb-1">
                {reservaParaCancelar.cancha?.nombre ||
                  reservaParaCancelar.cancha_nombre ||
                  `Cancha ${reservaParaCancelar.cancha || ""}`}
              </p>
              <p className="text-slate-500 mb-1">
                {reservaParaCancelar.cancha?.club?.nombre ||
                  reservaParaCancelar.club_nombre ||
                  reservaParaCancelar.club ||
                  "-"}
              </p>
              <p>
                📅 {reservaParaCancelar.fecha} · 🕒{" "}
                {formatearHora(reservaParaCancelar.hora_inicio)}–
                {formatearHora(reservaParaCancelar.hora_fin)} · 💰{" "}
                {formatearMoneda(obtenerPrecioReserva(reservaParaCancelar))}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarConfirmacionCancelacion}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={confirmarCancelarReserva}
                disabled={cancellingId === reservaParaCancelar.id}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cancellingId === reservaParaCancelar.id
                  ? "Cancelando..."
                  : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
