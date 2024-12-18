const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

dotenv.config();

const app = express();

// ======== CONFIGURACIÓN DE CORS ========
app.use(
  cors({
    origin: [
      "https://127.0.0.1:5500", // Front-end en HTTPS
      "https://localhost:5500", // Posible dirección del front-end
    ],
    credentials: true, // Permitir envío de cookies
  })
);

// ======== MIDDLEWARES ========
app.use(cookieParser());
app.use(express.json());

// ======== CONFIGURACIÓN DE SESIONES ========
const dbOptions = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "694747",
  database: process.env.DB_DATABASE || "barberia",
};
const sessionStore = new MySQLStore(dbOptions);

app.use(
  session({
    key: process.env.SESSION_KEY || "connect.sid",
    secret: process.env.SESSION_SECRET || "clave_secreta",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Requiere HTTPS
      httpOnly: true, // Protege contra ataques XSS
      sameSite: "none", // Permite cookies en contextos cruzados (CORS)
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    },
  })
);

// ======== MIDDLEWARE DE DEPURACIÓN ========
app.use((req, res, next) => {
  console.log("=== DEPURACIÓN ===");
  console.log("Sesión actual:", req.session?.user || "No hay sesión activa");
  console.log("Cookies recibidas:", req.cookies);
  next();
});

// ======== IMPORTACIÓN DE RUTAS ========
const clientesRoutes = require("./routes/clientesRoutes");
const loginRoutes = require("./routes/loginRoutes");
const barberosRoutes = require("./routes/barberosRoutes");
const barberosHorariosRoutes = require('./routes/barberosHorariosRoutes');
const serviciosDisponiblesRoutes = require('./routes/serviciosDisponiblesRoutes');
const horariosDisponiblesRoutes = require('./routes/horariosDisponiblesRoutes');
const reservasRoutes = require("./routes/reservasRoutes");
const productosRoutes = require("./routes/productosRoutes");
const adminRoutes = require("./routes/adminRoutes");
const socialRoutes = require("./routes/socialRoutes");

// ======== RUTAS PRINCIPALES ========
app.use("/api/clientes", clientesRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/barberos", barberosRoutes);
app.use('/api/barberos/horarios', barberosHorariosRoutes);
app.use('/api/serviciosDisponibles', serviciosDisponiblesRoutes);
app.use("/api/productos", productosRoutes);
app.use('/api/horariosDisponibles', horariosDisponiblesRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/reservas", reservasRoutes);

// ======== RUTAS PARA ARCHIVOS ESTÁTICOS ========
app.use('/admin', express.static('admin'));
app.use('/img/productos', express.static('C:/Users/novoa/OneDrive/Escritorio/Proyecto de titulo/barberia-frontend/img/productos'));

// ======== AUTOMATIZACIÓN DE REDES SOCIALES ========
app.use("/api/social", socialRoutes);
app.use(express.static(path.join(__dirname, "../public"))); // Carpeta "public"

// Ruta específica para servir el HTML de redes sociales (rrhh.html)
app.get("/rrhh", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/rrhh.html"));
});

// ======== RUTA DE VERIFICACIÓN ========
app.get("/", (req, res) => {
  res.send("Servidor HTTPS funcionando correctamente.");
});

// ======== EXPORTAR APLICACIÓN ========
module.exports = app;
