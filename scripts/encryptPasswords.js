const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

const encryptPasswords = async () => {
    try {
        const [users] = await pool.query('SELECT id_cliente, contrasena FROM usuarios_clientes');

        for (const user of users) {
            if (!user.contrasena.startsWith('$2a$')) { // Verifica si ya está encriptada
                const hashedPassword = await bcrypt.hash(user.contrasena, 10);
                await pool.query('UPDATE usuarios_clientes SET contrasena = ? WHERE id_cliente = ?', [hashedPassword, user.id_cliente]);
                console.log(`Contraseña del usuario con ID ${user.id_cliente} encriptada.`);
            }
        }
        console.log('Todas las contraseñas han sido encriptadas.');
        process.exit();
    } catch (error) {
        console.error('Error al encriptar contraseñas:', error);
        process.exit(1);
    }
};

encryptPasswords();

