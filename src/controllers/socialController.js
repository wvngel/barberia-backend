const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config(); // Asegúrate de importar dotenv para usar las variables del archivo .env

let tasks = {};

// Programar publicación en Instagram
exports.schedulePost = (req, res) => {
  const { text, image, time } = req.body;

  if (!text || !image || !time) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  const token = process.env.ACCESS_TOKEN; // Obtiene el token del archivo .env
  if (!token) {
    return res.status(500).json({ message: "Token no configurado. Revisa tu archivo .env." });
  }

  // Detiene tareas previas si existen
  if (tasks["scheduledPost"]) tasks["scheduledPost"].stop();

  const [hour, minute] = time.split(":");

  tasks["scheduledPost"] = cron.schedule(`${minute} ${hour} * * *`, async () => {
    try {
      console.log(`🚀 Intentando publicar en Instagram a las ${time}...`);
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v21.0/${process.env.IG_USER_ID}/media`,
        { image_url: image, caption: text, access_token: token }
      );

      const creationId = publishResponse.data.id;

      await axios.post(`https://graph.facebook.com/v21.0/${process.env.IG_USER_ID}/media_publish`, {
        creation_id: creationId,
        access_token: token
      });

      console.log("✅ Publicación realizada con éxito.");
    } catch (error) {
      console.error("❌ Error al realizar la publicación:", error.response?.data || error.message);
    }
  });

  return res.json({ message: `Publicación programada para las ${time}.` });
};

// Webhook de verificación
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parámetros enviados por Meta para verificar el webhook
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente.");
    res.status(200).send(challenge);
  } else {
    console.error("❌ Webhook verificación fallida.");
    res.sendStatus(403);
  }


  
};



// Manejar los eventos de webhook (comentarios, etc.)
exports.handleWebhookEvent = (req, res) => {
    const body = req.body;
  
    console.log("📥 Evento recibido desde el webhook:", JSON.stringify(body, null, 2));
  
    // Verificar si el evento tiene comentarios
    if (body.entry) {
      body.entry.forEach((entry) => {
        if (entry.changes) {
          entry.changes.forEach((change) => {
            if (change.field === "comments" && change.value) {
              const commentText = change.value.message;
              const commenterName = change.value.from.name;
              const commenterId = change.value.from.id;
  
              console.log(
                `💬 Comentario recibido: "${commentText}" de ${commenterName} (ID: ${commenterId})`
              );
  
              // Verificar si el comentario contiene la palabra "descuento"
              if (commentText.toLowerCase().includes("descuento")) {
                const discountCode = "BARBERIA20"; // Simulación de un código de descuento
                console.log(`🎉 Comentario válido, enviando código: ${discountCode}`);
  
                // Simular envío de mensaje
                console.log(
                  `✉️ Mensaje enviado a ${commenterName}: "¡Gracias por tu comentario! Aquí tienes tu código de descuento: ${discountCode}"`
                );
              }
            }
          });
        }
      });
    }
  
    res.status(200).send("EVENT_RECEIVED");
  };
  