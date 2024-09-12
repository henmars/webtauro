const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../modelo/db'); // Importa la conexión a la base de datos

// Ruta para manejar el registro de nuevos usuarios
router.post('/registro', (req, res) => {
    const { usuario, correo, password, confirm_password } = req.body;

    if (!usuario || !correo || !password || !confirm_password) {
        return res.status(400).send('Faltan campos requeridos');
    }

    if (password !== confirm_password) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    // Verifica si el usuario ya existe
    const queryCheckUser = 'SELECT * FROM usuarios WHERE usuario = ?';
    connection.execute(queryCheckUser, [usuario], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length > 0) {
            // El usuario ya existe
            return res.status(400).send('El usuario ya existe');
        } else {
            // Encripta la contraseña antes de guardarla
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error al encriptar la contraseña:', err);
                    return res.status(500).send('Error en el servidor');
                }

                // Inserta el nuevo usuario en la base de datos
                const queryInsertUser = 'INSERT INTO usuarios (usuario, correo, password) VALUES (?, ?, ?)';
                connection.execute(queryInsertUser, [usuario, correo, hashedPassword], (err, results) => {
                    if (err) {
                        console.error('Error al insertar el usuario:', err);
                        return res.status(500).send('Error en el servidor');
                    }

                    // Redirige a la página de inicio de sesión con un mensaje de éxito
                    res.redirect('/login?register=success');
                });
            });
        }
    });
});

module.exports = router;
