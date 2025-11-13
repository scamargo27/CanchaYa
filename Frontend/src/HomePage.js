import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR */}
      <header className="w-full border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
              alt="logo"
              className="w-7 h-7"
            />
            <span className="font-bold text-xl text-blue-700">CanchaYa</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-700">
            {/* Podrías agregar más links aquí si tu Figma los tiene */}
            <Link to="/login" className="font-semibold hover:underline">
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Reserva tu cancha
              <br />
              deportiva en segundos
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              La plataforma más completa para encontrar y reservar espacios
              deportivos. Conectamos deportistas con los mejores complejos de la
              ciudad.
            </p>

            {/* BOTONES PRINCIPALES */}
            <div className="flex flex-wrap gap-4">
              {/* Desplaza a la sección de características */}
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black"
              >
                <span>🔍</span> Buscar Canchas
              </a>

              {/* Ir a registro de clubes */}
              <Link
                to="/registrarse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-sm font-semibold hover:bg-gray-50"
              >
                <span>🏢</span> Registrar mi Club
              </Link>
            </div>

            {/* MÉTRICAS */}
            <div className="flex flex-wrap gap-10 pt-4 text-sm">
              <div>
                <p className="text-2xl font-bold text-slate-900">150+</p>
                <p className="text-gray-500">Complejos Deportivos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">5000+</p>
                <p className="text-gray-500">Reservas Realizadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">4.8</p>
                <p className="text-gray-500">Rating Promedio</p>
              </div>
            </div>
          </div>

          {/* IMAGEN CANCHA */}
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1518607692855-9fdfe09c2e4f"
              alt="Cancha deportiva aérea"
              className="w-full max-w-xl rounded-3xl object-cover shadow-xl"
            />
          </div>
        </section>

        {/* SECCIÓN: TODO LO QUE NECESITAS */}
        <section id="features" className="bg-gray-50 py-14">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-slate-900">
              Todo lo que necesitas en una plataforma
            </h2>
            <p className="text-center text-gray-500 mt-2 mb-10">
              Simplificamos el proceso de reserva para deportistas y la gestión
              para administradores de clubes.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Tarjeta 1 */}
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  Búsqueda Inteligente
                </h3>
                <p className="text-sm text-gray-500">
                  Encuentra canchas por deporte, ubicación y disponibilidad.
                  Filtros avanzados para encontrar exactamente lo que buscas.
                </p>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  Reservas en Tiempo Real
                </h3>
                <p className="text-sm text-gray-500">
                  Sistema de reservas instantáneo con confirmación automática.
                  Ve la disponibilidad en tiempo real.
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">💳</span>
                </div>
                <h3 className="font-semibold text-slate-900">Pagos Seguros</h3>
                <p className="text-sm text-gray-500">
                  Procesa pagos de forma segura con múltiples métodos. Protección
                  de comprador incluida.
                </p>
              </div>

              {/* Tarjeta 4 */}
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="font-semibold text-slate-900">Panel de Control</h3>
                <p className="text-sm text-gray-500">
                  Dashboard completo para administradores con métricas,
                  estadísticas y gestión de reservas.
                </p>
              </div>

              {/* Tarjeta 5 */}
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <h3 className="font-semibold text-slate-900">Móvil Friendly</h3>
                <p className="text-sm text-gray-500">
                  Experiencia optimizada para móviles. Reserva desde cualquier
                  dispositivo, en cualquier momento.
                </p>
              </div>

              {/* Tarjeta 6 */}
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  Confianza y Seguridad
                </h3>
                <p className="text-sm text-gray-500">
                  Sistema de verificación de clubes y reseñas de usuarios. Tu
                  seguridad es nuestra prioridad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section
          id="how-it-works"
          className="bg-white py-16 flex flex-col items-center"
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Cómo funciona
            </h2>
            <p className="text-gray-500 mt-2 mb-10">
              Reserva tu cancha favorita en 3 simples pasos
            </p>

            <div className="grid md:grid-cols-3 gap-10 mt-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-slate-900">
                  Busca tu cancha
                </h3>
                <p className="text-sm text-gray-500">
                  Usa nuestros filtros para encontrar la cancha perfecta cerca
                  de ti.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-slate-900">
                  Selecciona fecha y hora
                </h3>
                <p className="text-sm text-gray-500">
                  Elige el horario que mejor te convenga y confirma
                  disponibilidad.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-slate-900">Paga y juega</h3>
                <p className="text-sm text-gray-500">
                  Realiza el pago seguro y recibe la confirmación instantánea.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA AZUL */}
        <section id="cta" className="bg-blue-600 py-14 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">¿Listo para empezar?</h2>
          <p className="text-blue-100 mb-6">
            Únete a miles de deportistas que ya confían en CanchaYa
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/registrarse"
              className="px-6 py-3 rounded-xl bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 inline-flex items-center gap-2"
            >
              <span>👤</span> Soy Deportista
            </Link>
            <Link
              to="/registrarse"
              className="px-6 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 inline-flex items-center gap-2"
            >
              <span>🏢</span> Tengo un Club
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-200 pt-10 pb-6">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3097/3097144.png"
                alt="logo"
                className="w-6 h-6"
              />
              <span className="font-bold text-blue-400">CanchaYa</span>
            </div>
            <p className="text-slate-400">
              La plataforma líder para reservar canchas deportivas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Para Deportistas</h4>
            <ul className="space-y-1 text-slate-400">
              <li>Buscar canchas</li>
              <li>Hacer reservas</li>
              <li>Ver historial</li>
              <li>Valorar clubes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Para Clubes</h4>
            <ul className="space-y-1 text-slate-400">
              <li>Registrar club</li>
              <li>Gestionar canchas</li>
              <li>Ver estadísticas</li>
              <li>Administrar reservas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Soporte</h4>
            <ul className="space-y-1 text-slate-400">
              <li>Centro de ayuda</li>
              <li>Contacto</li>
              <li>Términos y condiciones</li>
              <li>Política de privacidad</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-6 border-t border-slate-700 pt-4 text-xs text-slate-500 text-center">
          © 2024 CanchaYa. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
