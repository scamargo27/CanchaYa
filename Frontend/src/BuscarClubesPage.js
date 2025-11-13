// src/BuscarClubesPage.js
import React from "react";
import { Link } from "react-router-dom";

const CLUBES = [
  {
    id: 1,
    nombre: "Tennis & Pádel Elite",
    direccion: "Av. Larco 456, Miraflores",
    telefono: "+51 987 654 321",
    deportes: ["Tenis", "Pádel"],
    precio: "Desde S/ 60 por hora",
    imagen:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    nombre: "Futbol Center Pro",
    direccion: "Av. Los Deportes 123, San Isidro",
    telefono: "+51 987 123 456",
    deportes: ["Fútbol", "Futsal"],
    precio: "Desde S/ 80 por hora",
    imagen:
      "https://images.unsplash.com/photo-1518098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    nombre: "Polideportivo Indoor",
    direccion: "Av. Central 789, La Molina",
    telefono: "+51 987 789 123",
    deportes: ["Básquet", "Vóley", "Bádminton"],
    precio: "Desde S/ 70 por hora",
    imagen:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function BuscarClubesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR PERFIL DEPORTISTA */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
              alt="CanchaYa logo"
              className="w-7 h-7"
            />
            <span className="font-bold text-xl text-blue-700">CanchaYa</span>
          </div>

          {/* Tabs (solo Buscar activo por ahora) */}
          <nav className="flex items-center gap-6 text-sm">
            <button className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold">
              Buscar
            </button>
            <span className="text-slate-700">Mis Reservas</span>
            <span className="text-slate-700">Notificaciones</span>
            <span className="text-slate-700">Perfil</span>

            {/* Cerrar sesión → vuelve al login */}
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
          {/* TARJETA DE BUSCAR CLUBES */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 mb-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Buscar Clubes Deportivos
            </h2>

            <div className="grid grid-cols-[2.2fr,1fr,1fr,0.9fr] gap-3 text-sm">
              {/* Input con icono */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Buscar club específico..."
                  className="w-full h-10 pl-8 pr-3 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select className="h-10 rounded-full border border-slate-200 bg-slate-50 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Deporte</option>
                <option>Fútbol</option>
                <option>Tenis</option>
                <option>Pádel</option>
                <option>Vóley</option>
              </select>

              <select className="h-10 rounded-full border border-slate-200 bg-slate-50 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Ubicación</option>
                <option>Miraflores</option>
                <option>San Isidro</option>
                <option>La Molina</option>
              </select>

              <button className="h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 text-sm">
                <span>🔎</span>
                <span>Buscar</span>
              </button>
            </div>
          </div>

          {/* TARJETAS DE CLUBES */}
          <div className="grid grid-cols-3 gap-6">
            {CLUBES.map((club) => (
              <article
                key={club.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
              >
                {/* Imagen + etiqueta disponible */}
                <div className="relative h-56">
                  <img
                    src={club.imagen}
                    alt={club.nombre}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Disponible
                  </span>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col gap-2 text-sm">
                  <h3 className="font-semibold text-slate-900">
                    {club.nombre}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <span>📍</span>
                    <span>{club.direccion}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <span>📞</span>
                    <span>{club.telefono}</span>
                  </div>

                  {/* tags deportes */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {club.deportes.map((dep) => (
                      <span
                        key={dep}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>

                  {/* precio + botón */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{club.precio}</span>
                    <button className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold">
                      Reserva aquí
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
