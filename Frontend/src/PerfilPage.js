// src/PerfilPage.js
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

// ================== HELPERS ==================

function formatearFechaLectura(isoDate) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  try {
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function normalizarFechaInput(isoDate) {
  if (!isoDate) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizarDeportes(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Normaliza la respuesta del backend (DeportistaSerializer)
 * a un objeto plano que usaremos en el front.
 */
function normalizarPerfil(data) {
  // data viene de DeportistaSerializer
  const nombre = data.nombre || "";
  const apellido = data.apellido || "";
  const email = data.email || "";
  const telefono = data.telefono || "";
  const documento =
    data.documento_identidad || data.documento || data.documento_id || "";

  const foto_url = data.avatar_url || data.avatar || null;

  const deporte_favorito_nombre = data.deporte_favorito_nombre || "";

  let deportes_favoritos = normalizarDeportes(data.deportes_favoritos);
  if (!deportes_favoritos.length && deporte_favorito_nombre) {
    deportes_favoritos = [deporte_favorito_nombre];
  }

  const estadisticas = {
    reservas_totales: data.reservas_totales || 0,
    reservas_completadas: data.reservas_completadas || 0,
    clubes_visitados: data.clubes_visitados || 0,
  };

  return {
    id: data.id,
    nombre,
    apellido,
    email,
    telefono,
    documento,
    genero: "", // backend aún no lo maneja
    fecha_nacimiento: "",
    ubicacion_preferida: "",
    nivel_juego: "",
    info_adicional: "",
    deportes_favoritos,
    deporte_favorito_nombre,
    foto_url,
    estadisticas,
    raw: data,
  };
}

// ================== COMPONENTE ==================

export default function PerfilPage() {
  const [perfilUrl, setPerfilUrl] = useState("/api/accounts/deportistas/mi-perfil/");
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ======= CARGAR PERFIL DEL BACKEND =======
  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        // Endpoint REAL del backend
        const res = await api.get("/api/accounts/deportistas/mi-perfil/");
        const wrapper = res.data || {};
        const dataPerfil =
          wrapper.deportista || wrapper.perfil || wrapper; // por si cambia en el futuro

        const perfilNorm = normalizarPerfil(dataPerfil);

        setPerfil(perfilNorm);
        setForm({
          nombre: perfilNorm.nombre || "",
          apellido: perfilNorm.apellido || "",
          email: perfilNorm.email || "",
          telefono: perfilNorm.telefono || "",
          documento: perfilNorm.documento || "",
          genero: perfilNorm.genero || "",
          fecha_nacimiento: normalizarFechaInput(
            perfilNorm.fecha_nacimiento
          ),
          ubicacion_preferida: perfilNorm.ubicacion_preferida || "",
          nivel_juego: perfilNorm.nivel_juego || "",
          info_adicional: perfilNorm.info_adicional || "",
          deportes_favoritos: perfilNorm.deportes_favoritos || [],
        });
        setFotoPreview(perfilNorm.foto_url || null);
        setPerfilUrl("/api/accounts/deportistas/mi-perfil/");
      } catch (err) {
        console.error("Error cargando perfil", err);
        const detalle =
          err.response?.data?.detail ||
          err.response?.data?.detalle ||
          JSON.stringify(err.response?.data || {});
        setErrorMsg(
          "Ocurrió un error al cargar tu perfil: " + detalle
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const nombreCompleto = useMemo(() => {
    if (!perfil) return "";
    const partes = [perfil.nombre, perfil.apellido].filter(Boolean);
    return partes.join(" ");
  }, [perfil]);

  // ======= HANDLERS =======

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleDeporte = (deporte) => {
    setForm((prev) => {
      const lista = prev.deportes_favoritos || [];
      if (lista.includes(deporte)) {
        return {
          ...prev,
          deportes_favoritos: lista.filter((d) => d !== deporte),
        };
      }
      return {
        ...prev,
        deportes_favoritos: [...lista, deporte],
      };
    });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    const url = URL.createObjectURL(file);
    setFotoPreview(url);
  };

  const empezarEdicion = () => {
    setEditing(true);
    setSuccessMsg(null);
  };

  const cancelarEdicion = () => {
    if (!perfil) return;
    setEditing(false);
    setSuccessMsg(null);
    setErrorMsg(null);
    setFotoFile(null);
    setFotoPreview(perfil.foto_url || null);
    setForm({
      nombre: perfil.nombre || "",
      apellido: perfil.apellido || "",
      email: perfil.email || "",
      telefono: perfil.telefono || "",
      documento: perfil.documento || "",
      genero: perfil.genero || "",
      fecha_nacimiento: normalizarFechaInput(perfil.fecha_nacimiento),
      ubicacion_preferida: perfil.ubicacion_preferida || "",
      nivel_juego: perfil.nivel_juego || "",
      info_adicional: perfil.info_adicional || "",
      deportes_favoritos: perfil.deportes_favoritos || [],
    });
  };

  const handleGuardar = async () => {
    if (!perfilUrl || !form) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = new FormData();

      // CAMPOS QUE EL BACKEND SÍ ACEPTA (DeportistaUpdateSerializer)
      if (form.nombre) payload.append("nombre", form.nombre);
      if (form.apellido) payload.append("apellido", form.apellido);
      if (form.telefono) payload.append("telefono", form.telefono);

      // avatar se llama "avatar" en el modelo
      if (fotoFile) {
        payload.append("avatar", fotoFile);
      }

      const res = await api.patch(perfilUrl, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const wrapper = res.data || {};
      const dataPerfil =
        wrapper.deportista || wrapper.perfil || wrapper;
      const perfilActualizado = normalizarPerfil(dataPerfil);

      setPerfil(perfilActualizado);
      setForm({
        nombre: perfilActualizado.nombre || "",
        apellido: perfilActualizado.apellido || "",
        email: perfilActualizado.email || "",
        telefono: perfilActualizado.telefono || "",
        documento: perfilActualizado.documento || "",
        genero: perfilActualizado.genero || "",
        fecha_nacimiento: normalizarFechaInput(
          perfilActualizado.fecha_nacimiento
        ),
        ubicacion_preferida: perfilActualizado.ubicacion_preferida || "",
        nivel_juego: perfilActualizado.nivel_juego || "",
        info_adicional: perfilActualizado.info_adicional || "",
        deportes_favoritos: perfilActualizado.deportes_favoritos || [],
      });
      setFotoFile(null);
      setFotoPreview(perfilActualizado.foto_url || null);
      setEditing(false);
      setSuccessMsg("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error actualizando perfil", error);
      const detalle =
        error.response?.data?.detail ||
        error.response?.data?.detalle ||
        JSON.stringify(error.response?.data || {});
      setErrorMsg(
        "Ocurrió un error al guardar los cambios en tu perfil: " +
          detalle
      );
    } finally {
      setSaving(false);
    }
  };

  // ======= RENDER =======

  if (loading || !form || !perfil) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* NAVBAR */}
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
            Cargando tu información de perfil...
          </p>
        </main>
      </div>
    );
  }

  const deportesCatalogo = [
    "Fútbol",
    "Tenis",
    "Vóley",
    "Pádel",
    "Básquet",
    "Futsal",
  ];

  const deportesValorNormalizado = (form.deportes_favoritos || []).map((d) =>
    d.toLowerCase()
  );

  const isDeporteSeleccionado = (nombre) =>
    deportesValorNormalizado.includes(nombre.toLowerCase());

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
            <Link to="/deportista/reservas" className="text-slate-700">
              Mis Reservas
            </Link>
            <Link to="/deportista/notificaciones" className="text-slate-700">
              Notificaciones
            </Link>
            <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">
              Perfil
            </span>

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

      {/* CONTENIDO PERFIL */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Mi Perfil
              </h1>
              <p className="text-sm text-slate-500">
                Actualiza tu información personal y preferencias.
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={empezarEdicion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                <span className="text-xs">✏️</span>
                <span>Editar Perfil</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span className="text-xs">✕</span>
                <span>Cancelar</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <p className="mb-4 text-xs text-red-600 whitespace-pre-wrap">
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="mb-4 text-xs text-emerald-600 whitespace-pre-wrap">
              {successMsg}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
            {/* TARJETA FOTO PERFIL */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
              <h2 className="text-sm font-semibold text-slate-900 mb-4 w-full">
                Foto de Perfil
              </h2>
              <div className="relative mb-4">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {fotoPreview ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img
                      src={fotoPreview}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-slate-400">👤</span>
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-3 right-2 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm cursor-pointer shadow-md">
                    <span>📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                  </label>
                )}
              </div>

              <p className="font-semibold text-sm text-slate-900 mb-1">
                {nombreCompleto || "Deportista"}
              </p>
              <p className="text-xs text-slate-500 mb-2">Deportista Activo</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                ✔ Verificado
              </span>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-6">
              {/* INFORMACIÓN PERSONAL */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Información Personal
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Nombre completo */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">
                      Nombre completo
                    </label>
                    {editing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          placeholder="Nombre"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                        />
                        <input
                          type="text"
                          name="apellido"
                          value={form.apellido}
                          onChange={handleChange}
                          placeholder="Apellido"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                        />
                      </div>
                    ) : (
                      <p className="text-slate-900">
                        {nombreCompleto || "—"}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Email</label>
                    <p className="text-slate-900">{perfil.email || "—"}</p>
                  </div>

                  {/* Teléfono */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">
                      Teléfono
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {perfil.telefono || "—"}
                      </p>
                    )}
                  </div>

                  {/* Documento (solo lectura en backend actual) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">
                      Documento
                    </label>
                    <p className="text-slate-900">
                      {perfil.documento || "—"}
                    </p>
                  </div>

                  {/* Fecha nacimiento (no viene del backend aún) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">
                      Fecha de nacimiento
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        name="fecha_nacimiento"
                        value={form.fecha_nacimiento}
                        onChange={handleChange}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {formatearFechaLectura(perfil.fecha_nacimiento) || "—"}
                      </p>
                    )}
                  </div>

                  {/* Género (placeholder, aún no en backend) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Género</label>
                    {editing ? (
                      <select
                        name="genero"
                        value={form.genero}
                        onChange={handleChange}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    ) : (
                      <p className="text-slate-900">
                        {perfil.genero
                          ? perfil.genero.charAt(0).toUpperCase() +
                            perfil.genero.slice(1)
                          : "—"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PREFERENCIAS DEPORTIVAS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                  Preferencias Deportivas
                </h2>

                {/* Deportes favoritos (visual, no se envía al backend aún) */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Deportes favoritos
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {deportesCatalogo.map((dep) => {
                      const selected = isDeporteSeleccionado(dep);
                      if (!editing && !selected) return null;
                      return (
                        <button
                          key={dep}
                          type="button"
                          onClick={() =>
                            editing && handleToggleDeporte(dep)
                          }
                          className={
                            "px-3 py-1 rounded-full border text-xs font-semibold " +
                            (selected
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : editing
                              ? "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                              : "hidden")
                          }
                        >
                          {dep}
                        </button>
                      );
                    })}
                    {editing &&
                      deportesCatalogo.every(
                        (d) => !isDeporteSeleccionado(d)
                      ) && (
                        <span className="text-xs text-slate-400">
                          Selecciona al menos un deporte
                        </span>
                      )}
                    {!editing &&
                      (!perfil.deportes_favoritos ||
                        perfil.deportes_favoritos.length === 0) && (
                        <span className="text-xs text-slate-400">
                          {perfil.deporte_favorito_nombre ||
                            "Sin deportes seleccionados"}
                        </span>
                      )}
                  </div>
                </div>

                {/* Ubicación preferida (placeholder) */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">
                    Ubicación preferida
                  </p>
                  {editing ? (
                    <input
                      type="text"
                      name="ubicacion_preferida"
                      value={form.ubicacion_preferida}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                  ) : (
                    <p className="text-sm text-slate-900">
                      {perfil.ubicacion_preferida || "—"}
                    </p>
                  )}
                </div>

                {/* Nivel de juego (placeholder) */}
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Nivel de juego
                  </p>
                  {editing ? (
                    <select
                      name="nivel_juego"
                      value={form.nivel_juego}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                    >
                      <option value="">Selecciona tu nivel</option>
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  ) : (
                    <p className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
                      {perfil.nivel_juego || "—"}
                    </p>
                  )}
                </div>
              </div>

              {/* INFO ADICIONAL + ESTADÍSTICAS */}
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)] gap-6">
                {/* Información adicional (placeholder) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">
                    Información adicional
                  </h2>
                  {editing ? (
                    <textarea
                      name="info_adicional"
                      value={form.info_adicional}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="Cuéntale a los clubes sobre tu nivel, horarios disponibles u otra información relevante."
                    />
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {perfil.info_adicional ||
                        "Agrega información sobre tu nivel de juego, disponibilidad u otros detalles que quieras compartir."}
                    </p>
                  )}
                </div>

                {/* Estadísticas (por ahora valores 0 si backend no manda nada) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">
                    Estadísticas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                    <div className="rounded-2xl bg-blue-50 px-4 py-4 flex flex-col justify-center">
                      <span className="text-2xl font-bold text-blue-600 mb-1">
                        {perfil.estadisticas.reservas_totales}
                      </span>
                      <span className="text-slate-600">
                        Reservas Totales
                      </span>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-4 flex flex-col justify-center">
                      <span className="text-2xl font-bold text-emerald-600 mb-1">
                        {perfil.estadisticas.reservas_completadas}
                      </span>
                      <span className="text-slate-600">
                        Reservas Completadas
                      </span>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-4 flex flex-col justify-center">
                      <span className="text-2xl font-bold text-amber-600 mb-1">
                        {perfil.estadisticas.clubes_visitados}
                      </span>
                      <span className="text-slate-600">
                        Clubes Visitados
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTONES GUARDAR / CANCELAR AL PIE (SOLO EDICIÓN) */}
              {editing && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardar}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <span>💾</span>
                    <span>
                      {saving ? "Guardando cambios..." : "Guardar Cambios"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
