// src/ConfirmarReservaPage.js
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "./assets/logo-cancha.png";

function formatearMoneda(valor) {
  if (valor == null) return "-";
  const num = Number(valor);
  if (Number.isNaN(num)) return "-";
  return `S/ ${num.toFixed(2)}`;
}

export default function ConfirmarReservaPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Si alguien entra directo sin venir del pago
  if (!state || !state.reserva) {
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
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
            <p className="text-sm text-slate-600 mb-4">
              No se encontró información de una reserva reciente.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/deportista/reservas"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
              >
                Ver Mis Reservas
              </Link>
              <Link
                to="/deportista/buscar"
                className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50"
              >
                Hacer Nueva Reserva
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { reserva, pago, club, cancha, deporte, fecha, hora } = state;

  const codigoReserva =
    reserva.codigo ||
    reserva.codigo_reserva ||
    (reserva.id ? `RES-${String(reserva.id).padStart(4, "0")}` : "-");

  const nombreClub = club?.nombre || reserva?.cancha?.club?.nombre || "-";
  const nombreCancha =
    cancha?.nombre || reserva?.cancha?.nombre || `Cancha ${cancha?.id || ""}`;
  const fechaReserva = fecha || reserva?.fecha || "-";
  const horaReserva =
    hora ||
    (reserva?.hora_inicio
      ? reserva.hora_inicio.slice(0, 5)
      : "-");

  const totalPagado =
    pago?.total ??
    reserva?.precio ??
    reserva?.total_pagado ??
    reserva?.monto_total ??
    0;

  const estado =
    reserva?.estado ||
    reserva?.estado_reserva ||
    "confirmada";

  const estadoLabel =
    estado.toLowerCase() === "confirmada" ? "Confirmada" : estado;

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
            <Link to="/deportista/perfil" className="text-slate-700">
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
        <section className="max-w-4xl mx-auto px-8 py-12 flex flex-col items-center gap-8">
          {/* Icono y título */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-3xl text-emerald-600">✓</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              ¡Reserva Confirmada!
            </h1>
            <p className="text-sm text-slate-500">
              Tu reserva ha sido procesada exitosamente.
            </p>
          </div>

          {/* Tarjeta con detalles */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-sm font-semibold text-slate-900 text-center mb-1">
              Detalles de tu Reserva
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              Código de reserva:{" "}
              <span className="font-semibold text-slate-800">
                #{codigoReserva}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-700 max-w-xl mx-auto">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Club</p>
                <p className="font-medium">{nombreClub}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Cancha</p>
                <p className="font-medium">{nombreCancha}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-0.5">Fecha</p>
                <p className="font-medium">{fechaReserva}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Hora</p>
                <p className="font-medium">{horaReserva}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-0.5">Total Pagado</p>
                <p className="font-medium">{formatearMoneda(totalPagado)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Estado</p>
                  <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                    <span className="text-xs font-semibold text-emerald-700">
                      {estadoLabel}
                    </span>
                  </div>
                </div>
              </div>

              {deporte && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Deporte</p>
                  <p className="font-medium">{deporte}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje informativo */}
          <div className="w-full max-w-3xl">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl px-6 py-4 text-center text-xs text-slate-600 flex items-center gap-3 justify-center">
              <span className="text-base">ℹ️</span>
              <p>
                Hemos enviado los detalles de tu reserva a tu email (si lo
                proporcionaste). Te recomendamos llegar{" "}
                <span className="font-semibold">10 minutos antes</span> de tu
                hora reservada.
              </p>
            </div>
          </div>

          {/* Botones inferiores */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/deportista/reservas")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Ver Mis Reservas
            </button>
            <button
              type="button"
              onClick={() => navigate("/deportista/buscar")}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black"
            >
              Hacer Nueva Reserva
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
