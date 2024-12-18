const express = require('express');
const router = express.Router();
const horariosDisponiblesController = require('../controllers/horariosDisponiblesController');

// Ruta para obtener horarios únicos por día
router.get('/horariosUnicos', horariosDisponiblesController.getHorariosUnicosPorDia);

// Ruta para obtener barberos por día y horario
router.get('/barberosPorHorario', horariosDisponiblesController.getBarberosPorDiaYHorario);

module.exports = router;
