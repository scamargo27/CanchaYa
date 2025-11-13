// src/MisReservasPage.js
import React from "react";
import { Link } from "react-router-dom";

const RESERVAS = [
  {
    id: 1,
    cancha: "Cancha de Fútbol Principal",
    club: "Club Deportivo Los Pinos",
    fecha: "2024-01-15",
    hora: "18:00-19:00",
    precio: "S/ 120",
    estado: "confirmada",
  },
  {
    id: 2,
    cancha: "Cancha de Tenis Profesional",
    club: "Tennis Club Elite",
    fecha: "2024-01-10",
    hora: "16:00-17:00",
    precio: "S/ 80",
    estado: "completada",
  },
  {
    id: 3,
    cancha: "Cancha de Básquet Indoor",
    club: "Polideportivo Central",
    fecha: "2024-01-20",
    hora: "20:00-21:00",
    precio: "S/ 100",
    estado: "cancelada",
  },
];

function EstadoPill({ estado }) {
  if (estado === "confirmada") {
    return (
      <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
        confirmada
      </span>
    );
  }
  if (estado === "completada") {
    return (
      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
        completada
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200">
      cancelada
    </span>
  );
}

export default function MisReservasPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR PERFIL DEPORTISTA */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
              alt="CanchaYa logo"
              className="w-7 h-7"
            />
            <span className="font-bold text-xl text-blue-700">CanchaYa</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              to="/deportista/buscar"
              className="px-4 py-2 rounded-full text-slate-700 hover:bg-slate-100"
            >
              Buscar
            </Link>

            <button className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold">
              Mis Reservas
            </button>

            <Link
              to="/deportista/notificaciones"
              className="px-4 py-2 rounded-full text-slate-700 hover:bg-slate-100"
            >
              Notificaciones
            </Link>

            <Link
              to="/deportista/perfil"
              className="px-4 py-2 rounded-full text-slate-700 hover:bg-slate-100"
            >
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
          {/* Título y subtítulo */}
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-slate-900">
              Mis Reservas
            </h1>
            <p className="text-xs text-slate-500">
              Historial completo de tus reservas
            </p>
          </div>

          {/* Lista de reservas */}
          <div className="flex flex-col gap-4">
            {RESERVAS.map((reserva) => (
              <article
                key={reserva.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4 flex items-center justify-between"
              >
                {/* Info izquierda */}
                <div className="flex flex-col gap-1 text-sm">
                  <div className="font-semibold text-slate-900">
                    {reserva.cancha}
                  </div>
                  <div className="text-xs text-slate-500">{reserva.club}</div>

                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      📅 <span>{reserva.fecha}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      ⏰ <span>{reserva.hora}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      💲 <span>{reserva.precio}</span>
                    </span>
                  </div>
                </div>

                {/* Acciones derecha */}
                <div className="flex items-center gap-3">
                  <EstadoPill estado={reserva.estado} />

                  {/* Botones: en la maqueta el primero siempre "Ver Detalles",
                      el segundo solo aparece cuando está "confirmada" */}
                  <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50">
                    Ver Detalles
                  </button>

                  {reserva.estado === "confirmada" && (
                    <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50">
                      Cancelar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
