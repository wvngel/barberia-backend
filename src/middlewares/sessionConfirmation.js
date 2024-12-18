const pool = require("../config/database");

// Middleware para verificar si hay una sesión activa
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: "No hay sesión activa." });
};

// Middleware para verificar si el usuario es un barbero
const isBarbero = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "barbero") {
    return next();
  }
  return res.status(403).json({ error: "Acceso denegado: solo para barberos." });
};

// Middleware para verificar si el usuario es un cliente
const isCliente = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "cliente") {
    return next();
  }
  return res.status(403).json({ error: "Acceso denegado: solo para clientes." });
};

// Middleware para verificar si el usuario es un administrador
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Acceso denegado: solo para administradores." });
};

// Middleware principal para verificar la sesión y devolver datos según el rol
const checkSession = async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "No hay sesión activa." });
  }

  const { role, id } = req.session.user;

  try {
    if (role === "cliente") {
      const [cliente] = await pool.query(
        `SELECT nombre, apellido, email, rut, telefono FROM usuarios_clientes WHERE id_cliente = ?`,
        [id]
      );
      if (cliente.length > 0) {
        return res.status(200).json({
          role: "cliente",
          session: { id, role, ...cliente[0] },
        });
      }   
    } else if (role === "barbero") {
      const [barbero] = await pool.query(
        `SELECT nombre, especialidad, horario_disponible FROM barberos WHERE id_barbero = ?`,
        [id]
      );
      if (barbero.length > 0) {
        return res.status(200).json({
          role: "barbero",
          session: { id, role, ...barbero[0] },
        });
      }
    } else if (role === "admin") {
      const [admin] = await pool.query(
        `SELECT nombre, apellido, email, telefono FROM administradores WHERE id_admin = ?`,
        [id]
      );
      if (admin.length > 0) {
        return res.status(200).json({
          role: "admin",
          session: { id, role, ...admin[0] },
        });
      }
    }
    return res.status(404).json({ error: "Usuario no encontrado o rol no válido." });
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    return res.status(500).json({ error: "Error en el servidor." });
  }
};

module.exports = { isAuthenticated, isBarbero, isCliente, isAdmin, checkSession };
