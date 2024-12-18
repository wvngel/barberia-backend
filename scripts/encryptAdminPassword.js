const bcrypt = require('bcryptjs');
const pool = require('src/config/database');

const encryptAdminPasswords = async () => {
    try {
        const [administradores] = await pool.query('SELECT id_admin, contrasena FROM administradores');

        for (const administrador of administradores) {
            if (!administrador.contrasena.startsWith('$2a$')) { // Verifica si ya está encriptada
                const hashedPassword = await bcrypt.hash(administrador.contrasena, 10);
                await pool.query('UPDATE administradores SET contrasena = ? WHERE id_admin = ?', [hashedPassword, administrador.id_admin]);
                console.log(`Contraseña del admin con ID ${administrador.id_admin} encriptada.`);
            }
        }
        console.log('Todas las contraseñas de los barberos han sido encriptadas.');
        process.exit();
    } catch (error) {
        console.error('Error al encriptar contraseñas de admin:', error);
        process.exit(1);
    }
};

encryptAdminPasswords();
