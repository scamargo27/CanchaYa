import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/apiClient";

/* IMPORTA IMÁGENES */
import logo from "./assets/login/logo.png";
import heroImg from "./assets/login/login-hero.png";
import sportIcon from "./assets/login/icon-deportista.png";
import adminIcon from "./assets/login/icon-admin.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("deportista");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // FUNCIÓN REAL DE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post("/api/accounts/auth/login/", {
        email,
        password,
      });

      const { token, tipo_usuario, perfil } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("tipoUsuario", tipo_usuario);
      localStorage.setItem("perfilUsuario", JSON.stringify(perfil));

      // 🔀 Redirección según tipo
      if (tipo_usuario === "deportista") {
        navigate("/deportista/buscar");
      } else {
        navigate("/club/dashboard");
      }

    } catch (error) {
      setErrorMsg("Credenciales incorrectas. Inténtalo nuevamente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="w-full flex items-center gap-2 px-10 py-4">
        <img src={logo} alt="logo" className="w-7 h-7" />
        <span className="font-bold text-xl text-blue-700">CanchaYa</span>
      </nav>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-12 px-10 mt-4">

        {/* IZQUIERDA */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-slate-900">CanchaYa</h1>
          <p className="text-gray-600 text-lg mt-1 mb-6">
            La plataforma líder para reservar canchas deportivas
          </p>

          {/* Imagen deportistas */}
          <img
            src={heroImg}
            alt="Imagen deportiva"
            className="w-[550px] h-[350px] object-cover rounded-2xl shadow-md"
          />

          {/* TARJETA DEPORTISTAS */}
          <div className="w-[550px] bg-white p-5 mt-6 rounded-2xl shadow flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <img src={sportIcon} className="w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Para Deportistas</h3>
              <p className="text-gray-600 text-sm">
                Encuentra y reserva canchas cerca de ti.
              </p>
            </div>
          </div>

          {/* TARJETA ADMIN */}
          <div className="w-[550px] bg-white p-5 mt-3 rounded-2xl shadow flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <img src={adminIcon} className="w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Para Administradores</h3>
              <p className="text-gray-600 text-sm">
                Gestiona tu complejo deportivo fácilmente.
              </p>
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div className="w-[420px] bg-white rounded-3xl shadow-xl p-10 border border-gray-100">

          {/* Volver */}
          <Link to="/" className="flex items-center gap-2 text-slate-600 text-sm mb-4 cursor-pointer">
            <span className="text-xl">←</span> Volver al inicio
          </Link>

          <h2 className="text-2xl font-semibold text-center text-slate-900">Iniciar Sesión</h2>
          <p className="text-center text-gray-500 mb-6">
            Accede a tu cuenta para continuar
          </p>

          {/* Selector de rol */}
          <div className="bg-gray-100 rounded-full p-1 flex mb-6">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-full ${
                role === "deportista" ? "bg-white shadow text-slate-900" : "text-gray-500"
              }`}
              onClick={() => setRole("deportista")}
            >
              ⚽ Deportista
            </button>

            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-full ${
                role === "admin" ? "bg-white shadow text-slate-900" : "text-gray-500"
              }`}
              onClick={() => setRole("admin")}
            >
              🏢 Administrador
            </button>
          </div>

          {/* Título */}
          <h3 className="font-semibold text-slate-900 text-center">
            {role === "deportista" ? "Acceso para Deportistas" : "Acceso para Administradores"}
          </h3>

          {/* Subtexto */}
          <p className="text-gray-500 text-center text-sm mb-6">
            {role === "deportista" ? "Busca y reserva canchas deportivas" : "Gestiona tu complejo deportivo"}
          </p>

          {/* FORMULARIO */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-700">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-blue-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="absolute right-3 top-4 text-gray-500 cursor-pointer">👁</span>
              </div>
            </div>

            {/* Error msg */}
            {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}

            {/* BOTÓN LOGIN */}
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-black disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>

            {/* DEMO */}
            <button
              type="button"
              className="border border-gray-300 py-3 rounded-xl text-sm hover:bg-gray-50"
              onClick={() => {
                setEmail("demo@demo.com");
                setPassword("123456");
              }}
            >
              Usar credenciales de demo
            </button>

            <hr className="my-3" />

            <p className="text-center text-gray-500 text-sm">¿No tienes cuenta?</p>

            {/* Registro */}
            <p className="text-center text-slate-900 font-semibold text-sm">
              <Link to="/registrarse" className="hover:underline">
                Registrarse como {role === "deportista" ? "deportista" : "administrador"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
