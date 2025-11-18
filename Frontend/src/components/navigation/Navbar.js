import React, { useState } from 'react';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';



const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🏟️</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">CanchaYa</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <button className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
              Buscar
            </button>
            <button className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium transition-colors">
              Mis Reservas
            </button>
            <button className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium transition-colors relative">
              Notificaciones
              <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium transition-colors">
              Perfil
            </button>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <button className="w-full text-left px-4 py-3 bg-black text-white rounded-lg font-medium">
                Buscar
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                Mis Reservas
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center justify-between">
                Notificaciones
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                Perfil
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;