const pool = require('../config/database');

// Obtener horarios únicos disponibles en un día específico
const getHorariosUnicosPorDia = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: "Debe proporcionar una fecha válida." });
    }

    const query = `
      SELECT DISTINCT hora_inicio, hora_fin
      FROM horarios_barbero
      WHERE fecha = ? AND estado = 'activo'
      ORDER BY hora_inicio;
    `;

    const [result] = await pool.query(query, [fecha]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No hay horarios disponibles para este día." });
    }

    res.json(result);
  } catch (error) {
    console.error("Error al obtener horarios únicos:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Obtener barberos disponibles en una fecha y horario específico
const getBarberosPorDiaYHorario = async (req, res) => {
  try {
    const { fecha, hora_inicio } = req.query;

    if (!fecha || !hora_inicio) {
      return res.status(400).json({ error: "Se requieren 'fecha' y 'hora_inicio' como parámetros." });
    }

    const query = `
      SELECT 
        b.id_barbero,
        b.nombre
      FROM horarios_barbero hb
      INNER JOIN barberos b ON hb.id_barbero = b.id_barbero
      WHERE hb.fecha = ? AND hb.hora_inicio = ? AND hb.estado = 'activo';
    `;

    const [result] = await pool.query(query, [fecha, hora_inicio]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No hay barberos disponibles para este horario." });
    }

    res.json(result);
  } catch (error) {
    console.error("Error al obtener barberos por horario:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = {
  getHorariosUnicosPorDia,
  getBarberosPorDiaYHorario,
};
