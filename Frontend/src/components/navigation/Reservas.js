import React, { useState } from 'react';
import { Calendar, MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// Datos de ejemplo para los clubes
const clubsData = {
  'polideportivo-indoor': {
    name: 'Polideportivo Indoor',
    address: 'Av. Central 789, La Molina',
    phone: '+51 987 789 123',
    email: 'info@polideportivoindoor.com',
    hours: 'Lunes a Domingo: 8:00 AM - 11:00 PM',
    description: 'Complejo indoor especializado en deportes de cancha cerrada. Instalaciones climatizadas y pisos deportivos profesionales.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    sports: [
      { id: 'basquet', name: 'Básquet', courts: 2, priceFrom: 90 },
      { id: 'voley', name: 'Vóley', courts: 1, priceFrom: 95 },
      { id: 'badminton', name: 'Bádminton', courts: 1, priceFrom: 70 }
    ]
  }
};

const BookingView = () => {
  const clubId = 'polideportivo-indoor';
  const club = clubsData[clubId];
  
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // Noviembre 2025

  // Horarios disponibles
  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', 
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Canchas disponibles según deporte
  const getAvailableCourts = (sportId) => {
    const courts = {
      'basquet': [
        { id: 1, name: 'Cancha de Básquet Premium', players: 10, price: 110 },
        { id: 2, name: 'Cancha de Básquet Standard', players: 10, price: 90 }
      ],
      'voley': [
        { id: 1, name: 'Cancha de Vóley Premium', players: 12, price: 105 },
        { id: 2, name: 'Cancha de Vóley Standard', players: 12, price: 95 }
      ],
      'badminton': [
        { id: 1, name: 'Cancha de Bádminton Premium', players: 4, price: 80 },
        { id: 2, name: 'Cancha de Bádminton Standard', players: 4, price: 70 }
      ]
    };
    return courts[sportId] || [];
  };

  // Generar días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedCourt(null);
  };

  const handleDateSelect = (day) => {
    if (day) {
      setSelectedDate(day);
      setSelectedTime(null);
      setSelectedCourt(null);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setSelectedCourt(null);
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
  };

  const handleConfirmBooking = () => {
    alert(`Reserva confirmada:\nDeporte: ${selectedSport.name}\nFecha: ${selectedDate}/${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}\nHora: ${selectedTime}\nCancha: ${selectedCourt.name}\nPrecio: S/ ${selectedCourt.price}`);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
              Volver a la búsqueda
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              CY
            </div>
            <span className="font-semibold text-xl text-gray-800">CanchaYa</span>
          </div>
          <button className="text-gray-600 hover:text-gray-900">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Formulario de reserva */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img 
                src={club.image} 
                alt={club.name}
                className="w-full h-48 object-cover"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Reservar en {club.name}
              </h2>

              {/* Bloque 1: Selección de Deporte */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Seleccionar Deporte
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-10">
                  {club.sports.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => handleSportSelect(sport)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedSport?.id === sport.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{sport.name}</p>
                        <p className="text-sm text-gray-500">{sport.courts} canchas</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Desde S/ {sport.priceFrom}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloque 2: Selección de Fecha y Hora */}
              {selectedSport && (
                <div className="mb-8 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Seleccionar Fecha y Hora
                    </h3>
                  </div>

                  <div className="pl-10">
                    {/* Calendario */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Seleccionar Fecha
                      </p>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="font-semibold">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                          </span>
                          <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                          {dayNames.map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                              {day}
                            </div>
                          ))}
                          {getDaysInMonth(currentMonth).map((day, index) => (
                            <button
                              key={index}
                              onClick={() => handleDateSelect(day)}
                              disabled={!day}
                              className={`aspect-square rounded-lg text-sm transition-all ${
                                day
                                  ? selectedDate === day
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'hover:bg-gray-100'
                                  : ''
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Horarios disponibles */}
                    {selectedDate && (
                      <div className="animate-fadeIn">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Horarios Disponibles
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                          {availableTimes.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              className={`py-2 px-4 rounded-lg border-2 transition-all ${
                                selectedTime === time
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bloque 3: Selección de Cancha */}
              {selectedTime && (
                <div className="animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Seleccionar Cancha
                    </h3>
                  </div>

                  <div className="pl-10 space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Canchas de {selectedSport.name} Disponibles - {selectedDate}/{currentMonth.getMonth() + 1}/{currentMonth.getFullYear()} a las {selectedTime}
                    </p>
                    
                    {getAvailableCourts(selectedSport.id).map((court) => (
                      <div
                        key={court.id}
                        className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                          selectedCourt?.id === court.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleCourtSelect(court)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {court.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedSport.name} • {court.players} jugadores
                            </p>
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Disponible
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              S/ {court.price}
                            </p>
                            <p className="text-sm text-gray-500">Por hora</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de confirmación */}
              {selectedCourt && (
                <div className="mt-6 pl-10 animate-fadeIn">
                  <button
                    onClick={handleConfirmBooking}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Información del club y resumen */}
          <div className="space-y-6">
            {/* Información del Club */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Información del Club
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{club.address}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{club.phone}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{club.email}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{club.hours}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {club.description}
                </p>
              </div>
            </div>

            {/* Resumen de Selección */}
            {selectedSport && (
              <div className="bg-white rounded-xl shadow-sm p-6 animate-fadeIn">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  Resumen de Selección
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deporte:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedSport.name}
                    </span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedDate}/{currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hora:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTime}
                      </span>
                    </div>
                  )}
                  {selectedCourt && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cancha:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCourt.name}
                        </span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            S/ {selectedCourt.price}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default BookingView;     