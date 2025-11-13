import React, { useState } from 'react';
import { Search, MapPin, Phone, ChevronDown, Filter } from 'lucide-react';

const Body = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const clubs = [
    {
      id: 1,
      name: 'Tennis & Pádel Elite',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
      address: 'Av. Larco 456, Miraflores',
      phone: '+51 987 654 321',
      sports: ['Tenis', 'Pádel'],
      available: true
    },
    {
      id: 2,
      name: 'Futbol Center Pro',
      image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
      address: 'Av. Los Deportes 123, San Isidro',
      phone: '+51 987 123 456',
      sports: ['Fútbol', 'Futsal'],
      available: true
    },
    {
      id: 3,
      name: 'Polideportivo Indoor',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
      address: 'Av. Central 789, La Molina',
      phone: '+51 987 789 123',
      sports: ['Básquet', 'Vóley', 'Bádminton'],
      available: true
    },
    {
      id: 4,
      name: 'Arena Sports Complex',
      image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80',
      address: 'Av. Universitaria 234, Surco',
      phone: '+51 987 456 789',
      sports: ['Fútbol', 'Básquet'],
      available: true
    },
    {
      id: 5,
      name: 'Club Deportivo Premium',
      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80',
      address: 'Av. Primavera 567, San Borja',
      phone: '+51 987 321 654',
      sports: ['Tenis', 'Natación', 'Gym'],
      available: false
    },
    {
      id: 6,
      name: 'Mega Sport Center',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      address: 'Av. Javier Prado 890, San Isidro',
      phone: '+51 987 654 987',
      sports: ['Vóley', 'Básquet', 'Futsal'],
      available: true
    }
  ];

  return (
    <div className="flex-1 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
          Buscar Clubes Deportivos
        </h1>

        {/* Search Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 mb-6 md:mb-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-medium text-gray-700">Filtros de búsqueda</span>
            <Filter size={20} className="text-gray-500" />
          </button>

          {/* Search Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4">
              {/* Search Input */}
              <div className="sm:col-span-2 lg:col-span-4 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar club específico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
              </div>

              {/* Sport Dropdown */}
              <div className="lg:col-span-3 relative">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer text-sm md:text-base"
                >
                  <option value="">Deporte</option>
                  <option value="futbol">Fútbol</option>
                  <option value="tenis">Tenis</option>
                  <option value="padel">Pádel</option>
                  <option value="basquet">Básquet</option>
                  <option value="voley">Vóley</option>
                  <option value="natacion">Natación</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {/* Location Dropdown */}
              <div className="lg:col-span-3 relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer text-sm md:text-base"
                >
                  <option value="">Ubicación</option>
                  <option value="miraflores">Miraflores</option>
                  <option value="san-isidro">San Isidro</option>
                  <option value="la-molina">La Molina</option>
                  <option value="surco">Surco</option>
                  <option value="san-borja">San Borja</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2 lg:col-span-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 md:px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors text-sm md:text-base">
                  <Search size={20} />
                  <span>Buscar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm md:text-base">
            Mostrando <span className="font-semibold">{clubs.length}</span> clubes deportivos disponibles
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                <img
                  src={club.image}
                  alt={club.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`${
                      club.available
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    } text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full shadow-lg`}
                  >
                    {club.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 line-clamp-1">
                  {club.name}
                </h3>

                <div className="space-y-2 sm:space-y-3 mb-4">
                  <div className="flex items-start space-x-2 sm:space-x-3 text-gray-600">
                    <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm line-clamp-2">{club.address}</span>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
                    <Phone size={18} className="flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{club.phone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {club.sports.map((sport, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded-lg border border-blue-200"
                    >
                      {sport}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base">
                  Ver disponibilidad
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Body;