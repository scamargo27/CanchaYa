// src/NotificacionesPage.js
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

// === helpers de formato ===
function formatearFecha(fechaStr) {
  if (!fechaStr) return "-";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return "-";
  try {
    return d.toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

/**
 * Normaliza una reserva del backend y la convierte en una "notificación".
 */
function notificacionDesdeReserva(r) {
  const estadoRaw =
    r.estado ||
    r.estado_reserva ||
    r.estadoReserva ||
    r.status ||
    "";

  const estadoLower = String(estadoRaw).toLowerCase();

  let tipo = "general";
  if (estadoLower.includes("confirm")) {
    tipo = "reserva_confirmada";
  } else if (estadoLower.includes("cancel")) {
    tipo = "reserva_cancelada";
  } else if (estadoLower.includes("curso") || estadoLower.includes("en_curso")) {
    tipo = "recordatorio_reserva";
  }

  const canchaNombre =
    r.cancha_nombre ||
    r.nombre_cancha ||
    (r.cancha && r.cancha.nombre) ||
    "Cancha";

  const codigo =
    r.codigo ||
    r.codigo_reserva ||
    r.code ||
    (r.id != null ? `RES-${r.id}` : "Reserva");

  const fechaReserva =
    r.fecha ||
    r.fecha_reserva ||
    r.fecha_partido ||
    r.fecha_hora ||
    r.created_at ||
    r.fecha_creacion ||
    null;

  const horaInicio =
    r.hora_inicio ||
    r.horaInicio ||
    r.hora_inicio_reserva ||
    "";
  const horaFin =
    r.hora_fin ||
    r.horaFin ||
    r.hora_fin_reserva ||
    "";

  const estadoTexto =
    estadoRaw || "sin estado";

  const titulo = `Reserva ${canchaNombre}`;
  const mensaje = `${codigo} – Tu reserva para ${canchaNombre} está ${estadoTexto}. ${
    fechaReserva ? "Fecha: " + formatearFecha(fechaReserva) : ""
  } ${
    horaInicio || horaFin ? `Horario: ${horaInicio || "–"} a ${horaFin || "–"}` : ""
  }`.trim();

  return {
    id: r.id,
    tipo,
    titulo,
    mensaje,
    fecha: fechaReserva,
    leida: false,
    raw: r,
  };
}

/**
 * Recibe la respuesta del endpoint de reservas y devuelve
 * una lista de notificaciones normalizadas.
 */
function normalizarListaDesdeReservas(data) {
  let reservas = [];

  if (Array.isArray(data?.reservas)) {
    reservas = data.reservas;
  } else if (Array.isArray(data?.results)) {
    reservas = data.results;
  } else if (Array.isArray(data)) {
    reservas = data;
  }

  return reservas.map(notificacionDesdeReserva);
}

function configTipo(tipo) {
  switch (tipo) {
    case "reserva_confirmada":
      return {
        icono: "✅",
        badgeText: "Reserva confirmada",
        badgeClasses:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    case "reserva_cancelada":
    case "cancelacion":
      return {
        icono: "⚠️",
        badgeText: "Reserva cancelada",
        badgeClasses:
          "bg-red-50 text-red-600 border border-red-200",
      };
    case "recordatorio_reserva":
      return {
        icono: "⏰",
        badgeText: "Recordatorio",
        badgeClasses:
          "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "promocion":
      return {
        icono: "🎁",
        badgeText: "Promoción",
        badgeClasses:
          "bg-purple-50 text-purple-700 border border-purple-200",
      };
    default:
      return {
        icono: "🔔",
        badgeText: "Notificación",
        badgeClasses: "bg-slate-50 text-slate-700 border border-slate-200",
      };
  }
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [marcandoId, setMarcandoId] = useState(null);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        // ⚠️ Usa el MISMO endpoint que uses en MisReservasPage del deportista.
        // Si en tu proyecto se llama distinto, cámbialo aquí.
        const res = await api.get("/api/reservas/mis-reservas/");
        const data = res.data || {};

        const listaNormalizada = normalizarListaDesdeReservas(data);

        // Orden: primero no leídas, luego por fecha descendente
        listaNormalizada.sort((a, b) => {
          if (a.leida !== b.leida) return a.leida ? 1 : -1;
          const fa = a.fecha || "";
          const fb = b.fecha || "";
          return fb.localeCompare(fa);
        });

        setNotificaciones(listaNormalizada);
      } catch (error) {
        console.error("Error cargando notificaciones derivadas de reservas", error);
        const status = error.response?.status;
        if (status === 404) {
          // Si ni siquiera existe el endpoint de reservas del deportista
          setNotificaciones([]);
          setErrorMsg(null);
        } else {
          setErrorMsg("Ocurrió un error al cargar tus notificaciones.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  const hayNoLeidas = useMemo(
    () => notificaciones.some((n) => !n.leida),
    [notificaciones]
  );

  // === marcar como "leída" sólo en el frontend (no hay backend de notificaciones) ===
  const marcarComoLeida = async (notif) => {
    if (!notif || notif.leida) return;
    const id = notif.id;
    setMarcandoId(id);

    // Sólo cambiamos el estado local, sin llamar al backend
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      )
    );

    setTimeout(() => setMarcandoId(null), 300);
  };

  // === render ===
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navbar */}
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
            Cargando tus notificaciones...
          </p>
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
            <span className="font-bold text-xl text-blue-700">
              CanchaYa
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/deportista/buscar" className="text-slate-700">
              Buscar
            </Link>
            <Link
              to="/deportista/reservas"
              className="text-slate-700"
            >
              Mis Reservas
            </Link>
            <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">
              Notificaciones
            </span>
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-slate-900">
              Notificaciones
            </h1>
            {hayNoLeidas && (
              <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Tienes notificaciones sin leer
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Mantente al día con tus reservas y promociones.
          </p>

          {errorMsg && (
            <p className="mb-4 text-xs text-red-600">{errorMsg}</p>
          )}

          {notificaciones.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-sm text-slate-500">
              Aún no tienes notificaciones. Cuando reserves o
              canceles una cancha, verás los avisos aquí.
            </div>
          ) : (
            <div className="space-y-3">
              {notificaciones.map((n) => {
                const cfg = configTipo(n.tipo);
                const esNoLeida = !n.leida;
                return (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => marcarComoLeida(n)}
                    className={
                      "w-full text-left rounded-2xl border shadow-sm px-5 py-4 flex items-start gap-3 transition " +
                      (esNoLeida
                        ? "bg-blue-50/70 border-blue-100 hover:bg-blue-50"
                        : "bg-white border-slate-200 hover:bg-slate-50")
                    }
                    disabled={marcandoId === n.id}
                  >
                    {/* icono */}
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                        {cfg.icono}
                      </div>
                    </div>

                    {/* contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="text-sm font-semibold text-slate-900 truncate">
                            {n.titulo}
                          </h2>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {n.mensaje}
                          </p>
                        </div>
                        {/* punto azul de no leída */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold " +
                              cfg.badgeClasses
                            }
                          >
                            {cfg.badgeText}
                          </span>
                          {esNoLeida && (
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>

                      <p className="mt-2 text-[11px] text-slate-500">
                        {formatearFecha(n.fecha)}
                        {marcandoId === n.id && " · Marcando como leída..."}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
