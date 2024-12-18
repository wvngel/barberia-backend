const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

const encryptBarberoPasswords = async () => {
    try {
        const [barberos] = await pool.query('SELECT id_barbero, contrasena FROM barberos');

        for (const barbero of barberos) {
            if (!barbero.contrasena.startsWith('$2a$')) { // Verifica si ya está encriptada
                const hashedPassword = await bcrypt.hash(barbero.contrasena, 10);
                await pool.query('UPDATE barberos SET contrasena = ? WHERE id_barbero = ?', [hashedPassword, barbero.id_barbero]);
                console.log(`Contraseña del barbero con ID ${barbero.id_barbero} encriptada.`);
            }
        }
        console.log('Todas las contraseñas de los barberos han sido encriptadas.');
        process.exit();
    } catch (error) {
        console.error('Error al encriptar contraseñas de barberos:', error);
        process.exit(1);
    }
};

encryptBarberoPasswords();
