// src/AdminCanchasPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";
// imágenes locales por deporte
import imgFutbol from "./assets/canchas/futbol.png";
import imgBasquet from "./assets/canchas/basquet.png";
import imgTenis from "./assets/canchas/tenis.png";
import imgFutsal from "./assets/canchas/futsal.png";
import imgPadel from "./assets/canchas/padel.png";
import imgVoley from "./assets/canchas/voley.png";
import imgDefault from "./assets/canchas/default.png";


/** ================= helpers básicos ================= */

function hoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatPrecio(num) {
  if (num == null) return "S/ 0";
  const n = Number(num);
  if (Number.isNaN(n)) return `S/ ${num}`;
  return `S/ ${n.toFixed(0)}`;
}

// URLs de imagen por defecto según deporte (id o nombre)
// Selecciona imágenes locales según deporte
function imagenPorDefecto(deporteId, deporteNombre = "") {
  const id = Number(deporteId);
  const nombre = (deporteNombre || "").toLowerCase();

  if (id === 1 || nombre.includes("fútbol") || nombre.includes("futbol")) {
    return imgFutbol;
  }
  if (id === 2 || nombre.includes("baloncesto") || nombre.includes("básquet") || nombre.includes("basket")) {
    return imgBasquet;
  }
  if (id === 3 || nombre.includes("tenis")) {
    return imgTenis;
  }
  if (id === 4 || nombre.includes("futsal")) {
    return imgFutsal;
  }
  if (id === 5 || nombre.includes("padel") || nombre.includes("pádel")) {
    return imgPadel;
  }
  if (id === 6 || nombre.includes("voley") || nombre.includes("vóley") || nombre.includes("volleyball")) {
    return imgVoley;
  }

  // genérica
  return imgDefault;
}


// Normaliza la cancha que viene del backend
function normalizarCancha(c, reservasHoyMap) {
  const id = c.id;

  const deporteId =
    c.deporte_id ??
    (typeof c.deporte === "object" && c.deporte !== null ? c.deporte.id : undefined) ??
    c.deporte ??
    c.deporteId ??
    null;

  const deporteNombre =
    c.deporte_nombre ??
    (typeof c.deporte === "object" && c.deporte !== null ? c.deporte.nombre : undefined) ??
    c.deporteNombre ??
    "";

  const capacidad =
    c.capacidad_jugadores ?? c.capacidad ?? c.capacidadJugadores ?? null;

  const superficie =
    c.superficie ?? c.tipo_superficie ?? c.surface ?? "No especificada";

  const isTechada =
    c.is_techada ?? c.techada ?? c.cubierta ?? c.isTechada ?? false;

  const isActiva = c.is_activa ?? c.activa ?? c.isActiva ?? true;

  const descripcion = c.descripcion ?? c.description ?? "";

  const reservasHoyBackend =
    c.reservas_hoy ?? c.reservas_hoy_count ?? c.reservas_count;

  const reservasHoy =
    reservasHoyBackend != null
      ? reservasHoyBackend
      : reservasHoyMap && id
      ? reservasHoyMap[id] || 0
      : 0;

  const base = {
    id,
    nombre: c.nombre ?? "",
    deporteId,
    deporteNombre,
    capacidad,
    superficie,
    isTechada,
    isActiva,
    descripcion,
    reservasHoy,
  };

  const imagen =
    c.imagenUrl || c.image_url || c.foto_url || imagenPorDefecto(deporteId, deporteNombre);

  return { ...base, imagenUrl: imagen };
}

function normalizarDeporte(d) {
  return {
    id: d.id,
    nombre: d.nombre ?? d.name ?? "",
  };
}

function normalizarTarifa(t) {
  return {
    id: t.id,
    dia_semana: t.dia_semana ?? t.diaSemana ?? t.dia ?? 0,
    hora_inicio: t.hora_inicio ?? t.horaInicio ?? t.inicio ?? "",
    hora_fin: t.hora_fin ?? t.horaFin ?? t.fin ?? "",
    precio: t.precio ?? t.precio_hora ?? t.monto ?? 0,
  };
}

