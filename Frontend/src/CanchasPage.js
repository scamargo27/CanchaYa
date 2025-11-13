// src/CanchasPage.js
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

export default function CanchasPage() {
  return (
    <div className="page-root">
      {/* NAVBAR SUPERIOR */}
      <header className="nav-root">
        <div className="nav-inner">
          {/* Logo */}
          <div className="nav-logo">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
              alt="logo"
              className="nav-logo-icon"
            />
            <span className="nav-logo-text">CanchaYa</span>
          </div>

          {/* Tabs del deportista */}
          <nav className="nav-tabs">
            <Link to="/buscar" className="nav-tab nav-tab-active">
              Buscar
            </Link>
            <Link to="/reservas" className="nav-tab">
              Mis Reservas
            </Link>
            <Link to="/notificaciones" className="nav-tab">
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-root">
        <section className="main-inner">
          {/* TARJETA DE BÚSQUEDA */}
          <div className="search-card">
            <div className="search-card-header">
              <h2>Buscar Clubes Deportivos</h2>
            </div>

            <div className="search-card-body">
              <div className="search-row">
                <div className="search-field input-with-icon">
                  <span className="input-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar club específico..."
                    className="search-input"
                  />
                </div>

                <select className="search-select">
                  <option>Deporte</option>
                  <option>Fútbol</option>
                  <option>Tenis</option>
                  <option>Pádel</option>
                  <option>Vóley</option>
                </select>

                <select className="search-select">
                  <option>Ubicación</option>
                  <option>Miraflores</option>
                  <option>San Isidro</option>
                  <option>La Molina</option>
                </select>

                <button className="btn-primary search-btn">
                  <span>🔎</span> Buscar
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE CLUBES */}
          <div className="clubs-grid">
            {CLUBES.map((club) => (
              <article key={club.id} className="club-card">
                <div className="club-image-wrapper">
                  <img
                    src={club.imagen}
                    alt={club.nombre}
                    className="club-image"
                  />
                  <span className="status-pill">Disponible</span>
                </div>

                <div className="club-body">
                  <h3 className="club-name">{club.nombre}</h3>

                  <div className="club-row">
                    <span className="club-icon">📍</span>
                    <span className="club-text">{club.direccion}</span>
                  </div>

                  <div className="club-row">
                    <span className="club-icon">📞</span>
                    <span className="club-text">{club.telefono}</span>
                  </div>

                  {/* Tags de deportes */}
                  <div className="club-tags">
                    {club.deportes.map((dep) => (
                      <span key={dep} className="chip">
                        {dep}
                      </span>
                    ))}
                  </div>

                  <div className="club-footer">
                    <div className="club-price">{club.precio}</div>
                    <button className="btn-secondary">Reserva aquí</button>
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
