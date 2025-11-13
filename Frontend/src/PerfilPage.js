// src/PerfilPage.js
import React from "react";
import { Link } from "react-router-dom";

export default function PerfilPage() {
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
            <Link to="/notificaciones" className="nav-tab">
              Notificaciones
            </Link>
            <Link to="/perfil" className="nav-tab nav-tab-active">
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
          <h1>Mi Perfil (Deportista)</h1>
          <p>
            Luego armamos el layout con la foto circular, tarjetas de
            información personal, preferencias deportivas y estadísticas, como
            en tus últimas dos imágenes.
          </p>
        </section>
      </main>
    </div>
  );
}
