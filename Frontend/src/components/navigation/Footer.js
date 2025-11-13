import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🏟️</span>
              </div>
              <span className="text-2xl font-bold text-white">CanchaYa</span>
            </div>
            <p className="text-sm text-gray-400">
              La plataforma líder para reservar canchas deportivas en Perú. Encuentra y reserva tu espacio deportivo favorito.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Buscar Canchas
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Mis Reservas
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Registrar mi Cancha
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span className="text-sm">
                  Av. Larco 345, Miraflores<br />Lima, Perú
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="flex-shrink-0" />
                <span className="text-sm">+51 987 654 321</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="flex-shrink-0" />
                <span className="text-sm">info@canchaya.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-400 text-center sm:text-left">
              © 2024 CanchaYa. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Política de Cookies
              </a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Mapa del Sitio
              </a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Accesibilidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;