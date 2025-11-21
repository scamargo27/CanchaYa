import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";
import iconAdmin from "./assets/canchas/icon-admin.png";

/** ====== helper: normalizar datos del club que vienen del backend ====== */

function normalizarClub(c = {}) {
  return {
    // ID del club (para fallback en PUT /clubes/:id/)
    id: c.id ?? c.club_id ?? null,

    // administrador principal
    adminNombre:
      c.admin_nombre ??
      c.nombre_admin ??
      c.administrador_nombre ??
      "",
    adminCargo: c.admin_cargo ?? c.cargo_admin ?? "",
    adminEmail: c.admin_email ?? c.email_admin ?? "",
    adminDni: c.admin_dni ?? c.dni_admin ?? "",
    adminTelefono: c.admin_telefono ?? c.telefono_admin ?? "",

    // información general
    nombreClub: c.nombre_club ?? c.nombre ?? c.name ?? "",
    ruc: c.ruc ?? c.nit ?? c.ruc_nit ?? "",
    telefonoPrincipal:
      c.telefono_principal ?? c.telefono ?? c.telefono_contacto ?? "",
    emailContacto: c.email_contacto ?? c.email ?? "",
    direccion: c.direccion ?? c.direccion_completa ?? "",

    // configuración operativa
    horaApertura: c.hora_apertura ?? c.horario_apertura ?? "",
    horaCierre: c.hora_cierre ?? c.horario_cierre ?? "",
    descripcion: c.descripcion ?? c.descripcion_club ?? "",
    sitioWeb: c.sitio_web ?? c.web ?? c.website ?? "",

    // imagen / logo (opcional)
    logoUrl: c.logo_url ?? c.logo ?? c.imagen ?? "",
  };
}

const FORM_EMPTY = normalizarClub({});

/** ================== Componente principal ================== */

