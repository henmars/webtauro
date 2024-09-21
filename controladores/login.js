const express = require('express');
const router = express.Router(); // Asegúrate de definir el router aquí
const bcrypt = require('bcrypt');
const connection = require('../modelo/db'); // Importa la conexión a la base de datos

// Ruta para manejar el inicio de sesión
router.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    // Asegúrate de que `usuario` y `password` están definidos
    if (!usuario || !password) {
        return res.status(400).send('Usuario y contraseña son requeridos');
    }

    const query = 'SELECT u.id, u.usuario, u.password, ur.id_rol FROM usuarios u LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuario WHERE u.usuario = ?';
    connection.execute(query, [usuario], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length > 0) {
            const user = results[0];
            const hashedPassword = user.password;

            bcrypt.compare(password, hashedPassword, (err, result) => {
                if (err) {
                    console.error('Error al verificar la contraseña:', err);
                    return res.status(500).send('Error en el servidor');
                }

                if (result) {
                    // Almacena el usuario y rol en la sesión
                    req.session.usuario = user.usuario;
                    req.session.rol = user.id_rol; // Almacena el rol del usuario desde la tabla usuarios_roles
                    // Para hacer pruebas, puedes enviar una respuesta JSON en lugar de redirigir
                    //return res.json({ success: true, message: 'Inicio de sesión exitoso', rol: user.id_rol });
                    // Para redireccionar:
                     res.redirect('/?login=success');
                } else {
                    return res.status(401).send('Contraseña incorrecta');
                }
            });
        } else {
            return res.status(404).send('El usuario no existe');
        }
    });
});

module.exports = router;
