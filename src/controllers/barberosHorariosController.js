const pool = require('../config/database');

// Obtener todos los horarios base
const getHorariosBase = async (req, res) => {
  try {
    const [horarios] = await pool.query('SELECT * FROM horarios_base');
    res.json(horarios);
  } catch (error) {
    console.error("Error al obtener los horarios base:", error);
    res.status(500).json({ error: error.message });
  }
};

// Generar la semana con fechas disponibles
const getSemanaDisponible = async (req, res) => {
  try {
    const { fecha_inicio } = req.query;

    if (!fecha_inicio) {
      return res.status(400).json({ error: "Debe proporcionar una fecha de inicio." });
    }

    const inicio = new Date(`${fecha_inicio}T00:00:00Z`);
    const diaSemana = inicio.getUTCDay();

    if (diaSemana !== 1) {
      const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
      inicio.setUTCDate(inicio.getUTCDate() + ajuste);
    }

    const semana = [];
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(inicio);
      fecha.setUTCDate(inicio.getUTCDate() + i);

      semana.push({
        dia: fecha.toLocaleDateString("es-ES", { weekday: "long", timeZone: "UTC" }),
        fecha: fecha.toISOString().split("T")[0],
      });
    }

    res.json(semana);
  } catch (error) {
    console.error("Error en el cálculo de la semana:", error);
    res.status(500).json({ error: error.message });
  }
};

// Asignar horarios a un barbero
const asignarHorario = async (req, res) => {
  try {
    const id_barbero = req.session.user.id; // Obtener ID desde la sesión
    const { fecha, horarios } = req.body;

    if (!horarios || horarios.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un horario.' });
    }

    const idsHorariosBase = horarios.map(({ id_horario_base }) => id_horario_base);
    const [horariosBase] = await pool.query(
      `SELECT id_horario_base, hora_inicio, hora_fin 
       FROM horarios_base 
       WHERE id_horario_base IN (?)`,
      [idsHorariosBase]
    );

    if (!horariosBase || horariosBase.length === 0) {
      return res.status(400).json({ error: 'Los horarios base seleccionados no existen.' });
    }

    const [existentes] = await pool.query(
      `SELECT id_horario_base 
       FROM horarios_barbero 
       WHERE id_barbero = ? AND fecha = ? AND id_horario_base IN (?)`,
      [id_barbero, fecha, idsHorariosBase]
    );

    const existentesIds = existentes.map((horario) => horario.id_horario_base);
    const nuevosHorarios = horariosBase.filter(
      (horario) => !existentesIds.includes(horario.id_horario_base)
    );

    if (nuevosHorarios.length === 0) {
      return res.status(200).json({ message: 'Todos los horarios ya están asignados.' });
    }

    const values = nuevosHorarios.map((horario) => [
      id_barbero,
      fecha,
      horario.id_horario_base,
      horario.hora_inicio,
      horario.hora_fin,
      'activo',
    ]);

    await pool.query(
      `INSERT INTO horarios_barbero (id_barbero, fecha, id_horario_base, hora_inicio, hora_fin, estado) VALUES ?`,
      [values]
    );

    res.status(201).json({
      message: 'Horarios asignados correctamente.',
      asignados: nuevosHorarios,
      ya_existentes: existentesIds,
    });
  } catch (error) {
    console.error("Error al asignar los horarios:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getHorariosBase,
  getSemanaDisponible,
  asignarHorario,
};
