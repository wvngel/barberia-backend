const bcrypt = require("bcryptjs");
const pool = require("../config/database");

// Obtener todos los clientes
const getAllClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query("SELECT * FROM usuarios_clientes");
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un cliente por ID
const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const [cliente] = await pool.query("SELECT * FROM usuarios_clientes WHERE id_cliente = ?", [id]);
    if (cliente.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo cliente
const createCliente = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, contrasena, rut } = req.body;

    // Verificar si el correo o el RUT ya existen
    const [existingCliente] = await pool.query(
      "SELECT * FROM usuarios_clientes WHERE email = ? OR rut = ?",
      [email, rut]
    );
    if (existingCliente.length > 0) {
      return res.status(400).json({ error: "El correo o el RUT ya están registrados." });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      "INSERT INTO usuarios_clientes (nombre, apellido, email, telefono, contrasena, rut) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, apellido, email, telefono, hashedPassword, rut]
    );

    res.status(201).json({ message: "Cliente creado exitosamente", id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar datos de un cliente
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, email } = req.body;

    // Actualizar los datos permitidos
    await pool.query(
      "UPDATE usuarios_clientes SET nombre = ?, apellido = ?, telefono = ?, email = ? WHERE id_cliente = ?",
      [nombre, apellido, telefono, email, id]
    );

    res.json({ message: "Datos del cliente actualizados exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un cliente
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM usuarios_clientes WHERE id_cliente = ?", [id]);
    res.json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar datos del cliente
const updateClienteProfile = async (req, res) => {
  try {
    const { id } = req.params; // Utilizamos `req.params` para mantener consistencia con la lógica de barberos
    const { nombre, apellido, rut, email, telefono, passwordConfirm } = req.body;

    // Verificar contraseña actual
    const [cliente] = await pool.query("SELECT contrasena FROM usuarios_clientes WHERE id_cliente = ?", [id]);
    if (cliente.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(passwordConfirm, cliente[0].contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Actualizar datos permitidos
    const updates = [];
    if (nombre) updates.push({ column: "nombre", value: nombre });
    if (apellido) updates.push({ column: "apellido", value: apellido });
    if (rut) updates.push({ column: "rut", value: rut });
    if (email) updates.push({ column: "email", value: email });
    if (telefono) updates.push({ column: "telefono", value: telefono });

    for (const update of updates) {
      await pool.query(`UPDATE usuarios_clientes SET ${update.column} = ? WHERE id_cliente = ?`, [update.value, id]);
    }

    res.json({ message: "Perfil actualizado exitosamente." });
  } catch (error) {
    console.error("Error al actualizar el perfil del cliente:", error);
    res.status(500).json({ error: "Error en el servidor al actualizar el perfil." });
  }
};

const cambiarContrasenaCliente = async (req, res) => {
  const { contrasenaActual, nuevaContrasena, repetirContrasena } = req.body;
  const { id } = req.session.user; // ID del cliente desde la sesión

  try {
    // Verificar la contraseña actual
    const [cliente] = await pool.query("SELECT contrasena FROM usuarios_clientes WHERE id_cliente = ?", [id]);
    if (cliente.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    const contrasenaValida = await bcrypt.compare(contrasenaActual, cliente[0].contrasena);
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
    await pool.query("UPDATE usuarios_clientes SET contrasena = ? WHERE id_cliente = ?", [hashedPassword, id]);

    res.status(200).json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    console.error("Error al cambiar la contraseña del cliente:", error);
    res.status(500).json({ error: "Error en el servidor al cambiar la contraseña." });
  }
};

module.exports = {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  updateClienteProfile,
  cambiarContrasenaCliente,
};
