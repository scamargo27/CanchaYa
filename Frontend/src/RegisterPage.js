// src/RegisterPage.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Utilidad para calcular edad a partir de YYYY-MM-DD
function calcularEdad(fechaStr) {
  if (!fechaStr) return null;
  const hoy = new Date();
  const [year, month, day] = fechaStr.split("-").map(Number);
  const nacimiento = new Date(year, month - 1, day);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("deportista"); // "deportista" | "club"

  // Datos comunes de apoyo
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [deportes, setDeportes] = useState([]);

  const [departamentoId, setDepartamentoId] = useState("");

  // Estado para feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ---------- FORMULARIO DEPORTISTA ----------
  const [depForm, setDepForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    genero: "",
    ciudadId: "",
    deportesSeleccionados: [], // ids
    password: "",
    passwordConfirm: "",
    aceptaTerminos: false,
  });

  // ---------- FORMULARIO CLUB (ADMINISTRADOR) ----------
  const [clubForm, setClubForm] = useState({
    nombreClub: "",
    nit: "",
    direccion: "",
    ciudadId: "",
    email: "",
    telefono1: "",
    telefono2: "",
    descripcion: "",
    horaApertura: "",
    horaCierre: "",
    diasOperacion: [], // ahora es array de días
    deportesDisponibles: [], // ids
    password: "",
    passwordConfirm: "",
    aceptaTerminos: false,
  });

  // ================== CARGA DE DATOS (DEPARTAMENTOS, CIUDADES, DEPORTES) ==================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depsRes, deportesRes] = await Promise.all([
          api.get("/api/core/departamentos/"),
          api.get("/api/core/deportes/"),
        ]);

        const rawDeps = depsRes.data;
        const rawDeportes = deportesRes.data;

        const listaDepartamentos = Array.isArray(rawDeps)
          ? rawDeps
          : Array.isArray(rawDeps?.results)
          ? rawDeps.results
          : Array.isArray(rawDeps?.departamentos)
          ? rawDeps.departamentos
          : [];

        const listaDeportes = Array.isArray(rawDeportes)
          ? rawDeportes
          : Array.isArray(rawDeportes?.results)
          ? rawDeportes.results
          : Array.isArray(rawDeportes?.deportes)
          ? rawDeportes.deportes
          : [];

        setDepartamentos(listaDepartamentos);
        setDeportes(listaDeportes);
      } catch (error) {
        console.error("Error cargando datos básicos (core)", error);
        setDepartamentos([]);
        setDeportes([]);
      }
    };

    fetchData();
  }, []);

  // Cargar ciudades cuando cambie departamento
  useEffect(() => {
    const loadCiudades = async () => {
      if (!departamentoId) {
        setCiudades([]);
        return;
      }
      try {
        const res = await api.get(
          `/api/core/ciudades/por-departamento/${departamentoId}/`
        );
        const raw = res.data;
        const listaCiudades = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.results)
          ? raw.results
          : Array.isArray(raw?.ciudades)
          ? raw.ciudades
          : [];
        setCiudades(listaCiudades);
      } catch (error) {
        console.error("Error cargando ciudades", error);
        setCiudades([]);
      }
    };
    loadCiudades();
  }, [departamentoId]);

  // ================== HANDLERS COMUNES ==================
  const handleChangeDepartamento = (e) => {
    setDepartamentoId(e.target.value);
    // Reseteamos ciudad en ambos formularios
    setDepForm((prev) => ({ ...prev, ciudadId: "" }));
    setClubForm((prev) => ({ ...prev, ciudadId: "" }));
  };

  const handleCheckboxDeporteDep = (id) => {
    setDepForm((prev) => {
      const already = prev.deportesSeleccionados.includes(id);
      return {
        ...prev,
        deportesSeleccionados: already
          ? prev.deportesSeleccionados.filter((x) => x !== id)
          : [...prev.deportesSeleccionados, id],
      };
    });
  };

  const handleCheckboxDeporteClub = (id) => {
    setClubForm((prev) => {
      const already = prev.deportesDisponibles.includes(id);
      return {
        ...prev,
        deportesDisponibles: already
          ? prev.deportesDisponibles.filter((x) => x !== id)
          : [...prev.deportesDisponibles, id],
      };
    });
  };

  const toggleDiaOperacion = (dia) => {
    setClubForm((prev) => {
      const existe = prev.diasOperacion.includes(dia);
      return {
        ...prev,
        diasOperacion: existe
          ? prev.diasOperacion.filter((d) => d !== dia)
          : [...prev.diasOperacion, dia],
      };
    });
  };

  // ================== SUBMIT DEPORTISTA ==================
  const handleSubmitDeportista = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validaciones mínimas
    if (!depForm.aceptaTerminos) {
      setErrorMsg("Debes aceptar los términos y condiciones.");
      return;
    }

    if (depForm.password !== depForm.passwordConfirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (!depForm.nombre.trim() || !depForm.apellido.trim()) {
      setErrorMsg("Ingresa tu nombre y apellido.");
      return;
    }

    // Validar edad mínima 14 años
    const edad = calcularEdad(depForm.fechaNacimiento);
    if (edad === null) {
      setErrorMsg("Ingresa tu fecha de nacimiento.");
      return;
    }
    if (edad < 14) {
      setErrorMsg("Debes tener al menos 14 años para registrarte.");
      return;
    }

    // Validar teléfono colombiano (10 dígitos sin +57)
    const telLimpio = depForm.telefono.replace(/\D/g, "");
    if (telLimpio.length !== 10) {
      setErrorMsg(
        "Ingresa un número de celular colombiano de 10 dígitos (sin incluir el +57)."
      );
      return;
    }

    if (depForm.deportesSeleccionados.length === 0) {
      setErrorMsg("Selecciona al menos un deporte de interés.");
      return;
    }

    const deporteFavorito = depForm.deportesSeleccionados[0]; // el primero seleccionado

    const payload = {
      email: depForm.email,
      password: depForm.password,
      password_confirm: depForm.passwordConfirm,
      nombre: depForm.nombre.trim(),
      apellido: depForm.apellido.trim(),
      documento_identidad: depForm.documento,
      telefono: telLimpio,
      deporte_favorito: deporteFavorito,
      // Opcionales: podrías enviar fecha_nacimiento, genero, ciudad si el backend los soporta
    };

    try {
      setLoading(true);
      await api.post("/api/accounts/deportistas/", payload);
      setSuccessMsg(
        "Registro de deportista exitoso. Ahora puedes iniciar sesión."
      );
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      console.error("Error registrando deportista", error);
      const data = error.response?.data;
      if (data) {
        const detail =
          data.detail ||
          (Array.isArray(Object.values(data))
            ? Object.values(data).flat().join(" ")
            : "Ocurrió un error al registrar el deportista.");
        setErrorMsg(detail);
      } else {
        setErrorMsg("No se pudo completar el registro. Inténtalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================== SUBMIT CLUB ==================
  const handleSubmitClub = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!clubForm.aceptaTerminos) {
      setErrorMsg("Debes aceptar los términos y condiciones.");
      return;
    }

    if (clubForm.password !== clubForm.passwordConfirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (!departamentoId || !clubForm.ciudadId) {
      setErrorMsg("Selecciona departamento y ciudad del club.");
      return;
    }

    if (!clubForm.diasOperacion.length) {
      setErrorMsg("Selecciona al menos un día de operación del club.");
      return;
    }

    // Validar teléfonos (opcional pero recomendable)
    const tel1Limpio = clubForm.telefono1.replace(/\D/g, "");
    if (tel1Limpio.length !== 10) {
      setErrorMsg(
        "Ingresa un teléfono principal válido de 10 dígitos (sin incluir el +57)."
      );
      return;
    }
    const tel2Limpio = clubForm.telefono2
      ? clubForm.telefono2.replace(/\D/g, "")
      : "";

    const diasTexto = clubForm.diasOperacion.join(", ");
    const disponibilidad = diasTexto
      ? `${diasTexto} - ${clubForm.horaApertura || "--:--"} a ${
          clubForm.horaCierre || "--:--"
        }`
      : "";

    const deportesNombres = (Array.isArray(deportes) ? deportes : [])
      .filter((d) => clubForm.deportesDisponibles.includes(d.id))
      .map((d) => d.nombre)
      .join(", ");

    const infoExtra = [
      clubForm.descripcion?.trim(),
      deportesNombres ? `Deportes: ${deportesNombres}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      email: clubForm.email,
      password: clubForm.password,
      password_confirm: clubForm.passwordConfirm,
      nombre: clubForm.nombreClub,
      nit: clubForm.nit,
      direccion: clubForm.direccion,
      departamento: Number(departamentoId),
      ciudad: Number(clubForm.ciudadId),
      telefono_1: tel1Limpio,
      telefono_2: tel2Limpio || undefined,
      disponibilidad: disponibilidad || undefined,
      informacion: infoExtra || undefined,
    };

    try {
      setLoading(true);
      await api.post("/api/accounts/clubes/", payload);
      setSuccessMsg(
        "Registro de administrador/club exitoso. Ahora puedes iniciar sesión."
      );
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      console.error("Error registrando club", error);
      const data = error.response?.data;
      if (data) {
        const detail =
          data.detail ||
          (Array.isArray(Object.values(data))
            ? Object.values(data).flat().join(" ")
            : "Ocurrió un error al registrar el club.");
        setErrorMsg(detail);
      } else {
        setErrorMsg("No se pudo completar el registro. Inténtalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-slate-50 flex flex-col">
      {/* NAVBAR SIMPLE */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="CanchaYa logo" className="w-6 h-6" />
            <span className="font-bold text-blue-500 text-lg">CanchaYa</span>
          </Link>

          <Link
            to="/"
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl bg-white shadow-sm border border-slate-200 rounded-3xl p-8 md:p-10">
          {/* Título */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-slate-900">
              Crear Cuenta
            </h1>
            <p className="text-sm text-slate-500">
              Únete a CanchaYa y comienza a disfrutar del deporte
            </p>
          </div>

          {/* Tabs Deportista / Administrador */}
          <div className="flex mb-8 rounded-full bg-slate-100 overflow-hidden text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("deportista")}
              className={
                "flex-1 py-2 flex items-center justify-center gap-2 transition " +
                (activeTab === "deportista"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500")
              }
            >
              <span>👤</span>
              <span>Deportista</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("club")}
              className={
                "flex-1 py-2 flex items-center justify-center gap-2 transition " +
                (activeTab === "club"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500")
              }
            >
              <span>🏟️</span>
              <span>Administrador</span>
            </button>
          </div>

          {/* Mensajes globales */}
          {(errorMsg || successMsg) && (
            <div className="mb-6">
              {errorMsg && (
                <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
                  {successMsg}
                </div>
              )}
            </div>
          )}

          {/* Formularios */}
          {activeTab === "deportista" ? (
            <form onSubmit={handleSubmitDeportista} className="space-y-6">
              <h2 className="text-base font-semibold text-slate-900 text-center">
                Registro para Deportistas
              </h2>
              <p className="text-xs text-slate-500 text-center mb-2">
                Crea tu cuenta para buscar y reservar canchas deportivas
              </p>

              {/* Fila 1: nombre + apellido */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Juan"
                    value={depForm.nombre}
                    onChange={(e) =>
                      setDepForm((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Pérez"
                    value={depForm.apellido}
                    onChange={(e) =>
                      setDepForm((prev) => ({
                        ...prev,
                        apellido: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Fila 2: documento */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cédula de ciudadanía *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 1234567890"
                    value={depForm.documento}
                    onChange={(e) =>
                      setDepForm((prev) => ({
                        ...prev,
                        documento: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Teléfono (sin +57) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-slate-100 text-xs text-slate-600 border border-slate-200">
                      +57
                    </span>
                    <input
                      type="tel"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3001234567"
                      value={depForm.telefono}
                      onChange={(e) =>
                        setDepForm((prev) => ({
                          ...prev,
                          telefono: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Fila 3: email + fecha nacimiento */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tu-email@ejemplo.com"
                    value={depForm.email}
                    onChange={(e) =>
                      setDepForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Fecha de nacimiento *
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={depForm.fechaNacimiento}
                    onChange={(e) =>
                      setDepForm((prev) => ({
                        ...prev,
                        fechaNacimiento: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Fila 4: género */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Género
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={depForm.genero}
                    onChange={(e) =>
                      setDepForm((prev) => ({
                        ...prev,
                        genero: e.target.value,
                      }))
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro / Prefiero no decir</option>
                  </select>
                </div>

                {/* Departamento + ciudad */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Departamento / Ciudad
                  </label>
                  <div className="grid grid-cols-[1.2fr,1.3fr] gap-2">
                    <select
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={departamentoId}
                      onChange={handleChangeDepartamento}
                    >
                      <option value="">Departamento</option>
                      {(Array.isArray(departamentos) ? departamentos : []).map(
                        (d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={depForm.ciudadId}
                      onChange={(e) =>
                        setDepForm((prev) => ({
                          ...prev,
                          ciudadId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Ciudad</option>
                      {(Array.isArray(ciudades) ? ciudades : []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Deportes de interés */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Deportes de interés
                </label>
                <div className="grid md:grid-cols-3 gap-2 text-xs">
                  {(Array.isArray(deportes) ? deportes : []).map((dep) => (
                    <label
                      key={dep.id}
                      className="flex items-center gap-2 text-slate-700"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={depForm.deportesSeleccionados.includes(dep.id)}
                        onChange={() => handleCheckboxDeporteDep(dep.id)}
                      />
                      <span>{dep.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contraseña */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={depForm.password}
                    onChange={(e) =>
                      setDepForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirmar contraseña *
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={depForm.passwordConfirm}
                    onChange={(e) =>
                      setDepForm((prev) => ({
                        ...prev,
                        passwordConfirm: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Términos */}
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-300"
                  checked={depForm.aceptaTerminos}
                  onChange={(e) =>
                    setDepForm((prev) => ({
                      ...prev,
                      aceptaTerminos: e.target.checked,
                    }))
                  }
                  required
                />
                <span>
                  Acepto los términos y condiciones y las políticas de
                  privacidad.
                </span>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-black disabled:opacity-60"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>

              <p className="text-xs text-center text-slate-500 mt-2">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="font-semibold text-slate-800">
                  Inicia sesión aquí
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmitClub} className="space-y-6">
              <h2 className="text-base font-semibold text-slate-900 text-center">
                Registro para Administradores
              </h2>
              <p className="text-xs text-slate-500 text-center mb-2">
                Registra tu complejo deportivo en CanchaYa
              </p>

              {/* Información del club */}
              <h3 className="text-sm font-semibold text-slate-900">
                Información del Club
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nombre del complejo *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Complejo Deportivo Los Pinos"
                    value={clubForm.nombreClub}
                    onChange={(e) =>
                      setClubForm((prev) => ({
                        ...prev,
                        nombreClub: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    NIT (Número de Identificación Tributaria) *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 900123456-1"
                    value={clubForm.nit}
                    onChange={(e) =>
                      setClubForm((prev) => ({ ...prev, nit: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Dirección completa *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Carrera 15 #45-67"
                    value={clubForm.direccion}
                    onChange={(e) =>
                      setClubForm((prev) => ({
                        ...prev,
                        direccion: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ciudad *
                  </label>
                  <div className="grid grid-cols-[1.2fr,1.3fr] gap-2">
                    <select
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={departamentoId}
                      onChange={handleChangeDepartamento}
                    >
                      <option value="">Departamento</option>
                      {(Array.isArray(departamentos) ? departamentos : []).map(
                        (d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={clubForm.ciudadId}
                      onChange={(e) =>
                        setClubForm((prev) => ({
                          ...prev,
                          ciudadId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Ciudad</option>
                      {(Array.isArray(ciudades) ? ciudades : []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email del complejo *
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={clubForm.email}
                    onChange={(e) =>
                      setClubForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Teléfonos de contacto *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 rounded-xl bg-slate-100 text-xs text-slate-600 border border-slate-200">
                        +57
                      </span>
                      <input
                        type="tel"
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3001234567"
                        value={clubForm.telefono1}
                        onChange={(e) =>
                          setClubForm((prev) => ({
                            ...prev,
                            telefono1: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Teléfono adicional (opcional)"
                      value={clubForm.telefono2}
                      onChange={(e) =>
                        setClubForm((prev) => ({
                          ...prev,
                          telefono2: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descripción del complejo
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe tu complejo deportivo, servicios, instalaciones, etc."
                  value={clubForm.descripcion}
                  onChange={(e) =>
                    setClubForm((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Información operativa */}
              <h3 className="text-sm font-semibold text-slate-900">
                Información Operativa
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Horario de apertura *
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={clubForm.horaApertura}
                    onChange={(e) =>
                      setClubForm((prev) => ({
                        ...prev,
                        horaApertura: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Horario de cierre *
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={clubForm.horaCierre}
                    onChange={(e) =>
                      setClubForm((prev) => ({
                        ...prev,
                        horaCierre: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Días de operación con botones */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Días de operación *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => {
                    const activo = clubForm.diasOperacion.includes(dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => toggleDiaOperacion(dia)}
                        className={
                          "px-3 py-1.5 rounded-full text-xs border transition " +
                          (activo
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400")
                        }
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deportes disponibles */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Deportes disponibles *
                </label>
                <div className="grid md:grid-cols-3 gap-2 text-xs">
                  {(Array.isArray(deportes) ? deportes : []).map((dep) => (
                    <label
                      key={dep.id}
                      className="flex items-center gap-2 text-slate-700"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={clubForm.deportesDisponibles.includes(dep.id)}
                        onChange={() => handleCheckboxDeporteClub(dep.id)}
                      />
                      <span>{dep.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info sobre canchas */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-600">
                <p className="font-semibold mb-1">
                  Canchas y tarifas por hora
                </p>
                <p>
                  Una vez completes tu registro e inicies sesión como
                  administrador, podrás agregar tus canchas una por una (con su
                  deporte, horarios y precios por hora) desde el panel de
                  administración.
                </p>
              </div>

              {/* Contraseña */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={clubForm.password}
                    onChange={(e) =>
                      setClubForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirmar contraseña *
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={clubForm.passwordConfirm}
                    onChange={(e) =>
                      setClubForm((prev) => ({
                        ...prev,
                        passwordConfirm: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Términos */}
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-300"
                  checked={clubForm.aceptaTerminos}
                  onChange={(e) =>
                    setClubForm((prev) => ({
                      ...prev,
                      aceptaTerminos: e.target.checked,
                    }))
                  }
                  required
                />
                <span>
                  Acepto los términos y condiciones y las políticas de
                  privacidad.
                </span>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-black disabled:opacity-60"
              >
                {loading ? "Registrando complejo..." : "Registrar Complejo"}
              </button>

              <p className="text-xs text-center text-slate-500 mt-2">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="font-semibold text-slate-800">
                  Inicia sesión aquí
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
