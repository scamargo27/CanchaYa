import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [role, setRole] = useState("deportista");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center">
      
      {/* NAVBAR */}
      <nav className="w-full flex items-center gap-2 px-10 py-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
          alt="logo"
          className="w-7 h-7"
        />
        <span className="font-bold text-xl text-blue-700">CanchaYa</span>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="w-full flex justify-center mt-4">
        <div className="bg-white w-[850px] rounded-3xl shadow-xl border border-gray-100 p-10">

          {/* VOLVER */}
          <div className="flex items-center gap-2 text-slate-600 text-sm mb-4 cursor-pointer">
            <span className="text-xl">←</span> Volver al inicio
          </div>

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
          <form className="flex flex-col gap-6">

            {/* FORMULARIO DEPORTISTAS */}
            {role === "deportista" && (
              <>
                {/* GRID 2 COLUMNAS */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Cédula de ciudadanía *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 12345678"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="tu-email@ejemplo.com"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      placeholder="+57 300 123 4567"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Fecha de nacimiento *
                    </label>
                    <input
                      type="date"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Género *
                    </label>
                    <select className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm">
                      <option>Seleccionar</option>
                      <option>Masculino</option>
                      <option>Femenino</option>
                      <option>Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Ciudad
                    </label>
                    <select className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm">
                      <option>Selecciona tu ciudad</option>
                    </select>
                  </div>
                </div>

                {/* DEPORTES */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Deportes de interés *
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                    <label><input type="checkbox" /> Fútbol</label>
                    <label><input type="checkbox" /> Tenis</label>
                    <label><input type="checkbox" /> Básquet</label>
                    <label><input type="checkbox" /> Vóley</label>
                    <label><input type="checkbox" /> Pádel</label>
                    <label><input type="checkbox" /> Futsal</label>
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
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Confirmar contraseña *
                    </label>
                    <input
                      type="password"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
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
                    <input className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      NIT *
                    </label>
                    <input className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Dirección completa *
                    </label>
                    <input className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Ciudad *
                    </label>
                    <select className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm">
                      <option>Selecciona la ciudad</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Email del complejo *
                    </label>
                    <input className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Sitio web (opcional)
                    </label>
                    <input className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Teléfonos de contacto *
                    </label>
                    <input className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Descripción del complejo
                  </label>
                  <textarea className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
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
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Horario de cierre *
                    </label>
                    <input
                      type="time"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Días de operación *
                    </label>
                    <select className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm">
                      <option>Seleccionar</option>
                      <option>Lunes a Viernes</option>
                      <option>Lunes a Sábado</option>
                      <option>Todos los días</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Número de canchas *
                    </label>
                    <input className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Deportes disponibles *
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                    <label><input type="checkbox" /> Fútbol</label>
                    <label><input type="checkbox" /> Tenis</label>
                    <label><input type="checkbox" /> Básquet</label>
                    <label><input type="checkbox" /> Vóley</label>
                    <label><input type="checkbox" /> Pádel</label>
                    <label><input type="checkbox" /> Futsal</label>
                    <label><input type="checkbox" /> Badminton</label>
                    <label><input type="checkbox" /> Ping Pong</label>
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
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Confirmar contraseña *
                    </label>
                    <input
                      type="password"
                      className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Términos */}
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              <span>
                Acepto los términos y condiciones y las políticas de privacidad
              </span>
            </div>

            {/* Botón principal */}
            <button className="bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-black">
              {role === "deportista" ? "Crear Cuenta" : "Registrar Complejo"}
            </button>

            {/* ENLACE A LOGIN */}
            <p className="text-center text-gray-500 text-sm mt-2">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/"
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
