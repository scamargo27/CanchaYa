// src/ReservaClubPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

// 👉 Imágenes locales por deporte (igual que en BuscarClubesPage)
import imgFutbol from "./assets/canchas/futbol.png";
import imgTenis from "./assets/canchas/tenis.png";
import imgBasquet from "./assets/canchas/basquet.png";
import imgVoley from "./assets/canchas/voley.png";
import imgPadel from "./assets/canchas/padel.png";
import imgFutsal from "./assets/canchas/futsal.png";
import imgDefault from "./assets/canchas/default.png";

// Horas que se mostrarán en la parte de horarios disponibles (puedes ajustar)
const HORAS_BASE = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

// Mapa deporte → imagen
const SPORT_IMAGES = {
  futbol: imgFutbol,
  futbol7: imgFutbol,
  futbol11: imgFutbol,
  futbolito: imgFutbol,
  futsal: imgFutsal,
  microfutbol: imgFutsal,
  tenis: imgTenis,
  padel: imgPadel,
  basquet: imgBasquet,
  basquetbol: imgBasquet,
  baloncesto: imgBasquet,
  voley: imgVoley,
  voleibol: imgVoley,
};

const normalize = (str = "") =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Devuelve imagen según deporte seleccionado o fallback
function getImageForSport(deporteNombre, club, canchas) {
  if (deporteNombre) {
    const key = normalize(deporteNombre).split(" ")[0]; // "Fútbol 5" → "futbol"
    if (SPORT_IMAGES[key]) return SPORT_IMAGES[key];
  }

  if (club?.imagen_url) return club.imagen_url;
  if (canchas?.length && canchas[0].imagen_url) return canchas[0].imagen_url;

  return "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80";
}

/**
 * Dado el JSON de:
 *   POST /api/reservas/disponibilidad-cancha/{cancha_id}/
 * intenta devolver el slot que empieza a la hora HH:MM seleccionada.
 * Además normaliza el precio en la propiedad `precio_normalizado`.
 */
function obtenerSlotParaHora(data, horaHHMM) {
  if (!data || !Array.isArray(data.slots_disponibles)) {
    console.warn(
      "[ReservaClubPage] data.slots_disponibles no es un array",
      data
    );
    return null;
  }

  // Nos quedamos solo con "HH:MM" por si el backend manda "HH:MM:SS"
  const objetivo = horaHHMM; // "18:00"

  const slotCrudo = data.slots_disponibles.find((slot) => {
    const inicio = (slot.hora_inicio || "").slice(0, 5); // "18:00:00" -> "18:00"
    return inicio === objetivo;
  });

  console.log(
    "[ReservaClubPage] buscando hora",
    objetivo,
    "→ slot encontrado:",
    slotCrudo
  );

  if (!slotCrudo) return null;

  // Normalizar el precio aunque la clave se llame distinto
  const precioNormalizado =
    slotCrudo.precio_hora ??
    slotCrudo.precio ??
    slotCrudo.valor ??
    slotCrudo.monto ??
    null;

  return {
    ...slotCrudo,
    precio_normalizado: precioNormalizado,
  };
}

