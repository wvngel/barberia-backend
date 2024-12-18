const bcrypt = require("bcryptjs");
const pool = require("../config/database");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar en la tabla de clientes
    let [rows] = await pool.query("SELECT * FROM usuarios_clientes WHERE email = ?", [email]);
    if (rows.length > 0) {
      const usuario = rows[0];
      const passwordMatch = await bcrypt.compare(password, usuario.contrasena);
      if (passwordMatch) {
        req.session.user = {
          id: usuario.id_cliente,
          nombre: usuario.nombre,
          role: "cliente",
        };

        req.session.save((err) => {
          if (err) {
            console.error("Error al guardar la sesión:", err);
            return res.status(500).json({ error: "Error al iniciar sesión" });
          }
          console.log("Usuario en sesión configurado:", req.session.user);
          return res.status(200).json({
            message: "Inicio de sesión exitoso",
            role: "cliente",
            usuario,
          });
        });
        return;
      }
    }

    // Verificar en la tabla de barberos
    [rows] = await pool.query("SELECT * FROM barberos WHERE email = ?", [email]);
    if (rows.length > 0) {
      const barbero = rows[0];
      const passwordMatch = await bcrypt.compare(password, barbero.contrasena);
      if (passwordMatch) {
        req.session.user = {
          id: barbero.id_barbero,
          nombre: barbero.nombre,
          role: "barbero",
        };

        req.session.save((err) => {
          if (err) {
            console.error("Error al guardar la sesión:", err);
            return res.status(500).json({ error: "Error al iniciar sesión" });
          }
          console.log("Usuario en sesión configurado:", req.session.user);
          return res.status(200).json({
            message: "Inicio de sesión exitoso",
            role: "barbero",
            barbero,
          });
        });
        return;
      }
    }

    // Verificar en la tabla de administradores
    [rows] = await pool.query("SELECT * FROM administradores WHERE email = ?", [email]);
    if (rows.length > 0) {
      const admin = rows[0];
      const passwordMatch = await bcrypt.compare(password, admin.contrasena);
      if (passwordMatch) {
        req.session.user = {
          id: admin.id_admin,
          nombre: admin.nombre,
          role: "admin",
        };

        req.session.save((err) => {
          if (err) {
            console.error("Error al guardar la sesión:", err);
            return res.status(500).json({ error: "Error al iniciar sesión" });
          }
          console.log("Administrador en sesión configurado:", req.session.user);
          return res.status(200).json({
            message: "Inicio de sesión exitoso",
            role: "admin",
            admin,
          });
        });
        return;
      }
    }

    // Si no se encontró en ninguna tabla
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { login };
