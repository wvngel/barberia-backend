const express = require("express");
const { login } = require("../controllers/loginController");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

// Iniciar sesión
router.post("/", login);

// Verificar sesión
router.get("/check-session", isAuthenticated, (req, res) => {
  res.status(200).json({ session: req.session.user });
});

// Cerrar sesión
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Error al cerrar sesión" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  });
});

module.exports = router;
