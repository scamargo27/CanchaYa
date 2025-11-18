import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BuscarClubesPage from "./BuscarClubesPage";
import MisReservasPage from "./MisReservasPage";
import Reservas from "./components/navigation/Reservas"
import ConfirmarReservaPage from './containers/pages/ConfirmarReservaPage';
import ProcesarPagoPage from './containers/pages/ProcesarPagoPage';
import ReservaExitosaPage from './containers/pages/ReservaExitosaPage';
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
        <Route path="/Reservas" element={<Reservas />} />
        {/* área deportista */}
        <Route path="/deportista/buscar" element={<BuscarClubesPage />} />
        <Route path="/deportista/reservas" element={<MisReservasPage />} />




        <Route path="/confirmar-reserva" element={<ConfirmarReservaPage />} />
        <Route path="/procesar-pago" element={<ProcesarPagoPage />} />
        <Route path="/reserva-exitosa" element={<ReservaExitosaPage />} />
      </Routes>
    </BrowserRouter>
  );
}
