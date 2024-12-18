const https = require('https'); // Requiere el módulo HTTPS de Node.js
const fs = require('fs'); // Para leer los archivos de certificados
const app = require('./app'); // Tu aplicación de Express

// Puerto desde .env o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Opciones HTTPS con los certificados generados
const options = {
    key: fs.readFileSync('./localhost+2-key.pem'), // Ruta al archivo de clave privada
    cert: fs.readFileSync('./localhost+2.pem'),   // Ruta al archivo de certificado
};

// Crear el servidor HTTPS
https.createServer(options, app).listen(PORT, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});
