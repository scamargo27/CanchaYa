// src/ClubInicioPage.js
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

// ===== helpers de formato =====
function hoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHora(horaStr) {
  if (!horaStr) return "-";
  // backend manda "HH:MM:SS"
  const [hh, mm] = String(horaStr).split(":");
  if (!hh || !mm) return horaStr;
  return `${hh}:${mm}`;
}

function formatPrecio(precio) {
  if (precio == null) return "-";
  const num = Number(precio);
  if (Number.isNaN(num)) return precio;
  return `S/ ${num.toFixed(0)}`;
}

function badgeEstado(estado) {
  switch (estado) {
    case "confirmada":
      return {
        text: "confirmada",
        classes:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    case "pendiente":
      return {
        text: "pendiente",
        classes: "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "en_curso":
    case "en-curso":
    case "en curso":
      return {
        text: "en curso",
        classes: "bg-sky-50 text-sky-700 border border-sky-200",
      };
    case "cancelada":
      return {
        text: "cancelada",
        classes: "bg-red-50 text-red-600 border border-red-200",
      };
    default:
      return {
        text: estado || "desconocido",
        classes: "bg-slate-50 text-slate-600 border border-slate-200",
      };
  }
}

// ===== componente principal =====

export default function ClubInicioPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [openDetalleId, setOpenDetalleId] = useState(null);
  const [detalles, setDetalles] = useState({}); // id -> reserva detalle
  const [loadingDetalleId, setLoadingDetalleId] = useState(null);

  const [cancelandoId, setCancelandoId] = useState(null);
  const [mensajeOk, setMensajeOk] = useState(null);

  const fechaHoy = useMemo(() => hoyISO(), []);


// === cargar reservas de hoy del club ===
useEffect(() => {
  const fetchReservas = async () => {
    setLoading(true);
    setErrorMsg(null);
    setMensajeOk(null);

    try {
      // Dejamos que el backend filtre por fecha
      const res = await api.get("/api/reservas/reservas-club/", {
        params: { fecha: fechaHoy },
      });

      const data = res.data || {};
      console.log("Respuesta reservas-club ===>", data);

      // Según la documentación: { exito, total, reservas: [...] }
      const lista = Array.isArray(data.reservas) ? data.reservas : [];

      console.log("Reservas que llegan del backend ===>", lista);

      setReservas(lista);
    } catch (error) {
      console.error("Error cargando reservas del club", error);
      setErrorMsg(
        "Ocurrió un error al cargar las reservas del club. Revisa la consola del navegador para más detalles."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchReservas();
}, [fechaHoy]);


  // === abrir/cerrar detalle ===
  const toggleDetalle = async (reserva) => {
    const id = reserva.id;
    if (!id) return;

    // si ya está abierto, se cierra
    if (openDetalleId === id) {
      setOpenDetalleId(null);
      return;
    }

    // si ya tenemos detalle cargado, solo abrir
    if (detalles[id]) {
      setOpenDetalleId(id);
      return;
    }

    // cargar detalle del backend
    setLoadingDetalleId(id);
    setErrorMsg(null);
    try {
      // GET /api/reservas/{id}/
      const res = await api.get(`/api/reservas/${id}/`);
      const data = res.data?.reserva || res.data || {};
      setDetalles((prev) => ({ ...prev, [id]: data }));
      setOpenDetalleId(id);
    } catch (error) {
      console.error("Error cargando detalle de reserva", error);
      setErrorMsg(
        "No se pudo cargar el detalle de la reserva. Intenta nuevamente."
      );
    } finally {
      setLoadingDetalleId(null);
    }
  };

  // === cancelar reserva ===
  const cancelarReserva = async (reserva) => {
    const id = reserva.id;
    if (!id) return;

    if (
      !window.confirm(
        "¿Seguro que deseas cancelar esta reserva? El deportista será notificado."
      )
    ) {
      return;
    }

    setCancelandoId(id);
    setErrorMsg(null);
    setMensajeOk(null);

    try {
      // POST /api/reservas/{id}/cancelar/
      const res = await api.post(`/api/reservas/${id}/cancelar/`);
      const data = res.data || {};

      // actualizar lista principal
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                estado: "cancelada",
                estado_display: "Cancelada",
              }
            : r
        )
      );

      // actualizar detalle si estaba cargado
      if (detalles[id]) {
        setDetalles((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            estado: "cancelada",
            estado_display: "Cancelada",
          },
        }));
      }

      setMensajeOk(
        data.mensaje || "La reserva ha sido cancelada correctamente."
      );
    } catch (error) {
      console.error("Error cancelando reserva", error);
      const detalle =
        error.response?.data?.mensaje ||
        error.response?.data?.detalle ||
        error.response?.data?.error ||
        "No se pudo cancelar la reserva. Intenta nuevamente.";
      setErrorMsg(detalle);
    } finally {
      setCancelandoId(null);
    }
  };

  // === render loading simple ===
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* navbar club */}
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
            Cargando las reservas de hoy...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR CLUB / ADMIN */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
            <span className="font-bold text-xl text-blue-700">
              CanchaYa
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">
              Inicio
            </span>
            <Link to="/club/canchas" className="text-slate-700">
              Canchas
            </Link>
            <Link to="/club/reservas" className="text-slate-700">
              Reservas
            </Link>
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
        <section className="max-w-6xl mx-auto px-8 py-8">
          {/* encabezado club */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Club Deportivo
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              Reservas de Hoy
            </h1>
            <p className="text-sm text-slate-500">
              Reservas programadas para el día de hoy ({fechaHoy}).
            </p>
          </div>

          {errorMsg && (
            <p className="mb-4 text-xs text-red-600 whitespace-pre-wrap">
              {errorMsg}
            </p>
          )}
          {mensajeOk && (
            <p className="mb-4 text-xs text-emerald-600 whitespace-pre-wrap">
              {mensajeOk}
            </p>
          )}

          {/* lista de reservas */}
          {reservas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No tienes reservas programadas para hoy.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              {reservas.map((r, idx) => {
                const badge = badgeEstado(r.estado);
                const mostrarCancelar =
                  r.estado === "pendiente" || r.estado === "confirmada";

                const isOpen = openDetalleId === r.id;
                const det = detalles[r.id];

                return (
                  <div
                    key={r.id}
                    className={
                      "px-6 py-4 flex flex-col gap-3 border-b border-slate-100 " +
                      (idx === reservas.length - 1 ? "last:border-b-0" : "")
                    }
                  >
                    {/* fila principal */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex flex-col gap-1 text-sm">
                        <p className="font-semibold text-slate-900">
                          {r.deportista_nombre || "Deportista"}
                        </p>
                        <p className="text-slate-600 text-xs md:text-sm">
                          {r.cancha_nombre} •{" "}
                          {formatHora(r.hora_inicio)}-
                          {formatHora(r.hora_fin)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end text-xs">
                          <span
                            className={
                              "inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold capitalize " +
                              badge.classes
                            }
                          >
                            {badge.text}
                          </span>
                          <span className="mt-1 font-semibold text-slate-900">
                            {formatPrecio(r.precio)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleDetalle(r)}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          {loadingDetalleId === r.id
                            ? "Cargando..."
                            : isOpen
                            ? "Cerrar"
                            : "Ver"}
                        </button>

                        {mostrarCancelar && (
                          <button
                            type="button"
                            onClick={() => cancelarReserva(r)}
                            disabled={cancelandoId === r.id}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {cancelandoId === r.id
                              ? "Cancelando..."
                              : "Cancelar"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* detalle expandible */}
                    {isOpen && (
                      <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-700">
                        {loadingDetalleId === r.id && !det && (
                          <p>Cargando detalle...</p>
                        )}
                        {det && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <p>
                              <span className="font-semibold">
                                Deporte:{" "}
                              </span>
                              {det.deporte_nombre || r.deporte_nombre}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Teléfono deportista:{" "}
                              </span>
                              {det.deportista_telefono || "—"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Email deportista:{" "}
                              </span>
                              {det.deportista_email || "—"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Observaciones:{" "}
                              </span>
                              {det.observaciones || "Sin observaciones"}
                            </p>
                          </div>
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
    </div>
  );
}
