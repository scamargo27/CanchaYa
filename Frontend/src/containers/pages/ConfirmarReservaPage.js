import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/navigation/Navbar';
const ConfirmarReservaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reservaData, setReservaData] = useState(null);
  const [notasAdicionales, setNotasAdicionales] = useState('');

  useEffect(() => {
    // Obtener datos de la reserva del state de navegación
    if (location.state && location.state.reserva) {
      setReservaData(location.state.reserva);
    } else {
      // Si no hay datos, redirigir a búsqueda
      navigate('/buscar');
    }
  }, [location, navigate]);

  const handleProcederPago = () => {
    if (reservaData) {
      navigate('/procesar-pago', {
        state: {
          reserva: {
            ...reservaData,
            notasAdicionales
          }
        }
      });
    }
  };

  if (!reservaData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-gray-600 text-lg">Cargando información de la reserva...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors mb-6"
        >
          <span>←</span>
          <span>Volver</span>
        </button>

        <div className="bg-white rounded-xl shadow-md p-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Confirmar Reserva
            </h1>
            <p className="text-gray-600">
              Revisa los detalles de tu reserva antes de confirmar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Detalles de la Reserva */}
            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded-xl p-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Detalles de la Reserva
                </h2>
                
                {/* Fila 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 font-medium mb-2">
                      Club
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {reservaData.clubNombre || 'Polideportivo Indoor'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 font-medium mb-2">
                      Cancha
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {reservaData.canchaNombre || 'Cancha de Vóley Profesional'}
                    </p>
                  </div>
                </div>

                {/* Fila 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 font-medium mb-2">
                      Deporte
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {reservaData.deporteNombre || 'Vóley'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 font-medium mb-2">
                      Capacidad
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {reservaData.capacidad || '12'} jugadores
                    </p>
                  </div>
                </div>

                {/* Fila 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm text-gray-600 font-medium mb-2">
                      Fecha
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {reservaData.fecha || '28/11/2025'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 font-medium mb-2">
                      Hora
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {reservaData.hora || '21:00'}
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      Total a pagar:
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      S/ {reservaData.precio || '95'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 text-right">
                    Por 1 hora de juego
                  </p>
                </div>

                {/* Notas adicionales */}
                <div className="mt-8">
                  <label 
                    htmlFor="notas" 
                    className="block text-sm font-semibold text-gray-900 mb-3"
                  >
                    Notas adicionales
                  </label>
                  <textarea
                    id="notas"
                    placeholder="¿Alguna solicitud especial? (opcional)"
                    value={notasAdicionales}
                    onChange={(e) => setNotasAdicionales(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  />
                </div>

                {/* Botón */}
                <button 
                  onClick={handleProcederPago}
                  className="w-full mt-6 bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Proceder al Pago
                </button>
              </div>
            </div>

            {/* Columna derecha - Información de Contacto */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-xl p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Información de Contacto
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 py-4 border-b border-gray-100">
                    <span className="text-xl">📞</span>
                    <span className="text-gray-700">
                      {reservaData.clubTelefono || '+51 987 789 123'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 py-4 border-b border-gray-100">
                    <span className="text-xl">✉️</span>
                    <span className="text-gray-700 break-all">
                      {reservaData.clubEmail || 'info@polideportivoindoor.com'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 py-4">
                    <span className="text-xl">📍</span>
                    <span className="text-gray-700">
                      {reservaData.clubDireccion || 'Av. Central 789, La Molina'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarReservaPage;