# CanchaYa 🏟️  
Plataforma web para la **gestión y reserva de canchas deportivas**, permitiendo que clubes administren su complejo deportivo y que deportistas encuentren, reserven y gestionen sus horarios de juego de forma rápida y sencilla.

---

## 🚀 Características principales

### 👨‍💼 Rol Club (Administrador del Complejo Deportivo)
- Panel de inicio con **resumen de reservas del día**.
- CRUD de canchas:
  - Nombre, tipo de deporte, superficie, capacidad, imagen.
  - Tarifas por franja horaria (día, hora inicio, hora fin, precio).
- Gestión completa de reservas:
  - Ver detalle de cada reserva.
  - Cambiar estado:  
    **Pendiente → Confirmada → En curso → Completada**,  
    o marcar como **Cancelada**.
- Perfil del club editable:
  - Datos del administrador principal.
  - Información general del club.
  - Horarios de apertura/cierre.
  - Página web y descripción del club.

### 🏃‍♂️ Rol Deportista
- Buscar clubes y canchas disponibles.
- Realizar reservas.
- Ver historial: pendientes, confirmadas, en curso, completadas o canceladas.
- Sistema de **notificaciones automáticas** (confirmación, cancelación, recordatorios).
- Perfil personal editable.

### 🔔 Notificaciones
- Notificaciones basadas en cambios de estado de reservas.
- Cada notificación puede aparecer para:
  - Reserva confirmada
  - Reserva cancelada
  - Recordatorio de reserva
  - Promociones
- Sistema de "marcar como leída".

---

## 🧱 Tecnologías utilizadas

### Backend
- Python 3.10+
- Django
- Django REST Framework (DRF)
- SQLite / PostgreSQL (según configuración)

### Frontend
- React
- React Router DOM
- Axios
- Tailwind-like classes (estilo utilitario)

---

## 📁 Estructura del Proyecto

```bash
CanchaYa/
├── backend/
│   ├── accounts/         # Usuarios, login, clubes
│   ├── canchas/          # Canchas y tarifas
│   ├── reservas/         # Reservas y estados
│   ├── core/             # Utilidades / middleware
│   ├── django_canchaYa/  # Configuración Django (urls, settings, wsgi)
│   └── manage.py
│
└── Frontend/
    ├── src/
    │   ├── api/                  # Cliente axios
    │   ├── assets/               # Imágenes
    │   ├── AdminHomePage.js
    │   ├── AdminCanchasPage.js
    │   ├── AdminReservasPage.js
    │   ├── AdminPerfilPage.js
    │   ├── NotificacionesPage.js
    │   ├── DeportistaReservasPage.js
    │   ├── BuscarClubesPage.js
    │   ├── LoginPage.js
    │   ├── RegisterPage.js
    │   └── AppRouter.js
    └── package.json
⚙️ Configuración del Backend
Ir al backend:

bash
Copiar código
cd backend
Crear entorno e instalar dependencias:

bash
Copiar código
python -m venv venv
venv/Scripts/activate    # Windows
# o
source venv/bin/activate # Mac / Linux

pip install -r requirements.txt
Migraciones:

bash
Copiar código
python manage.py migrate
Crear superusuario:

bash
Copiar código
python manage.py createsuperuser
Ejecutar servidor local:

bash
Copiar código
python manage.py runserver
Backend disponible en:
➡️ http://127.0.0.1:8000/

🎨 Configuración del Frontend
Ir al frontend:

bash
Copiar código
cd Frontend
Instalar dependencias:

bash
Copiar código
npm install
Verificar URL base del backend en src/api/apiClient.js:

js
Copiar código
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});
Iniciar frontend:

bash
Copiar código
npm start
Frontend disponible en:
➡️ http://localhost:3000/

📡 Endpoints principales (API)
Ajustar según tu backend real.

Autenticación
POST /api/accounts/auth/login/

POST /api/accounts/auth/register/

Club
GET /api/accounts/clubes/mi-club/

PUT /api/accounts/clubes/mi-club/ – Actualizar perfil

Canchas
GET /api/canchas/

POST /api/canchas/

PUT /api/canchas/{id}/

DELETE /api/canchas/{id}/

GET /api/canchas/{id}/tarifas/

POST /api/canchas/{id}/crear-tarifa/

Reservas
GET /api/reservas/reservas-club/?fecha=YYYY-MM-DD

GET /api/reservas/mis-reservas/

PUT /api/reservas/{id}/cambiar-estado/

Notificaciones
GET /api/notificaciones/

POST /api/notificaciones/{id}/marcar-leida/

📊 Estados de Reserva
nginx
Copiar código
pendiente
confirmada
en_curso
completada
cancelada
Las reservas pasan automáticamente a completadas según fecha/hora.

📝 TODO / Mejoras futuras
 Integración con pasarelas de pago reales.

 Subir imágenes de canchas desde frontend.

 Notificaciones push en tiempo real (WebSockets).

 Testing automatizado.

 Dashboard con estadísticas.
