// src/ProcesarPagoPage.js
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "./api/apiClient";
import logo from "./assets/logo-cancha.png";

function formatearMoneda(valor) {
  if (valor == null) return "-";
  const num = Number(valor);
  if (Number.isNaN(num)) return "-";
  return `S/ ${num.toFixed(2)}`;
}

// Suma 1 hora a un string "HH:MM"
function sumarUnaHora(horaHHMM) {
  const [hStr, mStr] = horaHHMM.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || "0", 10);
  const fecha = new Date(2000, 0, 1, h, m, 0);
  fecha.setHours(fecha.getHours() + 1);
  const hh = String(fecha.getHours()).padStart(2, "0");
  const mm = String(fecha.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ---- helpers para tarjeta ----
function limpiarDigitos(value) {
  return (value || "").replace(/\D/g, "");
}

function formatearNumeroTarjeta(value) {
  const digits = limpiarDigitos(value).slice(0, 16);
  // agrupa en bloques de 4
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export default function ProcesarPagoPage() {
  const navigate = useNavigate();
  const { state } = useLocation(); // datos que vienen de ReservaClubPage

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cvv, setCvv] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [phoneLocal, setPhoneLocal] = useState(""); // solo los 10 dígitos
  const [email, setEmail] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const hoy = useMemo(() => new Date(), []);
  const currentYear = hoy.getFullYear();
  const currentMonth = hoy.getMonth() + 1; // 1–12

  const MESES = [
    { value: "01", label: "01 - Enero" },
    { value: "02", label: "02 - Febrero" },
    { value: "03", label: "03 - Marzo" },
    { value: "04", label: "04 - Abril" },
    { value: "05", label: "05 - Mayo" },
    { value: "06", label: "06 - Junio" },
    { value: "07", label: "07 - Julio" },
    { value: "08", label: "08 - Agosto" },
    { value: "09", label: "09 - Septiembre" },
    { value: "10", label: "10 - Octubre" },
    { value: "11", label: "11 - Noviembre" },
    { value: "12", label: "12 - Diciembre" },
  ];

  const ANIOS = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => String(currentYear + i)), // año actual + 10
    [currentYear]
  );

  // Si alguien entra directo sin pasar por ReservaClubPage
  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
              <span className="font-bold text-xl text-blue-700">CanchaYa</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
            <p className="text-sm text-slate-600 mb-4">
              No se encontraron datos de la reserva para procesar el pago.
            </p>
            <Link
              to="/deportista/buscar"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
            >
              Ir a buscar canchas
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { club, cancha, deporte, fecha, hora, precioHora, tarifaTitulo } = state;

  const subtotal = Number(precioHora ?? 0);
  const igv = subtotal * 0.18; // 18%
  const total = subtotal + igv;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // --- VALIDACIONES FRONT ---

    const cardDigits = limpiarDigitos(cardNumber);
    if (cardDigits.length !== 16) {
      setErrorMsg("El número de tarjeta debe tener exactamente 16 dígitos.");
      return;
    }

    if (!cardName.trim()) {
      setErrorMsg("Ingresa el nombre que aparece en la tarjeta.");
      return;
    }

    const cvvDigits = limpiarDigitos(cvv);
    if (cvvDigits.length !== 3) {
      setErrorMsg("El CVV debe tener exactamente 3 dígitos.");
      return;
    }

    if (!expMonth || !expYear) {
      setErrorMsg("Selecciona el mes y año de vencimiento.");
      return;
    }

    const expMonthNum = parseInt(expMonth, 10);
    const expYearNum = parseInt(expYear, 10);

    // tarjeta vencida
    if (
      expYearNum < currentYear ||
      (expYearNum === currentYear && expMonthNum < currentMonth)
    ) {
      setErrorMsg("La tarjeta ingresada se encuentra vencida.");
      return;
    }

    // Teléfono: opcional, pero si se diligencia deben ser 10 dígitos
    if (phoneLocal && phoneLocal.length !== 10) {
      setErrorMsg("El teléfono de contacto debe tener 10 dígitos.");
      return;
    }

    // Email básico (si se completa)
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrorMsg("Ingresa un email de confirmación válido.");
      return;
    }

    setEnviando(true);
    try {
      // Normalizamos horas al formato HH:MM:SS
      const horaInicio = hora.length === 5 ? `${hora}:00` : hora;
      const horaFinBase = sumarUnaHora(hora);
      const horaFin =
        horaFinBase.length === 5 ? `${horaFinBase}:00` : horaFinBase;

      // Teléfono con prefijo +57
      const telefonoCompleto = phoneLocal ? `+57${phoneLocal}` : undefined;

      // ⚠️ Ajusta estos campos si tu ReservaCreateSerializer usa nombres distintos
      const payload = {
        cancha: cancha.id,
        fecha, // "YYYY-MM-DD"
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        precio: total, // o subtotal, según tu modelo
        metodo_pago: "tarjeta",
        descripcion: `Reserva desde frontend para ${cancha.nombre} (${
          tarifaTitulo || "Tarifa estándar"
        })`,
        telefono_contacto: telefonoCompleto,
        email_contacto: email || undefined,
      };

      console.log("[ProcesarPagoPage] payload reserva:", payload);

      const res = await api.post("/api/reservas/", payload);
      console.log("[ProcesarPagoPage] respuesta crear reserva:", res.data);

      const reservaCreada = res.data?.reserva || res.data;

      alert("¡Pago procesado y reserva creada exitosamente!");

      // 🔁 AQUÍ el cambio: ir a ConfirmarReservaPage
      navigate("/confirmar-reserva", {
        state: {
          reserva: reservaCreada,
          pago: {
            subtotal,
            igv,
            total,
          },
          club,
          cancha,
          deporte,
          fecha,
          hora,
        },
      });
    } catch (error) {
      console.error("Error al procesar el pago / crear reserva", error);
      const detail =
        error.response?.data?.detalle ||
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data || {});
      setErrorMsg(
        `Ocurrió un error al crear la reserva en el backend.\nDetalle: ${detail}`
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR PERFIL DEPORTISTA */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CanchaYa logo" className="w-7 h-7" />
            <span className="font-bold text-xl text-blue-700">CanchaYa</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/deportista/buscar" className="text-slate-700">
              Buscar
            </Link>
            <Link to="/deportista/reservas" className="text-slate-700">
              Mis Reservas
            </Link>
            <Link to="/deportista/notificaciones" className="text-slate-700">
              Notificaciones
            </Link>
            <Link to="/deportista/perfil" className="text-slate-700">
              Perfil
            </Link>

            <Link
              to="/login"
              className="ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50"
            >
              <span>↪</span>
              <span>Cerrar Sesión</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-8 py-8 space-y-6">
          {/* Volver */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <span>←</span>
            <span>Volver</span>
          </button>

          <h1 className="text-2xl font-semibold text-slate-900 mb-1">
            Procesar Pago
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            Completa tu información de pago para confirmar la reserva.
          </p>

          <div className="grid grid-cols-[2fr,1fr] gap-6">
            {/* FORMULARIO DE PAGO */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6"
            >
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                  <span>Información de Pago</span>
                </h2>

                <div className="space-y-4">
                  {/* Número de tarjeta */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Número de tarjeta *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatearNumeroTarjeta(e.target.value))
                      }
                    />
                  </div>

                  {/* Nombre + CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nombre en la tarjeta *
                      </label>
                      <input
                        type="text"
                        autoComplete="cc-name"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre completo"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                        value={cvv}
                        maxLength={3}
                        onChange={(e) =>
                          setCvv(limpiarDigitos(e.target.value).slice(0, 3))
                        }
                      />
                    </div>
                  </div>

                  {/* Mes y año de vencimiento */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Mes de vencimiento *
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                      >
                        <option value="">Selecciona mes</option>
                        {MESES.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Año de vencimiento *
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                      >
                        <option value="">Selecciona año</option>
                        {ANIOS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DE CONTACTO */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Información de Contacto
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* Teléfono con prefijo +57 fijo */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Teléfono de contacto
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
                        +57
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3001234567"
                        value={phoneLocal}
                        maxLength={10}
                        onChange={(e) =>
                          setPhoneLocal(
                            limpiarDigitos(e.target.value).slice(0, 10)
                          )
                        }
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Solo números, 10 dígitos del celular en Colombia.
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email de confirmación
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="tu-email@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 whitespace-pre-line">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? "Procesando..." : "Confirmar Pago"}
              </button>
            </form>

            {/* RESUMEN DEL PEDIDO */}
            <aside className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
              <h3 className="font-semibold text-slate-900 mb-2">
                Resumen del Pedido
              </h3>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-semibold">Club: </span>
                  {club?.nombre}
                </p>
                <p>
                  <span className="font-semibold">Cancha: </span>
                  {cancha?.nombre || `Cancha ${cancha?.id}`}
                </p>
                <p>
                  <span className="font-semibold">Deporte: </span>
                  {deporte}
                </p>
                <p>
                  <span className="font-semibold">Fecha: </span>
                  {fecha}
                </p>
                <p>
                  <span className="font-semibold">Hora: </span>
                  {hora}
                </p>
                <p>
                  <span className="font-semibold">Duración: </span>1 hora
                </p>
                {tarifaTitulo && (
                  <p>
                    <span className="font-semibold">Tarifa: </span>
                    {tarifaTitulo}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">
                    {formatearMoneda(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">IGV (18%):</span>
                  <span className="font-medium text-slate-900">
                    {formatearMoneda(igv)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                  <span className="text-slate-800 font-semibold">Total:</span>
                  <span className="text-slate-900 font-semibold">
                    {formatearMoneda(total)}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                Al confirmar el pago, aceptas nuestros términos y condiciones.
              </p>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
