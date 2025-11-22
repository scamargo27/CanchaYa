// src/BuscarClubesPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";
import { ciudadesColombia } from "./data/ciudadesColombia";

// 👉 Imágenes locales por deporte
import imgFutbol from "./assets/canchas/futbol.png";
import imgTenis from "./assets/canchas/tenis.png";
import imgBasquet from "./assets/canchas/basquet.png";
import imgVoley from "./assets/canchas/voley.png";
import imgPadel from "./assets/canchas/padel.png";
import imgFutsal from "./assets/canchas/futsal.png";
import imgDefault from "./assets/canchas/default.png";

const SPORT_IMAGES = {
  futbol: imgFutbol,
  futbol7: imgFutbol,
  futbol11: imgFutbol,
  futbolito: imgFutbol,
  futsal: imgFutsal,
  microfutbol: imgFutsal,
  tenis: imgTenis,
  padel: imgPadel,
  basquet: imgBasquet,
  basquetbol: imgBasquet,
  baloncesto: imgBasquet,
  voley: imgVoley,
  voleibol: imgVoley,
};

const normalize = (str = "") =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function getImageForClub(deportes = []) {
  if (!deportes.length) return imgDefault;
  for (const dep of deportes) {
    const key = normalize(dep).split(" ")[0];
    if (SPORT_IMAGES[key]) return SPORT_IMAGES[key];
  }
  return imgDefault;
}

export default function BuscarClubesPage() {
  const [canchas, setCanchas] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [deporteId, setDeporteId] = useState("");
  const [ciudadId, setCiudadId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");

  useEffect(() => {
    const fetchDeportes = async () => {
      try {
        const res = await api.get("/api/core/deportes/");
        const data = res.data;
        const lista =
          Array.isArray(data) ? data : data.deportes || data.results || [];
        setDeportes(lista);
      } catch (e) {
        console.error("Error cargando deportes", e);
      }
    };
    fetchDeportes();
  }, []);

  const fetchCanchas = async (extraParams = {}) => {
    setLoading(true);
    try {
      const params = { ...extraParams };

      if (departamentoId) params.departamento = departamentoId;
      if (ciudadId) params.ciudad = ciudadId;
      if (deporteId) params.deporte = deporteId;

      const res = await api.get("/api/canchas/", { params });

      const data = res.data;
      const listaCanchas = Array.isArray(data)
        ? data
        : data.canchas || data.results || [];

      setCanchas(listaCanchas);

      const mapClubes = new Map();
      for (const cancha of listaCanchas) {
        const clubId = cancha.club;
        if (!clubId) continue;

        if (!mapClubes.has(clubId)) {
          mapClubes.set(clubId, {
            id: clubId,
            nombre: cancha.club_nombre,
            deportes: new Set(),
            ciudad_nombre: cancha.ciudad_nombre,
            departamento_nombre: cancha.departamento_nombre,
            direccion: cancha.club_direccion || "",
            telefono: cancha.club_telefono_1 || "",
          });
        }
        const clubData = mapClubes.get(clubId);
        if (cancha.deporte_nombre) {
          clubData.deportes.add(cancha.deporte_nombre);
        }
      }

      const clubesBasicos = Array.from(mapClubes.values()).map((c) => ({
        ...c,
        deportes: Array.from(c.deportes),
      }));

      try {
        const resClubes = await api.get("/api/accounts/clubes/publico/");
        const dataClubes = resClubes.data;
        const infoClubes = Array.isArray(dataClubes)
          ? dataClubes
          : dataClubes.clubes || dataClubes.results || [];

        const infoById = {};
        for (const c of infoClubes) infoById[c.id] = c;

        const mezclados = clubesBasicos.map((c) => {
          const extra = infoById[c.id];
          if (!extra) return c;
          return {
            ...c,
            nombre: extra.nombre || c.nombre,
            direccion: extra.direccion || c.direccion,
            telefono: extra.telefono_1 || c.telefono,
            ciudad_nombre: extra.ciudad_nombre || c.ciudad_nombre,
            departamento_nombre:
              extra.departamento_nombre || c.departamento_nombre,
          };
        });

        setClubes(mezclados);
      } catch (e) {
        console.warn("No se pudo enriquecer clubes públicos", e);
        setClubes(clubesBasicos);
      }
    } catch (e) {
      console.error("Error cargando canchas", e);
      setClubes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanchas();
  }, []);

  const clubesFiltrados = useMemo(() => {
    if (!searchText.trim()) return clubes;
    const term = normalize(searchText);
    return clubes.filter((c) => normalize(c.nombre).includes(term));
  }, [clubes, searchText]);

  const handleBuscarClick = (e) => {
    e.preventDefault();
    fetchCanchas();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2 select-none">
            <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
            <span className="font-bold text-xl text-blue-700">CanchaYa</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <button className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold">
              Buscar
            </button>

            <Link to="/deportista/reservas" className="text-slate-700 hover:underline">
              Mis Reservas
            </Link>
            <Link to="/deportista/notificaciones" className="text-slate-700 hover:underline">
              Notificaciones
            </Link>
            <Link to="/deportista/perfil" className="text-slate-700 hover:underline">
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
          {/* TARJETA DE BUSCAR */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 mb-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Buscar Clubes Deportivos
            </h2>

            <form
              onSubmit={handleBuscarClick}
              className="grid grid-cols-[2.2fr,1fr,1fr,0.9fr] gap-3 text-sm"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Buscar club específico..."
                  className="w-full h-10 pl-8 pr-3 rounded-full border border-slate-200 bg-slate-50"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <select
                className="h-10 rounded-full border border-slate-200 bg-slate-50 px-3"
                value={deporteId}
                onChange={(e) => setDeporteId(e.target.value)}
              >
                <option value="">Deporte</option>
                {deportes.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </select>

              <select
                className="h-10 rounded-full border border-slate-200 bg-slate-50 px-3"
                value={ciudadId}
                onChange={(e) => setCiudadId(e.target.value)}
              >
                <option value="">Ubicación</option>
                {ciudadesColombia.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 text-sm"
                disabled={loading}
              >
                <span>🔎</span>
                <span>{loading ? "Buscando..." : "Buscar"}</span>
              </button>
            </form>
          </div>

          {/* TARJETAS */}
          {loading && clubesFiltrados.length === 0 ? (
            <p className="text-sm text-slate-500">Cargando clubes...</p>
          ) : clubesFiltrados.length === 0 ? (
            <p className="text-sm text-slate-500">
              No se encontraron clubes con esos filtros.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {clubesFiltrados.map((club) => (
                <article
                  key={club.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
                >
                  <div className="relative h-56">
                    <img
                      src={getImageForClub(club.deportes)}
                      alt={club.nombre}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Disponible
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-2 text-sm">
                    <h3 className="font-semibold text-slate-900">{club.nombre}</h3>

                    {(club.ciudad_nombre || club.departamento_nombre) && (
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <span>📍</span>
                        <span>
                          {club.ciudad_nombre}
                          {club.ciudad_nombre && club.departamento_nombre ? ", " : ""}
                          {club.departamento_nombre}
                        </span>
                      </div>
                    )}

                    {club.telefono && (
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <span>📞</span>
                        <span>{club.telefono}</span>
                      </div>
                    )}

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

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Consultar tarifas</span>

                      {/* 🔥 AQUÍ está tu cambio EXACTO */}
                      <Link
                        to={`/deportista/club/${club.id}`}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold text-center"
                      >
                        Reserva aquí
                      </Link>

                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
