import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BuscarClubesPage from "./BuscarClubesPage";
import MisReservasPage from "./MisReservasPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
        {/* área deportista */}
        <Route path="/deportista/buscar" element={<BuscarClubesPage />} />
        <Route path="/deportista/reservas" element={<MisReservasPage />} />
      </Routes>
    </BrowserRouter>
  );
}
