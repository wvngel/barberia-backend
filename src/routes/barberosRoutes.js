const express = require("express");
const router = express.Router();
const {
  getAllBarberos,
  getBarberoById,
  createBarbero,
  updateBarberoProfile,
  deleteBarbero,
  checkSessionBarbero,
} = require("../controllers/barberosController");
const { cambiarContrasenaBarbero } = require("../controllers/barberosController");
const { isAuthenticated, isBarbero } = require("../middlewares/sessionConfirmation");

// Verificar sesión del barbero
router.get("/check-session", isAuthenticated, isBarbero, checkSessionBarbero);


// Ruta para cerrar sesión del barbero
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }
    res.clearCookie("connect.sid"); // Limpia la cookie de sesión
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  });
});

// Rutas protegidas para barberos
router.get("/", isAuthenticated, getAllBarberos); // Obtener todos los barberos
router.post("/", createBarbero); // Crear un barbero (sin autenticación)
// Ruta para cambiar la contraseña del barbero
router.put("/cambiar-contrasena", isAuthenticated, isBarbero, cambiarContrasenaBarbero);
router.get("/:id", isAuthenticated, isBarbero, getBarberoById); // Obtener un barbero por ID
router.put("/:id", isAuthenticated, isBarbero, updateBarberoProfile); // Actualizar perfil del barbero
router.delete("/:id", isAuthenticated, isBarbero, deleteBarbero); // Eliminar barbero

module.exports = router;
