const bcrypt = require("bcryptjs");
const pool = require("../config/database");

// Obtener todos los barberos
const getAllBarberos = async (req, res) => {
  try {
    const [barberos] = await pool.query("SELECT * FROM barberos");
    res.json(barberos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un barbero por ID
const getBarberoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [barbero] = await pool.query("SELECT * FROM barberos WHERE id_barbero = ?", [id]);
    if (barbero.length === 0) {
      return res.status(404).json({ error: "Barbero no encontrado" });
    }
    res.json(barbero[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo barbero
const createBarbero = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, especialidad, contrasena, rut } = req.body;

    // Verificar si el correo o el RUT ya existen
    const [existingBarbero] = await pool.query(
      "SELECT * FROM barberos WHERE email = ? OR rut = ?",
      [email, rut]
    );
    if (existingBarbero.length > 0) {
      return res.status(400).json({ error: "El correo o el RUT ya están registrados." });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      "INSERT INTO barberos (nombre, apellido, email, telefono, especialidad, contrasena, rut) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido, email, telefono, especialidad, hashedPassword, rut]
    );

    res.status(201).json({ message: "Barbero creado exitosamente", id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar el perfil del barbero
const updateBarberoProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, especialidad, passwordConfirm } = req.body;

    // Verificar contraseña actual
    const [barbero] = await pool.query("SELECT contrasena FROM barberos WHERE id_barbero = ?", [id]);
    if (barbero.length === 0) {
      return res.status(404).json({ error: "Barbero no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(passwordConfirm, barbero[0].contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Actualizar datos permitidos
    const updates = [];
    if (nombre) updates.push({ column: "nombre", value: nombre });
    if (apellido) updates.push({ column: "apellido", value: apellido });
    if (telefono) updates.push({ column: "telefono", value: telefono });
    if (especialidad) updates.push({ column: "especialidad", value: especialidad });

    for (const update of updates) {
      await pool.query(`UPDATE barberos SET ${update.column} = ? WHERE id_barbero = ?`, [update.value, id]);
    }

    res.json({ message: "Perfil actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el perfil." });
  }
};

// Verificar sesión del barbero
const checkSessionBarbero = async (req, res) => {
  if (req.session && req.session.user && req.session.user.role === "barbero") {
    return res.status(200).json({ session: req.session.user });
  }
  res.status(401).json({ error: "No hay sesión activa para el barbero" });
};

// Eliminar un barbero
const deleteBarbero = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM barberos WHERE id_barbero = ?", [id]);
    res.json({ message: "Barbero eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const cambiarContrasenaBarbero = async (req, res) => {
  const { contrasenaActual, nuevaContrasena, repetirContrasena } = req.body;
  const { id } = req.session.user; // ID del barbero desde la sesión

  try {
    // Verificar la contraseña actual
    const [barbero] = await pool.query("SELECT contrasena FROM barberos WHERE id_barbero = ?", [id]);
    if (barbero.length === 0) {
      return res.status(404).json({ error: "Barbero no encontrado." });
    }

    const contrasenaValida = await bcrypt.compare(contrasenaActual, barbero[0].contrasena);
    if (!contrasenaValida) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta." });
    }

    // Validar la nueva contraseña
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
    if (!regex.test(nuevaContrasena)) {
      return res.status(400).json({ 
        error: "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial, sin espacios."
      });
    }

    if (nuevaContrasena !== repetirContrasena) {
      return res.status(400).json({ error: "Las contraseñas no coinciden." });
    }

    // Actualizar la contraseña en la base de datos
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    await pool.query("UPDATE barberos SET contrasena = ? WHERE id_barbero = ?", [hashedPassword, id]);

    res.status(200).json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    console.error("Error al cambiar la contraseña del barbero:", error);
    res.status(500).json({ error: "Error en el servidor al cambiar la contraseña." });
  }
};
module.exports = {
  getAllBarberos,
  getBarberoById,
  createBarbero,
  updateBarberoProfile,
  deleteBarbero,
  checkSessionBarbero,
  cambiarContrasenaBarbero,
};
