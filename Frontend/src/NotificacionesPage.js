// src/NotificacionesPage.js
import React from "react";
import { Link } from "react-router-dom";

export default function NotificacionesPage() {
  return (
    <div className="page-root">
      <header className="nav-root">
        <div className="nav-inner">
          <div className="nav-logo">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
              alt="logo"
              className="nav-logo-icon"
            />
            <span className="nav-logo-text">CanchaYa</span>
          </div>

          <nav className="nav-tabs">
            <Link to="/buscar" className="nav-tab">
              Buscar
            </Link>
            <Link to="/reservas" className="nav-tab">
              Mis Reservas
            </Link>
            <Link to="/notificaciones" className="nav-tab nav-tab-active">
              Notificaciones
            </Link>
            <Link to="/perfil" className="nav-tab">
              Perfil
            </Link>
            <Link to="/login" className="nav-logout">
              ↪ Cerrar Sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="main-root">
        <section className="main-inner">
          <h1>Notificaciones</h1>
          <p>
            Aquí después armamos las tarjetas de “Reserva confirmada” y
            “Recordatorio”, igualitas al Figma.
          </p>
        </section>
      </main>
    </div>
  );
}
