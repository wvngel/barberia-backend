const express = require('express');
const router = express.Router();
const barberosHorariosController = require('../controllers/barberosHorariosController');
const { isAuthenticated, isBarbero } = require('../middlewares/auth');

// Rutas protegidas para horarios
router.use(isAuthenticated);
router.use(isBarbero);

router.get('/base', barberosHorariosController.getHorariosBase);
router.get('/semana', barberosHorariosController.getSemanaDisponible);
router.post('/asignar', barberosHorariosController.asignarHorario);

module.exports = router;
