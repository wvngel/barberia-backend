const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");

// Ruta POST para programar una publicación
router.post("/schedule", socialController.schedulePost);



// Rutas para manejar el webhook
router.get("/webhook", socialController.verifyWebhook); // Verificación
router.post("/webhook", socialController.handleWebhookEvent); // Eventos
module.exports = router;
