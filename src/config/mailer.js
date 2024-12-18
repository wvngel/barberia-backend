require('dotenv').config(); // Cargar variables de entorno desde .env
const nodemailer = require('nodemailer');

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Servicio de correo: Gmail
  auth: {
    user: process.env.MAIL_USER, // Correo electrónico desde el archivo .env
    pass: process.env.MAIL_PASS, // Contraseña de aplicación desde el archivo .env
  },
});

/**
 * Función para enviar un correo electrónico.
 * @param {string} destinatario - Correo electrónico del destinatario.
 * @param {string} asunto - Asunto del correo.
 * @param {string} cuerpoHtml - Contenido del correo en formato HTML.
 * @returns {Promise<void>}
 */
const enviarCorreo = async (destinatario, asunto, cuerpoHtml) => {
  const mailOptions = {
    from: `"Barbería Sector-19" <${process.env.MAIL_USER}>`, // Nombre visible + correo del remitente
    to: destinatario, // Correo electrónico del destinatario (dinámico)
    subject: asunto, // Asunto del correo
    html: cuerpoHtml, // Contenido del correo en formato HTML
  };

  try {
    await transporter.sendMail(mailOptions); // Enviar correo
    console.log(`Correo enviado correctamente a: ${destinatario}`);
  } catch (error) {
    console.error(`Error al enviar el correo a ${destinatario}:`, error);
    throw new Error('No se pudo enviar el correo.');
  }
};

module.exports = enviarCorreo;
