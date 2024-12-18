const pool = require('../config/database');

// Obtener todos los servicios disponibles
const getAllServicios = async (req, res) => {
  try {
    const [servicios] = await pool.query(`
      SELECT s.id_servicio, s.nombre, s.descripcion, s.precio, s.duracion_minutos, s.fecha_creacion, c.nombre AS categoria
      FROM servicios s
      JOIN categorias c ON s.id_categoria = c.id_categoria
    `);
    res.json(servicios);
  } catch (error) {
    console.error("Error al obtener los servicios:", error);
    res.status(500).json({ error: "Hubo un error al obtener los servicios disponibles" });
  }
};

// Obtener servicios filtrados por categoría
const getServiciosByCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;

    const [servicios] = await pool.query(`
      SELECT s.id_servicio, s.nombre, s.descripcion, s.precio, s.duracion_minutos, s.fecha_creacion
      FROM servicios s
      WHERE s.id_categoria = ?
    `, [id_categoria]);

    if (servicios.length === 0) {
      return res.status(404).json({ error: "No se encontraron servicios para esta categoría" });
    }

    res.json(servicios);
  } catch (error) {
    console.error("Error al filtrar servicios:", error);
    res.status(500).json({ error: "Hubo un error al filtrar los servicios por categoría" });
  }
};

module.exports = {
  getAllServicios,
  getServiciosByCategoria,
};
