const pool = require("../config/database");
const enviarCorreo = require("../config/mailer"); // Importar la función de envío de correos

const crearReserva = async (req, res) => {
  const { fecha, hora_inicio, id_barbero, id_servicio, observaciones } = req.body;

  try {
    console.log("Datos recibidos en req.body:", req.body);

    let idCliente = null;
    let nombreUsuario = null;
    let correoDestinatarioCliente = null;

// Caso cliente registrado
if (req.session && req.session.user && req.session.user.role === "cliente") {
  idCliente = req.session.user.id; // Obtener ID del cliente de la sesión
  nombreUsuario = req.session.user.nombre; // Nombre del cliente registrado
  
  // Obtener el correo desde req.body (formulario del cliente)
  if (!req.body.email) {
    throw new Error("El correo electrónico no se envió en el cuerpo de la solicitud.");
  }
  correoDestinatarioCliente = req.body.email; // Obtener correo del body
}



    console.log("Datos cliente registrado:", { idCliente, nombreUsuario, correoDestinatarioCliente });

    // Validación para evitar errores con correos undefined
    if (!correoDestinatarioCliente) {
      throw new Error("El correo electrónico del cliente no está definido.");
    }

    // Obtener el nombre y correo del barbero
    const [barberoResult] = await pool.query("SELECT nombre, email FROM barberos WHERE id_barbero = ?", [id_barbero]);
    if (barberoResult.length === 0) return res.status(404).json({ error: "Barbero no encontrado." });
    const nombreBarbero = barberoResult[0].nombre;
    const correoBarbero = barberoResult[0].email;

    // Obtener el nombre del servicio
    const [servicioResult] = await pool.query("SELECT nombre FROM servicios WHERE id_servicio = ?", [id_servicio]);
    if (servicioResult.length === 0) return res.status(404).json({ error: "Servicio no encontrado." });
    const nombreServicio = servicioResult[0].nombre;

    // Insertar la reserva en la tabla
    const [resultReserva] = await pool.query(
      "INSERT INTO reservas (id_cliente, id_barbero, id_servicio, fecha, hora, observaciones, estado_actual) VALUES (?, ?, ?, ?, ?, ?, 'por_realizar')",
      [idCliente, id_barbero, id_servicio, fecha, hora_inicio, observaciones]
    );

    const reservaId = resultReserva.insertId;

    // Marcar el horario como inactivo
    const [resultUpdate] = await pool.query(
      "UPDATE horarios_barbero SET estado = 'inactivo' WHERE id_barbero = ? AND fecha = ? AND hora_inicio = ? AND estado = 'activo'",
      [id_barbero, fecha, hora_inicio]
    );

    // Verificar si se marcó correctamente
    if (resultUpdate.affectedRows === 0) {
      // Si no se pudo actualizar, revertimos la reserva creada
      await pool.query("DELETE FROM reservas WHERE id_reserva = ?", [reservaId]);
      return res.status(400).json({
        error: "El horario seleccionado ya no está disponible. Por favor, elige otro horario.",
      });
    }

    // Generar el código de reserva único
    const codigoReserva = `RSV-${reservaId * 100}`;
    await pool.query("UPDATE reservas SET cod_reserva = ? WHERE id_reserva = ?", [codigoReserva, reservaId]);

    // Formatear fecha al formato DD-MM-YYYY
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES");

    // Correo al Cliente
    const correoClienteHtml = `
      <h1>${nombreUsuario}, tu cita ha sido confirmada</h1>
      <p>Detalles de la reserva:</p>
      <ul>
        <li><strong>Código de reserva:</strong> ${codigoReserva}</li>
        <li><strong>Servicio:</strong> ${nombreServicio}</li>
        <li><strong>Nombre del profesional:</strong> ${nombreBarbero}</li>
        <li><strong>Fecha:</strong> ${fechaFormateada}</li>
        <li><strong>Hora:</strong> ${hora_inicio}</li>
        <li><strong>Observaciones:</strong> ${observaciones || "Ninguna"}</li>
      </ul>
    `;

    // Correo al Barbero
    const correoBarberoHtml = `
      <h1>${nombreBarbero}, tienes una nueva cita</h1>
      <p>Detalles del cliente y la reserva:</p>
      <ul>
        <li><strong>Nombre del cliente:</strong> ${nombreUsuario}</li>
        <li><strong>Servicio:</strong> ${nombreServicio}</li>
        <li><strong>Código de reserva:</strong> ${codigoReserva}</li>
        <li><strong>Fecha:</strong> ${fechaFormateada}</li>
        <li><strong>Hora:</strong> ${hora_inicio}</li>
        <li><strong>Correo del cliente:</strong> ${correoDestinatarioCliente}</li>
        <li><strong>Observaciones:</strong> ${observaciones || "Ninguna"}</li>
      </ul>
    `;

    // Enviar correos en paralelo
    await Promise.all([
      enviarCorreo(correoDestinatarioCliente, "Confirmación de tu reserva", correoClienteHtml),
      enviarCorreo(correoBarbero, "Nueva cita agendada", correoBarberoHtml),
    ]);

    res.status(201).json({
      message: "Reserva creada exitosamente y notificaciones enviadas",
      reservaId,
      codigoReserva,
      datosModal: {
        nombreCliente: nombreUsuario,
        codigoReserva: codigoReserva,
        servicio: nombreServicio,
        nombreBarbero: nombreBarbero,
        fecha: fechaFormateada,
        hora: hora_inicio,
        observaciones: observaciones || "Ninguna",
      }
    });

  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(500).json({ error: "Error en el servidor al crear la reserva" });
  }
};


// Obtener reservas de un barbero específico
const getReservasByBarbero = async (req, res) => {
  const { id } = req.session.user; // Usar el ID del barbero desde la sesión
  try {
    const query = `
      SELECT 
        r.id_reserva, 
        IFNULL(uc.nombre, cnr.nombre_cliente) AS nombre,
        IFNULL(uc.apellido, cnr.apellido) AS apellido,
        IFNULL(uc.email, cnr.email_cliente) AS email,
        s.nombre AS servicio,
        r.fecha,
        r.hora,
        r.estado_actual, -- Estado actual de la reserva
        r.cod_reserva,   -- Código único de la reserva
        r.observaciones,
        r.fecha_creacion
      FROM reservas r
      LEFT JOIN usuarios_clientes uc ON r.id_cliente = uc.id_cliente
      LEFT JOIN clientes_no_registrados cnr ON r.id_cliente_no_registrado = cnr.id_cliente_no_registrado
      LEFT JOIN servicios s ON r.id_servicio = s.id_servicio
      WHERE r.id_barbero = ?;
    `;
    const [reservas] = await pool.query(query, [id]);
    if (reservas.length === 0) {
      return res.status(404).json({ message: "No hay reservas para este barbero." });
    }
    res.status(200).json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas del barbero:", error);
    res.status(500).json({ error: "Error al obtener reservas del barbero." });
  }
};

module.exports = {
  crearReserva,
  getReservasByBarbero,
};