const DIAS_SEMANA = [
  { value: 0, label: "Lunes" },
  { value: 1, label: "Martes" },
  { value: 2, label: "Miércoles" },
  { value: 3, label: "Jueves" },
  { value: 4, label: "Viernes" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

/** ================= componente principal ================= */

export default function AdminCanchasPage() {
  const [canchas, setCanchas] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tabActiva, setTabActiva] = useState("general"); // "general" | "tarifas"
  const [modo, setModo] = useState("crear"); // "crear" | "editar"
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    deporteId: "",
    capacidad: "",
    superficie: "",
    isTechada: false,
    isActiva: true,
    descripcion: "",
    imagenUrl: "",
  });

  // tarifas
  const [tarifas, setTarifas] = useState([]);
  const [loadingTarifas, setLoadingTarifas] = useState(false);
  const [agregandoTarifa, setAgregandoTarifa] = useState(false);
  const [tarifaNueva, setTarifaNueva] = useState({
    dia_semana: 0,
    hora_inicio: "",
    hora_fin: "",
    precio: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  const fechaHoy = useMemo(() => hoyISO(), []);

  /** ========== función reutilizable para recargar datos ========== */

  const recargarDatos = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [resCanchas, resReservas, resDeportes] = await Promise.all([
        api.get("/api/canchas/"),
        api.get("/api/reservas/reservas-club/", {
          params: { fecha: fechaHoy },
        }),
        api.get("/api/core/deportes/"),
      ]);

      const dataCanchas = Array.isArray(resCanchas.data?.results)
        ? resCanchas.data.results
        : Array.isArray(resCanchas.data?.canchas)
        ? resCanchas.data.canchas
        : Array.isArray(resCanchas.data)
        ? resCanchas.data
        : [];

      const dataReservas = Array.isArray(resReservas.data?.reservas)
        ? resReservas.data.reservas
        : Array.isArray(resReservas.data?.results)
        ? resReservas.data.results
        : Array.isArray(resReservas.data)
        ? resReservas.data
        : [];

      const reservasHoyMap = {};
      for (const r of dataReservas) {
        const canchaId =
          r.cancha ?? r.cancha_id ?? r.canchaId ?? r.canchaId_id;
        if (!canchaId) continue;
        reservasHoyMap[canchaId] = (reservasHoyMap[canchaId] || 0) + 1;
      }

      const canchasNorm = dataCanchas.map((c) =>
        normalizarCancha(c, reservasHoyMap)
      );

      let rawDeportes = [];
      if (Array.isArray(resDeportes.data?.results)) {
        rawDeportes = resDeportes.data.results;
      } else if (Array.isArray(resDeportes.data?.deportes)) {
        rawDeportes = resDeportes.data.deportes;
      } else if (Array.isArray(resDeportes.data)) {
        rawDeportes = resDeportes.data;
      }

      const deportesNorm = rawDeportes.map(normalizarDeporte);

      setCanchas(canchasNorm);
      setDeportes(deportesNorm);
    } catch (error) {
      console.error("Error cargando canchas del club", error);
      setErrorMsg(
        "Ocurrió un error al cargar las canchas o los deportes. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  /** ========== cargar datos al iniciar ========== */

  useEffect(() => {
    recargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaHoy]);

  /** ================= helpers de modal ================= */

  const abrirModalCrear = () => {
    setModo("crear");
    setTabActiva("general");
    setForm({
      id: null,
      nombre: "",
      deporteId: deportes.length ? String(deportes[0].id) : "",
      capacidad: "",
      superficie: "",
      isTechada: false,
      isActiva: true,
      descripcion: "",
      imagenUrl: "",
    });
    setTarifas([]);
    setTarifaNueva({
      dia_semana: 0,
      hora_inicio: "",
      hora_fin: "",
      precio: "",
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = async (cancha) => {
    setModo("editar");
    setTabActiva("general");
    setForm({
      id: cancha.id,
      nombre: cancha.nombre,
      deporteId:
        cancha.deporteId != null && cancha.deporteId !== ""
          ? String(cancha.deporteId)
          : "",
      capacidad: cancha.capacidad || "",
      superficie: cancha.superficie || "",
      isTechada: !!cancha.isTechada,
      isActiva: !!cancha.isActiva,
      descripcion: cancha.descripcion || "",
      imagenUrl: cancha.imagenUrl || "",
    });

    setModalAbierto(true);
    await cargarTarifas(cancha.id);
  };

  const cerrarModal = () => {
    if (guardando || eliminandoId || agregandoTarifa) return;
    setModalAbierto(false);
  };

  const onChangeForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /** ================= tarifas - backend ================= */

  const cargarTarifas = async (canchaId) => {
    if (!canchaId) return;
    try {
      setLoadingTarifas(true);
      const res = await api.get(`/api/canchas/${canchaId}/tarifas/`);
      const data = Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data)
        ? res.data
        : [];
      setTarifas(data.map(normalizarTarifa));
    } catch (error) {
      console.error("Error cargando tarifas de la cancha", error);
      setTarifas([]);
    } finally {
      setLoadingTarifas(false);
    }
  };

  const onChangeTarifaNueva = (e) => {
    const { name, value } = e.target;
    setTarifaNueva((prev) => ({ ...prev, [name]: value }));
  };

  const agregarTarifaBackend = async () => {
    if (!form.id) return;
    if (
      !tarifaNueva.hora_inicio ||
      !tarifaNueva.hora_fin ||
      !tarifaNueva.precio
    ) {
      return;
    }

    try {
      setAgregandoTarifa(true);
      const payload = {
        dia_semana: Number(tarifaNueva.dia_semana),
        hora_inicio: tarifaNueva.hora_inicio,
        hora_fin: tarifaNueva.hora_fin,
        precio: Number(tarifaNueva.precio), // el backend espera "precio"
      };
      const res = await api.post(
        `/api/canchas/${form.id}/crear-tarifa/`,
        payload
      );
      const tCreada = res.data?.tarifa || res.data;
      setTarifas((prev) => [...prev, normalizarTarifa(tCreada)]);
      setTarifaNueva({
        dia_semana: tarifaNueva.dia_semana,
        hora_inicio: "",
        hora_fin: "",
        precio: "",
      });
    } catch (error) {
      console.error("Error creando tarifa", error);
      const detalle =
        error.response?.data?.detalle ||
        JSON.stringify(error.response?.data || "") ||
        "No se pudo crear la tarifa (ver consola).";
      setErrorMsg(detalle);
    } finally {
      setAgregandoTarifa(false);
    }
  };

  /** ================= crear / actualizar cancha ================= */

  const guardarCancha = async (e) => {
    e.preventDefault();
    if (guardando) return;

    try {
      setGuardando(true);
      setErrorMsg(null);

      const payload = {
        deporte:
          form.deporteId === "" || form.deporteId == null
            ? null
            : Number(form.deporteId),
        nombre: form.nombre,
        capacidad_jugadores: Number(form.capacidad) || 0,
        superficie: form.superficie || "",
        is_techada: !!form.isTechada,
        is_activa: !!form.isActiva,
        descripcion: form.descripcion || "",
      };

      if (modo === "crear") {
        await api.post("/api/canchas/", payload);
      } else {
        await api.put(`/api/canchas/${form.id}/`, payload);
      }

      // recargamos todos los datos desde el backend para que
      // los cambios se vean inmediatamente sin refrescar la página
      await recargarDatos();

      setModalAbierto(false);
    } catch (error) {
      console.error("Error guardando cancha", error);
      const detalle =
        error.response?.data?.detalle ||
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data || "") ||
        "Ocurrió un error al guardar la cancha.";
      setErrorMsg(detalle);
    } finally {
      setGuardando(false);
    }
  };

  /** ================= eliminar cancha ================= */

  const eliminarCancha = async (cancha) => {
    if (!cancha || !cancha.id) return;
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar la cancha "${cancha.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      setEliminandoId(cancha.id);
      await api.delete(`/api/canchas/${cancha.id}/`);

      // Actualizamos la UI inmediatamente filtrando la lista
      setCanchas((prev) => prev.filter((c) => c.id !== cancha.id));

      // Y recargamos desde el backend para dejar todo consistente
      await recargarDatos();

      if (modalAbierto && form.id === cancha.id) {
        setModalAbierto(false);
      }
    } catch (error) {
      console.error("Error eliminando cancha", error);
      const detalleServidor =
        error.response?.data?.detalle ||
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "";

      const detalle =
        detalleServidor ||
        "No se pudo eliminar la cancha. Es posible que tenga reservas asociadas.";
      setErrorMsg(detalle);
    } finally {
      setEliminandoId(null);
    }
  };

  /** ================= render loading ================= */

  if (loading) {
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
            Cargando canchas del club...
          </p>
        </main>
      </div>
    );
  }

  /** ================= render principal ================= */

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
            <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">
              Canchas
            </span>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Gestión de Canchas
              </h1>
              <p className="text-sm text-slate-500">
                Administra las canchas de tu complejo deportivo.
              </p>
            </div>
            <button
              type="button"
              onClick={abrirModalCrear}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              <span>＋</span>
              <span>Agregar Cancha</span>
            </button>
          </div>

          {errorMsg && (
            <p className="mb-4 text-xs text-red-600 whitespace-pre-wrap">
              {errorMsg}
            </p>
          )}

          {canchas.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
              Aún no tienes canchas registradas. Crea tu primera cancha
              con el botón &quot;Agregar Cancha&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {canchas.map((c) => (
                <article
                  key={c.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 bg-slate-200">
                    {c.imagenUrl ? (
                      <img
                        src={c.imagenUrl}
                        alt={c.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        Sin imagen
                      </div>
                    )}
                    <span
                      className={
                        "absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold " +
                        (c.isActiva
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200")
                      }
                    >
                      {c.isActiva ? "activa" : "inactiva"}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2 text-sm">
                    <h2 className="font-semibold text-slate-900">
                      {c.nombre}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {c.deporteNombre || "Deporte no especificado"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.capacidad
                        ? `${c.capacidad} jugadores`
                        : "Capacidad no registrada"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.superficie}
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      Reservas hoy:{" "}
                      <span className="font-semibold">
                        {c.reservasHoy || 0}
                      </span>
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => abrirModalEditar(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50"
                      >
                        <span>✎</span>
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarCancha(c)}
                        disabled={eliminandoId === c.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {eliminandoId === c.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL EDITAR / CREAR */}
      {modalAbierto && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* header modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {modo === "crear" ? "Agregar Nueva Cancha" : "Editar Cancha"}
                </h2>
                <p className="text-xs text-slate-500">
                  Modifica la información completa de la cancha deportiva.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ×
              </button>
            </div>

            {/* tabs */}
            <div className="px-6 pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setTabActiva("general")}
                className={
                  "flex-1 px-4 py-2 rounded-full text-sm font-semibold border " +
                  (tabActiva === "general"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200")
                }
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setTabActiva("tarifas")}
                disabled={modo === "crear"}
                className={
                  "flex-1 px-4 py-2 rounded-full text-sm font-semibold border " +
                  (tabActiva === "tarifas"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200") +
                  (modo === "crear" ? " opacity-50 cursor-not-allowed" : "")
                }
              >
                Precios y Horarios
              </button>
            </div>

            {/* contenido */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              {tabActiva === "general" ? (
                <form className="space-y-4 text-sm" onSubmit={guardarCancha}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre de la cancha
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={onChangeForm}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Ej: Cancha de Fútbol Principal"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Deporte
                      </label>
                      <select
                        name="deporteId"
                        value={form.deporteId}
                        onChange={onChangeForm}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Selecciona el deporte</option>
                        {deportes.map((d) => (
                          <option key={d.id} value={String(d.id)}>
                            {d.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Capacidad (número de jugadores)
                      </label>
                      <input
                        type="number"
                        name="capacidad"
                        value={form.capacidad}
                        onChange={onChangeForm}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Ej: 22"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Superficie
                      </label>
                      <input
                        type="text"
                        name="superficie"
                        value={form.superficie}
                        onChange={onChangeForm}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Ej: Césped sintético, parquet, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Estado
                      </label>
                      <select
                        name="isActiva"
                        value={form.isActiva ? "true" : "false"}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            isActiva: e.target.value === "true",
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="true">Activa</option>
                        <option value="false">Inactiva</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="isTechada"
                      type="checkbox"
                      name="isTechada"
                      checked={form.isTechada}
                      onChange={onChangeForm}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label
                      htmlFor="isTechada"
                      className="text-xs text-slate-700"
                    >
                      Cancha techada / indoor
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={onChangeForm}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
                      placeholder="Describe las características de la cancha..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL de la imagen (solo frontend)
                    </label>
                    <input
                      type="url"
                      name="imagenUrl"
                      value={form.imagenUrl}
                      onChange={onChangeForm}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Si dejas este campo vacío, se usará una imagen por defecto
                      según el deporte de la cancha (solo visible en el
                      frontend).
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      {modo === "editar" && form.id && (
                        <span>ID cancha: {form.id}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cerrarModal}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                        disabled={guardando}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={guardando}
                      >
                        {guardando
                          ? "Guardando..."
                          : modo === "crear"
                          ? "Crear Cancha"
                          : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm">
                  <p className="text-xs text-slate-500">
                    Configura las franjas horarias y el precio por hora de
                    esta cancha. Estas tarifas se usan al momento de que el
                    deportista realice una reserva.
                  </p>

                  {loadingTarifas ? (
                    <p className="text-xs text-slate-500">
                      Cargando tarifas...
                    </p>
                  ) : tarifas.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Aún no hay tarifas configuradas para esta cancha.
                    </p>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 text-left">Día</th>
                            <th className="px-3 py-2 text-left">
                              Hora inicio
                            </th>
                            <th className="px-3 py-2 text-left">
                              Hora fin
                            </th>
                            <th className="px-3 py-2 text-left">
                              Precio (S/)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tarifas.map((t) => {
                            const dia = DIAS_SEMANA.find(
                              (d) => d.value === t.dia_semana
                            );
                            return (
                              <tr key={t.id} className="border-t">
                                <td className="px-3 py-2">
                                  {dia?.label ?? t.dia_semana}
                                </td>
                                <td className="px-3 py-2">
                                  {t.hora_inicio}
                                </td>
                                <td className="px-3 py-2">
                                  {t.hora_fin}
                                </td>
                                <td className="px-3 py-2">
                                  {formatPrecio(t.precio)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* agregar nueva tarifa */}
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <h3 className="text-xs font-semibold text-slate-700 mb-2">
                      Agregar franja horaria
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">
                          Día
                        </label>
                        <select
                          name="dia_semana"
                          value={tarifaNueva.dia_semana}
                          onChange={onChangeTarifaNueva}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                        >
                          {DIAS_SEMANA.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">
                          Hora inicio
                        </label>
                        <input
                          type="time"
                          name="hora_inicio"
                          value={tarifaNueva.hora_inicio}
                          onChange={onChangeTarifaNueva}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">
                          Hora fin
                        </label>
                        <input
                          type="time"
                          name="hora_fin"
                          value={tarifaNueva.hora_fin}
                          onChange={onChangeTarifaNueva}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">
                          Precio (S/)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="precio"
                            value={tarifaNueva.precio}
                            onChange={onChangeTarifaNueva}
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
                            min={0}
                          />
                          <button
                            type="button"
                            onClick={agregarTarifaBackend}
                            disabled={agregandoTarifa}
                            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {agregandoTarifa ? "Agregando..." : "Agregar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