export default function AdminPerfilPage() {
  const [perfil, setPerfil] = useState(FORM_EMPTY);
  const [form, setForm] = useState(FORM_EMPTY);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  /** ==== cargar perfil del backend ==== */
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        let rawClub = {};

        try {
          // 1) Intento principal: endpoint "mi-club"
          const res = await api.get("/api/accounts/clubes/mi-club/");
          rawClub = res.data?.club ?? res.data ?? {};
        } catch (error) {
          // Si el endpoint no existe (404), intentamos listar clubes
          if (error.response && error.response.status === 404) {
            try {
              const resLista = await api.get("/api/accounts/clubes/");
              const dataLista = Array.isArray(resLista.data?.results)
                ? resLista.data.results
                : Array.isArray(resLista.data)
                ? resLista.data
                : [];
              rawClub = dataLista[0] ?? {};
            } catch (errorLista) {
              console.error(
                "Error cargando lista de clubes para fallback",
                errorLista
              );
              throw errorLista;
            }
          } else {
            throw error;
          }
        }

        const normalizado = normalizarClub(rawClub);
        setPerfil(normalizado);
        setForm(normalizado);
      } catch (error) {
        console.error("Error cargando perfil del club", error);
        setErrorMsg(
          "No se pudo cargar completamente el perfil del club. Algunos datos podrían no estar disponibles."
        );
        setPerfil(FORM_EMPTY);
        setForm(FORM_EMPTY);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  /** ==== handlers de formulario ==== */

  const onChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cancelarEdicion = () => {
    setForm(perfil); // volvemos a los datos originales
    setEditando(false);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const guardarPerfil = async () => {
    if (guardando) return;

    try {
      setGuardando(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // payload con nombres típicos de campos en el backend
      const payload = {
        // administrador principal
        admin_nombre: form.adminNombre,
        admin_cargo: form.adminCargo,
        admin_email: form.adminEmail,
        admin_dni: form.adminDni,
        admin_telefono: form.adminTelefono,

        // información general
        nombre: form.nombreClub,
        ruc: form.ruc,
        telefono_principal: form.telefonoPrincipal,
        email_contacto: form.emailContacto,
        direccion: form.direccion,

        // configuración operativa
        hora_apertura: form.horaApertura || null,
        hora_cierre: form.horaCierre || null,
        descripcion: form.descripcion,
        sitio_web: form.sitioWeb,
      };

      let rawClubActualizado = null;

      // 1) Intento principal: endpoint "mi-club"
      try {
        const res = await api.put("/api/accounts/clubes/mi-club/", payload);
        rawClubActualizado = res.data?.club ?? res.data ?? {};
      } catch (error) {
        // Si no existe el endpoint pero tenemos id, intentamos PUT por id
        if (
          error.response &&
          error.response.status === 404 &&
          perfil.id != null
        ) {
          const res2 = await api.put(
            `/api/accounts/clubes/${perfil.id}/`,
            payload
          );
          rawClubActualizado = res2.data?.club ?? res2.data ?? {};
        } else {
          throw error;
        }
      }

      const normalizado = normalizarClub(rawClubActualizado);
      setPerfil(normalizado);
      setForm(normalizado);
      setEditando(false);
      setSuccessMsg("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error guardando perfil del club", error);
      const detalle =
        error.response?.data?.detalle ||
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data ?? "") ||
        "Ocurrió un error al guardar los cambios del perfil.";
      setErrorMsg(detalle);
    } finally {
      setGuardando(false);
    }
  };

  const onClickBotonPrincipal = () => {
    if (!editando) {
      setEditando(true);
      setSuccessMsg(null);
      setErrorMsg(null);
    } else {
      guardarPerfil();
    }
  };

  const disabled = !editando || guardando;

  const fotoClub = perfil.logoUrl || iconAdmin; // imagen estándar si no hay logo

  /** ================== Render ================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
              <span className="font-bold text-xl text-blue-700">CanchaYa</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-500">
            Cargando perfil del club...
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
            <span className="font-bold text-xl text-blue-700">CanchaYa</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/club/home" className="text-slate-700">
              Inicio
            </Link>
            <Link to="/club/canchas" className="text-slate-700">
              Canchas
            </Link>
            <Link to="/club/reservas" className="text-slate-700">
              Reservas
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

      {/* CONTENIDO */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Perfil del Club
              </h1>
              <p className="text-sm text-slate-500">
                Visualiza y actualiza la información general de tu club
                deportivo.
              </p>

              {errorMsg && (
                <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                  {errorMsg}
                </p>
              )}
              {successMsg && (
                <p className="mt-2 text-xs text-emerald-600 whitespace-pre-wrap">
                  {successMsg}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-200">
                <img
                  src={fotoClub}
                  alt="Logo del club"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = iconAdmin;
                  }}
                />
                <div className="text-xs text-right">
                  <p className="font-semibold text-slate-800">
                    {perfil.nombreClub || "Tu club deportivo"}
                  </p>
                  <p className="text-slate-500">
                    Admin: {perfil.adminNombre || "No registrado"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {editando && (
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClickBotonPrincipal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={guardando}
                >
                  <span>✎</span>
                  <span>
                    {guardando
                      ? "Guardando..."
                      : editando
                      ? "Guardar Cambios"
                      : "Editar Perfil"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* TARJETA ADMIN PRINCIPAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Administrador Principal
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Información de contacto de la persona responsable del club.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="adminNombre"
                  value={form.adminNombre}
                  onChange={onChangeForm}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  placeholder="Ej: Carlos Administrador"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DNI
                </label>
                <input
                  type="text"
                  name="adminDni"
                  value={form.adminDni}
                  onChange={onChangeForm}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  placeholder="Documento de identidad"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  name="adminCargo"
                  value={form.adminCargo}
                  onChange={onChangeForm}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  placeholder="Ej: Gerente General"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono personal
                </label>
                <input
                  type="text"
                  name="adminTelefono"
                  value={form.adminTelefono}
                  onChange={onChangeForm}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  placeholder="+57 ..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email personal
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={form.adminEmail}
                  onChange={onChangeForm}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
          </div>

          {/* TARJETAS INFERIORES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información general */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Información General
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Datos básicos del club que se muestran a los deportistas.
              </p>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del club
                  </label>
                  <input
                    type="text"
                    name="nombreClub"
                    value={form.nombreClub}
                    onChange={onChangeForm}
                    disabled={disabled}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                    placeholder="Nombre comercial del club"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RUC / NIT
                  </label>
                  <input
                    type="text"
                    name="ruc"
                    value={form.ruc}
                    onChange={onChangeForm}
                    disabled={disabled}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                    placeholder="Número de identificación tributaria"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono principal
                  </label>
                  <input
                    type="text"
                    name="telefonoPrincipal"
                    value={form.telefonoPrincipal}
                    onChange={onChangeForm}
                    disabled={disabled}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                    placeholder="Teléfono de contacto del club"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    name="emailContacto"
                    value={form.emailContacto}
                    onChange={onChangeForm}
                    disabled={disabled}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                    placeholder="info@tuclub.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={onChangeForm}
                    disabled={disabled}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                    placeholder="Dirección completa del club"
                  />
                </div>
              </div>
            </div>

            {/* Configuración operativa */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Configuración Operativa
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Horarios y descripción general del club.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora de apertura
                  </label>
                  <input
                    type="time"
                    name="horaApertura"
                    value={form.horaApertura || ""}
                    onChange={onChangeForm}
                    disabled={disabled}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora de cierre
                  </label>
                  <input
                    type="time"
                    name="horaCierre"
                    value={form.horaCierre || ""}
                    onChange={onChangeForm}
                    disabled={disabled}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción del club
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={onChangeForm}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[90px] disabled:bg-slate-50"
                  placeholder="Describe brevemente tu club, instalaciones y servicios..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sitio web
                </label>
                <input
                  type="url"
                  name="sitioWeb"
                  value={form.sitioWeb}
                  onChange={onChangeForm}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  placeholder="https://tuclub.com"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
