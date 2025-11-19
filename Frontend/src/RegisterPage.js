// src/RegisterPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/login/logo.png";
import { ciudadesColombia } from "./data/ciudadesColombia";

export default function RegisterPage() {
  const [role, setRole] = useState("deportista");
  const navigate = useNavigate();

  // --------- FORM DEPORTISTA ----------
  const [depForm, setDepForm] = useState({
    nombreCompleto: "",
    documento: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    genero: "",
    ciudadId: "",
    password: "",
    passwordConfirm: "",
  });

  // --------- FORM ADMIN ----------
  const [adminForm, setAdminForm] = useState({
    nombreComplejo: "",
    nit: "",
    direccion: "",
    ciudadId: "",
    email: "",
    sitioWeb: "",
    telefono: "",
    descripcion: "",
    horaApertura: "",
    horaCierre: "",
    diasOperacion: "",
    numeroCanchas: "",
    password: "",
    passwordConfirm: "",
  });

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);

  // --------- HANDLERS GENERALES ----------
  const handleDepChange = (e) => {
    const { name, value } = e.target;
    setDepForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  // --------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aceptaTerminos) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);

    try {
      if (role === "deportista") {
        if (depForm.password !== depForm.passwordConfirm) {
          alert("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }

        // Separar nombre y apellido desde "Nombre completo"
        const partesNombre = depForm.nombreCompleto.trim().split(" ");
        const nombre = partesNombre[0] || "";
        const apellido =
          partesNombre.slice(1).join(" ") || " ";

        const payload = {
          email: depForm.email,
          password: depForm.password,
          password_confirm: depForm.passwordConfirm,
          nombre,
          apellido,
          documento_identidad: depForm.documento,
          telefono: depForm.telefono,
          // ciudadId NO se envía porque el backend de deportistas
          // no lo espera (según la colección de Postman).
        };

        await api.post("/accounts/deportistas/", payload);
        alert("Deportista registrado correctamente. Ahora inicia sesión.");
        navigate("/login");
      } else {
        // ADMIN / CLUB
        if (adminForm.password !== adminForm.passwordConfirm) {
          alert("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }

        const ciudadSeleccionada = ciudadesColombia.find(
          (c) => String(c.id) === String(adminForm.ciudadId)
        );

        const departamentoId = ciudadSeleccionada?.departamentoId || 1;
        const ciudadId = ciudadSeleccionada?.id || 1;

        const disponibilidad = `${
          adminForm.diasOperacion || "Horario"
        } ${adminForm.horaApertura || ""} - ${
          adminForm.horaCierre || ""
        }`.trim();

        const payload = {
          email: adminForm.email,
          password: adminForm.password,
          password_confirm: adminForm.passwordConfirm,
          nombre: adminForm.nombreComplejo,
          nit: adminForm.nit,
          direccion: adminForm.direccion,
          telefono_1: adminForm.telefono,
          telefono_2: adminForm.telefono,
          departamento: departamentoId,
          ciudad: ciudadId,
          disponibilidad,
          informacion:
            adminForm.descripcion ||
            `Número de canchas: ${adminForm.numeroCanchas || ""}`,
        };

        await api.post("/accounts/clubes/", payload);
        alert("Club registrado correctamente. Ahora inicia sesión.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      const mensaje =
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message;
      alert("Error al registrar:\n" + mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center">
      {/* NAVBAR */}
      <nav className="w-full flex items-center gap-2 px-10 py-4">
        <img src={logo} alt="logo" className="w-7 h-7" />
        <span className="font-bold text-xl text-blue-700">CanchaYa</span>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="w-full flex justify-center mt-4 mb-10">
        <div className="bg-white w-[850px] rounded-3xl shadow-xl border border-gray-100 p-10">
          {/* VOLVER */}
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 text-sm mb-4 cursor-pointer"
          >
            <span className="text-xl">←</span> Volver al inicio
          </Link>

          {/* TITULO */}
          <h2 className="text-2xl font-semibold text-center text-slate-900">
            Crear Cuenta
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Únete a CanchaYa y comienza a disfrutar del deporte
          </p>

          {/* SELECTOR DE ROL */}
          <div className="bg-gray-100 rounded-full p-1 flex mb-6">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-full ${
                role === "deportista"
                  ? "bg-white shadow text-slate-900"
                  : "text-gray-500"
              }`}
              onClick={() => setRole("deportista")}
              type="button"
            >
              ⚽ Deportista
            </button>

            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-full ${
                role === "admin"
                  ? "bg-white shadow text-slate-900"
                  : "text-gray-500"
              }`}
              onClick={() => setRole("admin")}
              type="button"
            >
              🏢 Administrador
            </button>
          </div>

          {/* SUBTÍTULO */}
          <h3 className="font-semibold text-slate-900 text-center">
            {role === "deportista"
              ? "Registro para Deportistas"
              : "Registro para Administradores"}
          </h3>

          <p className="text-gray-500 text-center text-sm mb-8">
            {role === "deportista"
              ? "Crea tu cuenta para buscar y reservar canchas deportivas"
              : "Registra tu complejo deportivo en CanchaYa"}
          </p>

          {/* FORMULARIO */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* FORMULARIO DEPORTISTAS */}
            {role === "deportista" && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombreCompleto"
                      value={depForm.nombreCompleto}
                      onChange={handleDepChange}
                      placeholder="Ej: Juan Pérez"
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Cédula de ciudadanía *
                    </label>
                    <input
                      type="text"
                      name="documento"
                      value={depForm.documento}
                      onChange={handleDepChange}
                      placeholder="Ej: 12345678"
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={depForm.email}
                      onChange={handleDepChange}
                      placeholder="tu-email@ejemplo.com"
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      name="telefono"
                      value={depForm.telefono}
                      onChange={handleDepChange}
                      placeholder="+57 300 123 4567"
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Fecha de nacimiento *
                    </label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={depForm.fechaNacimiento}
                      onChange={handleDepChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Género *
                    </label>
                    <select
                      name="genero"
                      value={depForm.genero}
                      onChange={handleDepChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Ciudad
                    </label>
                    <select
                      name="ciudadId"
                      value={depForm.ciudadId}
                      onChange={handleDepChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    >
                      <option value="">Selecciona tu ciudad</option>
                      {ciudadesColombia.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* DEPORTES (solo visual, no se envían aún) */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Deportes de interés *
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                    <label>
                      <input type="checkbox" className="mr-1" /> Fútbol
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Tenis
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Básquet
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Vóley
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Pádel
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Futsal
                    </label>
                  </div>
                </div>

                {/* CONTRASEÑA */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={depForm.password}
                      onChange={handleDepChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Confirmar contraseña *
                    </label>
                    <input
                      type="password"
                      name="passwordConfirm"
                      value={depForm.passwordConfirm}
                      onChange={handleDepChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* FORMULARIO ADMINISTRADORES */}
            {role === "admin" && (
              <>
                <h3 className="font-semibold text-slate-900">
                  Información del Club
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Nombre del complejo *
                    </label>
                    <input
                      name="nombreComplejo"
                      value={adminForm.nombreComplejo}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      NIT *
                    </label>
                    <input
                      name="nit"
                      value={adminForm.nit}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Dirección completa *
                    </label>
                    <input
                      name="direccion"
                      value={adminForm.direccion}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Ciudad *
                    </label>
                    <select
                      name="ciudadId"
                      value={adminForm.ciudadId}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    >
                      <option value="">Selecciona la ciudad</option>
                      {ciudadesColombia.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Email del complejo *
                    </label>
                    <input
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Sitio web (opcional)
                    </label>
                    <input
                      name="sitioWeb"
                      value={adminForm.sitioWeb}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Teléfonos de contacto *
                    </label>
                    <input
                      name="telefono"
                      value={adminForm.telefono}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Descripción del complejo
                  </label>
                  <textarea
                    name="descripcion"
                    value={adminForm.descripcion}
                    onChange={handleAdminChange}
                    className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                  />
                </div>

                {/* INFO OPERATIVA */}
                <h3 className="font-semibold text-slate-900 mt-4">
                  Información Operativa
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Horario de apertura *
                    </label>
                    <input
                      type="time"
                      name="horaApertura"
                      value={adminForm.horaApertura}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Horario de cierre *
                    </label>
                    <input
                      type="time"
                      name="horaCierre"
                      value={adminForm.horaCierre}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Días de operación *
                    </label>
                    <select
                      name="diasOperacion"
                      value={adminForm.diasOperacion}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Lunes a Viernes">Lunes a Viernes</option>
                      <option value="Lunes a Sábado">Lunes a Sábado</option>
                      <option value="Todos los días">Todos los días</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Número de canchas *
                    </label>
                    <input
                      name="numeroCanchas"
                      value={adminForm.numeroCanchas}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Deportes disponibles *
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                    <label>
                      <input type="checkbox" className="mr-1" /> Fútbol
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Tenis
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Básquet
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Vóley
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Pádel
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Futsal
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Badminton
                    </label>
                    <label>
                      <input type="checkbox" className="mr-1" /> Ping Pong
                    </label>
                  </div>
                </div>

                {/* CONTRASEÑA ADMIN */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={adminForm.password}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Confirmar contraseña *
                    </label>
                    <input
                      type="password"
                      name="passwordConfirm"
                      value={adminForm.passwordConfirm}
                      onChange={handleAdminChange}
                      className="w-full mt-1 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Términos */}
            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />
              <span>
                Acepto los términos y condiciones y las políticas de privacidad
              </span>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              className="bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : role === "deportista"
                ? "Crear Cuenta"
                : "Registrar Complejo"}
            </button>

            {/* ENLACE A LOGIN */}
            <p className="text-center text-gray-500 text-sm mt-2">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-slate-900 font-semibold hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
