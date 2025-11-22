// src/AppRouter.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BuscarClubesPage from "./BuscarClubesPage";
import MisReservasPage from "./MisReservasPage";
import Reservas from "./components/navigation/Reservas";
import ConfirmarReservaPage from "./ConfirmarReservaPage";
import ProcesarPagoPage from "./ProcesarPagoPage";
import ReservaExitosaPage from "./ReservaExitosaPage";
import ReservaClubPage from "./ReservaClubPage"; 
import NotificacionesPage from "./NotificacionesPage"; 
import PerfilPage from "./PerfilPage";
import ClubInicioPage from "./ClubInicioPage";
import AdminCanchasPage from "./AdminCanchasPage";
import AdminReservasPage from "./AdminReservasPage";
import AdminPerfilPage from "./AdminPerfilPage";



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />

        {/* Páginas deportista */}
        <Route path="/deportista/buscar" element={<BuscarClubesPage />} />
        <Route path="/deportista/reservas" element={<MisReservasPage />} />
        <Route path="/deportista/notificaciones" element={<NotificacionesPage />} />
        {/* detalle del club / flujo de reserva */}
        <Route path="/deportista/club/:clubId" element={<ReservaClubPage />} />
        <Route path="/deportista/perfil" element={<PerfilPage />} />
        {/* (por ahora dejo esta ruta de Reservas como la tenías) */}
        <Route path="/Reservas" element={<Reservas />} />
        <Route path="/club/home" element={<ClubInicioPage />} />
        <Route path="/club/canchas" element={<AdminCanchasPage />} />
        <Route path="/procesar-pago" element={<ProcesarPagoPage />} />
        <Route path="/confirmar-reserva" element={<ConfirmarReservaPage />} />
        <Route path="/club/reservas" element={<AdminReservasPage />} />
        <Route path="/club/perfil" element={<AdminPerfilPage />} />
        {/* Flujo de pago */}
        <Route path="/confirmar-reserva" element={<ConfirmarReservaPage />} />
        <Route path="/procesar-pago" element={<ProcesarPagoPage />} />
        <Route path="/reserva-exitosa" element={<ReservaExitosaPage />} />
        <Route path="/deportista/buscar" element={<BuscarClubesPage />} />
        <Route path="/procesar-pago" element={<ProcesarPagoPage />} />
      </Routes>
    </BrowserRouter>
  );
}
