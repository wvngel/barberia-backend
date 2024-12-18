const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosDisponiblesController');

// Ruta para obtener todos los servicios
router.get('/', serviciosController.getAllServicios);

// Ruta para obtener servicios por categoría
router.get('/categoria/:id_categoria', serviciosController.getServiciosByCategoria);

module.exports = router;
