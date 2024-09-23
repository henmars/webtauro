const express = require('express');
const router = express.Router(); // Asegúrate de definir el router aquí
const bcrypt = require('bcrypt');
const connection = require('../modelo/db'); // Importa la conexión a la base de datos

// Ruta para manejar el inicio de sesión
router.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    // Verificación de que `usuario` y `password` están presentes
    if (!usuario || !password) {
        return res.status(400).send('Usuario y contraseña son requeridos');
    }

    // Consulta para obtener la información del usuario y su rol
    const query = `
        SELECT u.id, u.usuario, u.password, ur.id_rol 
        FROM usuarios u 
        LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuario 
        WHERE u.usuario = ?
    `;

    connection.execute(query, [usuario], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length > 0) {
            const user = results[0];  // El usuario encontrado
            const hashedPassword = user.password; // Contraseña encriptada en la base de datos

            // Compara la contraseña enviada con la almacenada
            bcrypt.compare(password, hashedPassword, (err, result) => {
                if (err) {
                    console.error('Error al verificar la contraseña:', err);
                    return res.status(500).send('Error en el servidor');
                }

                if (result) {
                    // Si la contraseña es correcta, almacena el usuario y su rol en la sesión
                    req.session.usuario = user.usuario;
                    req.session.rol = user.id_rol; // Rol del usuario desde la tabla usuarios_roles

                    // Opción 1: Puedes enviar una respuesta en JSON para pruebas
                    // return res.json({ success: true, message: 'Inicio de sesión exitoso', rol: user.id_rol });

                    // Opción 2: Redirige a la página deseada con el parámetro de éxito
                    res.redirect('/?login=success' + user.id);
                } else {
                    return res.status(401).send('Contraseña incorrecta');

                }
            });
        } else {
            // Si el usuario no existe
            return res.status(404).send('El usuario no existe');
        }
    });
});

// Ruta para cambiar la contraseña
router.post('/cambiar-contraseña', (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).send('Usuario y nueva contraseña son requeridos');
    }

    // Hashear la nueva contraseña
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.status(500).send('Error en el servidor');
        }

        // Actualizar la contraseña en la base de datos
        const query = 'UPDATE usuarios SET password = ? WHERE id = ?';
        connection.execute(query, [hashedPassword, userId], (err, results) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err);
                return res.status(500).send('Error en el servidor');
            }

            // Confirmar que se actualizó la contraseña
            if (results.affectedRows > 0) {
                res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
            } else {
                res.status(404).send('Usuario no encontrado');
            }
        });
    });
});


module.exports = router;
