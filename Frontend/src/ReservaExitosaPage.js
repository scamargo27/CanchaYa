import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
const ReservaExitosaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reserva = location.state?.reserva;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          {/* Icono de éxito */}
          <div className="text-6xl mb-6">✅</div>
          
          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Reserva Confirmada!
          </h1>
          
          {/* Descripción */}
          <p className="text-gray-600 text-lg mb-8">
            Tu reserva ha sido procesada exitosamente. Recibirás un email de confirmación con todos los detalles.
          </p>

          {/* Detalles de la reserva */}
          {reserva && (
            <div className="bg-gray-50 rounded-lg p-8 mb-8 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Detalles de tu Reserva
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Club:</span>
                  <span className="text-gray-900">{reserva.clubNombre}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Cancha:</span>
                  <span className="text-gray-900">{reserva.canchaNombre}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Deporte:</span>
                  <span className="text-gray-900">{reserva.deporteNombre}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <span className="text-gray-900">{reserva.fecha}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Hora:</span>
                  <span className="text-gray-900">{reserva.hora}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 pt-4">
                  <span className="font-semibold text-gray-900 text-lg">Total pagado:</span>
                  <span className="font-bold text-gray-900 text-xl">S/ {reserva.precio}</span>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-2">
                  ¿Qué sigue?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Recibirás un email de confirmación en los próximos minutos</li>
                  <li>• Puedes ver todos los detalles en "Mis Reservas"</li>
                  <li>• Llega 10 minutos antes de tu hora reservada</li>
                  <li>• Si necesitas cancelar, hazlo con 24 horas de anticipación</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/deportista/reservas')}
              className="bg-black text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Ver Mis Reservas
            </button>
            
            <button 
              onClick={() => navigate('/Reservas')}
              className="bg-white text-gray-700 py-3 px-8 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
            >
              Hacer Otra Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaExitosaPage;