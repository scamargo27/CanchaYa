import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [role, setRole] = useState("deportista");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      
      {/* NAVBAR */}
      <nav className="w-full flex items-center gap-2 px-10 py-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
          alt="logo"
          className="w-7 h-7"
        />
        <span className="font-bold text-xl text-blue-700">CanchaYa</span>
      </nav>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-12 px-10 mt-4">

        {/* IZQUIERDA */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-slate-900">
            CanchaYa
          </h1>
          <p className="text-gray-600 text-lg mt-1 mb-6">
            La plataforma líder para reservar canchas deportivas
          </p>

          {/* Imagen principal */}
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2"
            alt="Imagen deportiva"
            className="w-[550px] h-[350px] object-cover rounded-2xl shadow-md"
          />

          {/* Tarjeta Deportistas */}
          <div className="w-[550px] bg-white p-5 mt-6 rounded-2xl shadow flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                className="w-6"
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Para Deportistas</h3>
              <p className="text-gray-600 text-sm">
                Encuentra y reserva canchas cerca de ti.
              </p>
            </div>
          </div>

          {/* Tarjeta Administradores */}
          <div className="w-[550px] bg-white p-5 mt-3 rounded-2xl shadow flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2620/2620947.png"
                className="w-6"
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Para Administradores</h3>
              <p className="text-gray-600 text-sm">
                Gestiona tu complejo deportivo fácilmente.
              </p>
            </div>
          </div>
        </div>

        {/* DERECHA – FORMULARIO */}
        <div className="w-[420px] bg-white rounded-3xl shadow-xl p-10 border border-gray-100">

          {/* Volver */}
          <div className="flex items-center gap-2 text-slate-600 text-sm mb-4 cursor-pointer">
            <span className="text-xl">←</span> Volver al inicio
          </div>

          <h2 className="text-2xl font-semibold text-center text-slate-900">
            Iniciar Sesión
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Accede a tu cuenta para continuar
          </p>

          {/* Selector de Rol */}
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

          {/* Texto introductorio */}
          <h3 className="font-semibold text-slate-900 text-center">
            {role === "deportista"
              ? "Acceso para Deportistas"
              : "Acceso para Administradores"}
          </h3>

          <p className="text-gray-500 text-center text-sm mb-6">
            {role === "deportista"
              ? "Busca y reserva canchas deportivas"
              : "Gestiona tu complejo deportivo"}
          </p>

          {/* FORMULARIO */}
          <form className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-blue-600"
                />
                <span className="absolute right-3 top-4 text-gray-500 cursor-pointer">
                  👁
                </span>
              </div>
            </div>

            <button className="bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-black">
              Iniciar Sesión
            </button>

            <button className="border border-gray-300 py-3 rounded-xl text-sm hover:bg-gray-50">
              Usar credenciales de demo
            </button>

            <hr className="my-3" />

            <p className="text-center text-gray-500 text-sm">
              ¿No tienes cuenta?
            </p>

            {/* NAVEGACIÓN AL REGISTRO */}
            <p className="text-center text-slate-900 font-semibold text-sm">
              <Link to="/registrarse" className="hover:underline">
                Registrarse como{" "}
                {role === "deportista" ? "deportista" : "administrador"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
