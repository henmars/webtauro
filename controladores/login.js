const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../modelo/db'); // Importa la conexión a la base de datos

// Ruta para manejar el inicio de sesión
router.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE usuario = ?';
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
                    req.session.usuario = user.usuario;
                    res.redirect('/?login=success');
                } else {
                    res.status(401).send('Contraseña incorrecta');
                }
            });
        } else {
            res.status(404).send('El usuario no existe');
        }
    });
});


module.exports = router;