export default function ReservaClubPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  // fecha mínima (hoy) en formato YYYY-MM-DD
  const hoyStr = new Date().toISOString().slice(0, 10);

  // selección del flujo
  const [deporteSeleccionado, setDeporteSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);

  // precio del slot seleccionado (por hora)
  const [precioHoraSeleccionado, setPrecioHoraSeleccionado] = useState(null);

  // estado para mostrar disponibilidad al elegir hora
  // null | "checking" | "disponible" | "no-disponible" | "error"
  const [estadoDisponibilidad, setEstadoDisponibilidad] = useState(null);

  // 1️⃣ Cargar info del club y sus canchas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const resClub = await api.get(`/api/accounts/clubes/${clubId}/`);
        setClub(resClub.data);

        const resCanchas = await api.get("/api/canchas/", {
          params: { club: clubId },
        });

        const data = resCanchas.data;
        const listaCanchas = Array.isArray(data)
          ? data
          : data.canchas || data.results || [];

        setCanchas(listaCanchas);

        if (listaCanchas.length) {
          setDeporteSeleccionado(listaCanchas[0].deporte_nombre || null);
        }
      } catch (error) {
        console.error("Error cargando club/canchas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  // 2️⃣ Agrupar canchas por deporte para la tarjeta de "Seleccionar Deporte"
  const resumenDeportes = useMemo(() => {
    const map = new Map();
    for (const c of canchas) {
      const dep = c.deporte_nombre || "Otro";
      if (!map.has(dep)) {
        map.set(dep, {
          nombre: dep,
          cantidad: 0,
          precioMin: null,
        });
      }
      const item = map.get(dep);
      item.cantidad += 1;

      const posiblePrecio =
        c.precio_desde || c.tarifa_desde || c.precio_hora || c.precio || null;

      if (posiblePrecio != null) {
        const num = Number(posiblePrecio);
        if (!Number.isNaN(num)) {
          if (item.precioMin == null || num < item.precioMin) {
            item.precioMin = num;
          }
        }
      }
    }
    return Array.from(map.values());
  }, [canchas]);

  // 3️⃣ Canchas filtradas por el deporte seleccionado
  const canchasFiltradas = useMemo(() => {
    if (!deporteSeleccionado) return [];
    return canchas.filter(
      (c) => normalize(c.deporte_nombre) === normalize(deporteSeleccionado)
    );
  }, [canchas, deporteSeleccionado]);

  // 4️⃣ Imagen principal según deporte
  const imagenPrincipal = useMemo(
    () => getImageForSport(deporteSeleccionado, club, canchas),
    [deporteSeleccionado, club, canchas]
  );

  // 5️⃣ Verificar disponibilidad al seleccionar hora (usando disponibilidad-cancha)
  const handleSeleccionHora = async (hora) => {
    setHoraSeleccionada(hora);
    setEstadoDisponibilidad(null);
    setPrecioHoraSeleccionado(null);

    // No permitir fechas pasadas
    if (fechaSeleccionada < hoyStr) {
      setEstadoDisponibilidad("no-disponible");
      return;
    }

    if (!deporteSeleccionado) return;

    const canchaBase = canchasFiltradas[0];
    if (!canchaBase) return;

    setEstadoDisponibilidad("checking");
    try {
      const res = await api.post(
        `/api/reservas/disponibilidad-cancha/${canchaBase.id}/`,
        {
          fecha: fechaSeleccionada,
        }
      );

      console.log(
        "[ReservaClubPage] respuesta cruda de disponibilidad (hora):",
        res.data
      );

      const slot = obtenerSlotParaHora(res.data, hora);

      if (slot && slot.precio_normalizado != null) {
        setEstadoDisponibilidad("disponible");
        setPrecioHoraSeleccionado(slot.precio_normalizado);
      } else if (slot) {
        setEstadoDisponibilidad("disponible");
        setPrecioHoraSeleccionado(null);
        console.warn(
          "[ReservaClubPage] slot encontrado pero sin precio_normalizado:",
          slot
        );
      } else {
        setEstadoDisponibilidad("no-disponible");
        setPrecioHoraSeleccionado(null);
      }
    } catch (error) {
      console.error("Error verificando disponibilidad de hora", error);
      setEstadoDisponibilidad("error");
      setPrecioHoraSeleccionado(null);
    }
  };

  // 6️⃣ Seleccionar cancha (valida disponibilidad específica y redirige)
  const handleSeleccionarCancha = async (cancha) => {
    if (!deporteSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      alert("Primero selecciona deporte, fecha y hora.");
      return;
    }

    if (fechaSeleccionada < hoyStr) {
      setEstadoDisponibilidad("no-disponible");
      alert("No puedes reservar en una fecha anterior a hoy.");
      return;
    }

    try {
      const res = await api.post(
        `/api/reservas/disponibilidad-cancha/${cancha.id}/`,
        {
          fecha: fechaSeleccionada,
        }
      );

      console.log(
        "[ReservaClubPage] respuesta cruda de disponibilidad (cancha seleccionada):",
        res.data
      );

      const slot = obtenerSlotParaHora(res.data, horaSeleccionada);

      if (!slot) {
        setEstadoDisponibilidad("no-disponible");
        setPrecioHoraSeleccionado(null);
        alert(
          "Esta cancha no está disponible en la fecha y hora seleccionadas. Por favor elige otro horario."
        );
        return;
      }

      setEstadoDisponibilidad("disponible");
      setPrecioHoraSeleccionado(slot.precio_normalizado ?? null);
      // Enviamos también el precio y la info de la tarifa a la página de pago
      navigate("/procesar-pago", {
        state: {
          club,
          cancha,
          deporte: deporteSeleccionado,
          fecha: fechaSeleccionada,
          hora: horaSeleccionada,
          precioHora: slot.precio_normalizado ?? null,
          tarifaTitulo: slot.tarifa_titulo,
        },
      });

    } catch (error) {
      console.error("Error verificando disponibilidad de la cancha", error);
      alert(
        "Ocurrió un error al consultar la disponibilidad. Intenta nuevamente más tarde."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Cargando información...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          No se encontró la información del club.
        </p>
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
            <Link
              to="/deportista/buscar"
              className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold"
            >
              Buscar
            </Link>
            <Link to="/deportista/reservas" className="text-slate-700">
              Mis Reservas
            </Link>
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
        <section className="max-w-6xl mx-auto px-8 py-8 space-y-6">
          {/* Volver a la búsqueda */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2"
          >
            <span>←</span>
            <span>Volver a la búsqueda</span>
          </button>

          {/* HERO + INFO CLUB */}
          <div className="grid grid-cols-[2fr,1fr] gap-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <div className="h-72 bg-slate-200">
                <img
                  src={imagenPrincipal}
                  alt={club.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <aside className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-3">
              <h3 className="font-semibold text-slate-900 mb-2">
                Información del Club
              </h3>

              <h2 className="font-semibold text-slate-900">{club.nombre}</h2>

              <div className="flex items-start gap-2 text-sm text-slate-600">
                <span>📍</span>
                <span>{club.direccion || club.direccion_completa}</span>
              </div>

              {club.telefono_1 && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>📞</span>
                  <span>{club.telefono_1}</span>
                </div>
              )}

              {club.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>✉️</span>
                  <span>{club.email}</span>
                </div>
              )}

              <p className="mt-2 text-sm text-slate-600">
                Club especializado con canchas profesionales y entrenadores
                certificados. Equipamiento de última generación.
              </p>
            </aside>
          </div>

          {/* CUERPO PRINCIPAL: pasos + resumen selección */}
          <div className="grid grid-cols-[2fr,1fr] gap-6">
            {/* Pasos de reserva */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="font-semibold text-slate-900 mb-1">
                Reservar en {club.nombre}
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Sigue estos pasos para completar tu reserva
              </p>

              {/* 1. Seleccionar deporte */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                    1
                  </span>
                  <span>Seleccionar Deporte</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {resumenDeportes.map((dep) => {
                    const activo =
                      normalize(dep.nombre) === normalize(deporteSeleccionado);
                    return (
                      <button
                        key={dep.nombre}
                        type="button"
                        onClick={() => {
                          setDeporteSeleccionado(dep.nombre);
                          setHoraSeleccionada(null);
                          setEstadoDisponibilidad(null);
                          setPrecioHoraSeleccionado(null);
                        }}
                        className={
                          "rounded-2xl border px-6 py-4 text-left text-sm transition " +
                          (activo
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:border-blue-300")
                        }
                      >
                        <p className="font-semibold text-slate-900">
                          {dep.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          {dep.cantidad} canchas
                        </p>
                        <p className="mt-2 text-xs text-slate-700">
                          {dep.precioMin != null
                            ? `Desde S/ ${dep.precioMin}`
                            : "Consultar precio"}
                        </p>
                      </button>
                    );
                  })}

                  {resumenDeportes.length === 0 && (
                    <p className="text-sm text-slate-500 col-span-2">
                      Este club aún no tiene canchas registradas.
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Seleccionar fecha y hora */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                    2
                  </span>
                  <span>Seleccionar Fecha y Hora</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Fecha */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Seleccionar Fecha
                    </p>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={fechaSeleccionada}
                      min={hoyStr}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value < hoyStr) {
                          setFechaSeleccionada(hoyStr);
                          setEstadoDisponibilidad("no-disponible");
                          setHoraSeleccionada(null);
                          setPrecioHoraSeleccionado(null);
                          return;
                        }
                        setFechaSeleccionada(value);
                        setEstadoDisponibilidad(null);
                        setHoraSeleccionada(null);
                        setPrecioHoraSeleccionado(null);
                      }}
                    />
                  </div>

                  {/* Horarios disponibles */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Horarios Disponibles
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {HORAS_BASE.map((hora) => {
                        const activo = hora === horaSeleccionada;
                        return (
                          <button
                            key={hora}
                            type="button"
                            onClick={() => handleSeleccionHora(hora)}
                            className={
                              "h-9 rounded-xl border text-xs font-medium transition " +
                              (activo
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-800 border-slate-200 hover:border-slate-400")
                            }
                          >
                            {hora}
                          </button>
                        );
                      })}
                    </div>

                    {horaSeleccionada && (
                      <p className="text-xs mt-2">
                        {estadoDisponibilidad === "checking" && (
                          <span className="text-slate-500">
                            Verificando disponibilidad para {fechaSeleccionada} a
                            las {horaSeleccionada}...
                          </span>
                        )}
                        {estadoDisponibilidad === "disponible" && (
                          <span className="text-emerald-600 font-semibold">
                            Hay canchas disponibles para esa hora. 🟢
                          </span>
                        )}
                        {estadoDisponibilidad === "no-disponible" && (
                          <span className="text-red-600 font-semibold">
                            No hay canchas disponibles para esa fecha y hora. 🔴
                          </span>
                        )}
                        {estadoDisponibilidad === "error" && (
                          <span className="text-amber-600">
                            Ocurrió un error al consultar la disponibilidad.
                            Intenta de nuevo más tarde.
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Seleccionar cancha */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                    3
                  </span>
                  <span>Seleccionar Cancha</span>
                </div>

                <p className="text-xs text-slate-500 mb-2">
                  {deporteSeleccionado && horaSeleccionada
                    ? `Canchas de ${deporteSeleccionado} disponibles para ${fechaSeleccionada} a las ${horaSeleccionada}`
                    : "Selecciona primero deporte, fecha y hora para ver canchas disponibles."}
                </p>

                <div className="space-y-3">
                  {canchasFiltradas.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No hay canchas registradas para este deporte.
                    </p>
                  )}

                  {canchasFiltradas.map((cancha) => (
                    <div
                      key={cancha.id}
                      className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {cancha.nombre || `Cancha ${cancha.id}`}
                        </p>
                        <p className="text-xs text-slate-600">
                          {cancha.deporte_nombre} •{" "}
                          {cancha.capacidad_jugadores
                            ? `${cancha.capacidad_jugadores} jugadores`
                            : "Capacidad estándar"}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700 font-semibold">
                          {estadoDisponibilidad === "disponible"
                            ? "Disponible"
                            : "Sujeto a disponibilidad"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {precioHoraSeleccionado != null
                            ? `S/ ${precioHoraSeleccionado}`
                            : cancha.precio_desde ||
                              cancha.tarifa_desde ||
                              cancha.precio_hora ||
                              cancha.precio
                            ? `S/ ${
                                cancha.precio_desde ||
                                cancha.tarifa_desde ||
                                cancha.precio_hora ||
                                cancha.precio
                              }`
                            : "Consultar precio"}
                        </p>
                        <p className="text-[11px] text-slate-500">por hora</p>
                        <button
                          type="button"
                          onClick={() => handleSeleccionarCancha(cancha)}
                          className="mt-2 inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen de selección */}
            <aside className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">
                Resumen de Selección
              </h3>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Deporte:</span>
                  <span className="font-medium text-slate-900">
                    {deporteSeleccionado || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha:</span>
                  <span className="font-medium text-slate-900">
                    {fechaSeleccionada || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hora:</span>
                  <span className="font-medium text-slate-900">
                    {horaSeleccionada || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Precio estimado:</span>
                  <span className="font-medium text-slate-900">
                    {precioHoraSeleccionado != null
                      ? `S/ ${precioHoraSeleccionado}`
                      : "-"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
