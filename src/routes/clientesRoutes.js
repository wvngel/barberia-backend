const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  updateClienteProfile,
  cambiarContrasenaCliente,
} = require("../controllers/clientesController");
const { isAuthenticated, isCliente } = require("../middlewares/sessionConfirmation");


// Middleware de autenticación y sesión


// Rutas para manejar clientes (sin protección)
router.get("/", getAllClientes); // Obtener todos los clientes
router.post("/", createCliente); // Crear un cliente

// Ruta para verificar la sesión del cliente
router.get("/cliente-check-session", isAuthenticated, isCliente, async (req, res) => {
  console.log("Endpoint /cliente-check-session llamado");
  if (req.session && req.session.user) {
    try {
      // Consultar más detalles del cliente en la base de datos
      const [cliente] = await pool.query(
       `SELECT nombre, apellido, email, rut, telefono 
        FROM usuarios_clientes 
        WHERE id_cliente = ?`,
        [req.session.user.id]
      );

      if (cliente.length > 0) {
        return res.status(200).json({
          session: {
            id: req.session.user.id,
            role: req.session.user.role,
            ...cliente[0], // Agregar los datos del cliente
          },
        });
      } else {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  }
  res.status(401).json({ error: "No hay sesión activa" });
});

// Ruta para cerrar sesión
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }
    res.clearCookie("connect.sid"); // Limpia la cookie del cliente
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  });
});
// Ruta para cambiar la contraseña del barbero
router.put("/cambiar-contrasena", isAuthenticated, isCliente, cambiarContrasenaCliente);
// Rutas protegidas por autenticación
router.get("/:id", isAuthenticated, isCliente, getClienteById); // Obtener un cliente por ID
router.put("/:id", isAuthenticated, isCliente, updateClienteProfile); // Actualizar un cliente por ID
router.delete("/:id", isAuthenticated, isCliente, deleteCliente); // Eliminar un cliente por ID

module.exports = router;
