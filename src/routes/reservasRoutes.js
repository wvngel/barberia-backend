const express = require("express");
const router = express.Router();
const reservasController = require("../controllers/reservasController");
const { isAuthenticated, isBarbero } = require("../middlewares/sessionConfirmation");   
// Ruta para crear una reserva
router.post("/crear", reservasController.crearReserva);

// Ruta para obtener reservas de un barbero específico
router.get("/mis-reservas", isAuthenticated, isBarbero, reservasController.getReservasByBarbero);


module.exports = router;
