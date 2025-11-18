import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/navigation/Navbar';
const ProcesarPagoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reservaData, setReservaData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    numeroTarjeta: '',
    nombreTarjeta: '',
    mesVencimiento: '',
    añoVencimiento: '',
    cvv: '',
    telefono: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location.state && location.state.reserva) {
      setReservaData(location.state.reserva);
    } else {
      navigate('/buscar');
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatear número de tarjeta
    if (name === 'numeroTarjeta') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar número de tarjeta (16 dígitos)
    const numeroLimpio = formData.numeroTarjeta.replace(/\s/g, '');
    if (!numeroLimpio || numeroLimpio.length !== 16) {
      newErrors.numeroTarjeta = 'Número de tarjeta inválido (16 dígitos)';
    }

    // Validar nombre
    if (!formData.nombreTarjeta.trim()) {
      newErrors.nombreTarjeta = 'Nombre es requerido';
    }

    // Validar mes
    if (!formData.mesVencimiento) {
      newErrors.mesVencimiento = 'Mes requerido';
    }

    // Validar año
    if (!formData.añoVencimiento) {
      newErrors.añoVencimiento = 'Año requerido';
    }

    // Validar CVV (3 dígitos)
    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV inválido (3 dígitos)';
    }

    // Validar teléfono
    const telefonoLimpio = formData.telefono.replace(/\s/g, '');
    if (!telefonoLimpio || telefonoLimpio.length < 9) {
      newErrors.telefono = 'Teléfono inválido';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmarPago = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simular procesamiento de pago
    setTimeout(() => {
      // Aquí iría la llamada a tu API backend
      // const response = await fetch('/api/reservas/crear', { ... });
      
      setIsProcessing(false);
      
      // Navegar a página de confirmación o éxito
      navigate('/reserva-exitosa', {
        state: {
          reserva: reservaData,
          pago: formData
        }
      });
    }, 2000);
  };

  const calcularIGV = () => {
    const subtotal = parseFloat(reservaData?.precio || 0);
    return (subtotal * 0.18).toFixed(2);
  };

  const calcularTotal = () => {
    const subtotal = parseFloat(reservaData?.precio || 0);
    const igv = parseFloat(calcularIGV());
    return (subtotal + igv).toFixed(2);
  };

  if (!reservaData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-gray-600 text-lg">Cargando información...</p>
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
              Procesar Pago
            </h1>
            <p className="text-gray-600">
              Completa tu información de pago para confirmar la reserva
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de Pago */}
            <div className="lg:col-span-2">
              <form onSubmit={handleConfirmarPago}>
                {/* Información de Pago */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-6 text-gray-900 flex items-center gap-2">
                    <span>💳</span>
                    <span>Información de Pago</span>
                  </h2>
                  
                  {/* Número de tarjeta */}
                  <div className="mb-5">
                    <label htmlFor="numeroTarjeta" className="block text-sm font-medium text-gray-700 mb-2">
                      Número de tarjeta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      value={formData.numeroTarjeta}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.numeroTarjeta 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {errors.numeroTarjeta && (
                      <span className="block text-red-500 text-sm mt-1.5">
                        {errors.numeroTarjeta}
                      </span>
                    )}
                  </div>

                  {/* Nombre en la tarjeta */}
                  <div className="mb-5">
                    <label htmlFor="nombreTarjeta" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre en la tarjeta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombreTarjeta"
                      name="nombreTarjeta"
                      placeholder="Nombre completo"
                      value={formData.nombreTarjeta}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.nombreTarjeta 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {errors.nombreTarjeta && (
                      <span className="block text-red-500 text-sm mt-1.5">
                        {errors.nombreTarjeta}
                      </span>
                    )}
                  </div>

                  {/* Mes, Año y CVV */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="mesVencimiento" className="block text-sm font-medium text-gray-700 mb-2">
                        Mes de vencimiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="mesVencimiento"
                        name="mesVencimiento"
                        value={formData.mesVencimiento}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.mesVencimiento 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      >
                        <option value="">Mes</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const mes = String(i + 1).padStart(2, '0');
                          return <option key={mes} value={mes}>{mes}</option>;
                        })}
                      </select>
                      {errors.mesVencimiento && (
                        <span className="block text-red-500 text-sm mt-1.5">
                          {errors.mesVencimiento}
                        </span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="añoVencimiento" className="block text-sm font-medium text-gray-700 mb-2">
                        Año de vencimiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="añoVencimiento"
                        name="añoVencimiento"
                        value={formData.añoVencimiento}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.añoVencimiento 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      >
                        <option value="">Año</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const año = new Date().getFullYear() + i;
                          return <option key={año} value={año}>{año}</option>;
                        })}
                      </select>
                      {errors.añoVencimiento && (
                        <span className="block text-red-500 text-sm mt-1.5">
                          {errors.añoVencimiento}
                        </span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        maxLength="3"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.cvv 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {errors.cvv && (
                        <span className="block text-red-500 text-sm mt-1.5">
                          {errors.cvv}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-6 text-gray-900">
                    Información de Contacto
                  </h2>
                  
                  {/* Teléfono */}
                  <div className="mb-5">
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono de contacto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      placeholder="+51 987 654 321"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.telefono 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {errors.telefono && (
                      <span className="block text-red-500 text-sm mt-1.5">
                        {errors.telefono}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email de confirmación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="tu-email@ejemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {errors.email && (
                      <span className="block text-red-500 text-sm mt-1.5">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-4"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Al confirmar el pago, aceptas nuestros términos y condiciones
                </p>
              </form>
            </div>

            {/* Resumen del Pedido */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-xl p-8 sticky top-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Resumen del Pedido
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Club:</span>
                    <span className="text-gray-900 font-medium text-right">
                      {reservaData.clubNombre}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Cancha:</span>
                    <span className="text-gray-900 font-medium text-right">
                      {reservaData.canchaNombre}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="text-gray-900 font-medium">
                      {reservaData.fecha}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Hora:</span>
                    <span className="text-gray-900 font-medium">
                      {reservaData.hora}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Duración:</span>
                    <span className="text-gray-900 font-medium">1 hora</span>
                  </div>

                  <div className="border-t border-gray-200 my-4"></div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900 font-medium">
                      S/ {reservaData.precio}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">IGV (18%):</span>
                    <span className="text-gray-900 font-medium">
                      S/ {calcularIGV()}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 my-4"></div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      S/ {calcularTotal()}
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

export default ProcesarPagoPage;