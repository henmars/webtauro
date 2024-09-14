const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../modelo/db'); // Importa la conexión a la base de datos

// Obtener todos los usuarios
router.get('/usuarios', (req, res) => {
    const query = 'SELECT * FROM usuarios';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error obteniendo los usuarios:', error);
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results);
        }
    });
});

// Crear un nuevo usuario con contraseña cifrada
router.post('/usuarios', async (req, res) => {
    const { usuario, correo, password } = req.body;

    try {
        if (!usuario || !correo || !password) {
            return res.status(400).send('Todos los campos son requeridos');
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO usuarios (usuario, correo, password) VALUES (?, ?, ?)';
        connection.query(query, [usuario, correo, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error creando usuario:', error);
                res.status(500).send('Error en el servidor');
            } else {
                res.status(201).send('Usuario creado exitosamente');
            }
        });
    } catch (error) {
        console.error('Error cifrando la contraseña:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Actualizar un usuario con contraseña opcional
router.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario, correo, password } = req.body;

    const updates = [];
    const params = [];

    if (usuario) {
        updates.push('usuario = ?');
        params.push(usuario);
    }

    if (correo) {
        updates.push('correo = ?');
        params.push(correo);
    }

    if (password) {
        try {
            // Cifrar la nueva contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            params.push(hashedPassword);
        } catch (error) {
            console.error('Error cifrando la nueva contraseña:', error);
            return res.status(500).send('Error en el servidor');
        }
    }

    if (updates.length === 0) {
        return res.status(400).send('No se proporcionaron datos para actualizar');
    }

    // Agregar la condición para el ID
    params.push(id);

    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`;

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error('Error actualizando usuario:', error);
            res.status(500).send('Error en el servidor');
        } else {
            res.send('Usuario actualizado exitosamente');
        }
    });
});

// Eliminar un usuario
router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM usuarios WHERE id = ?';
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error eliminando usuario:', error);
            res.status(500).send('Error en el servidor');
        } else {
            res.send('Usuario eliminado exitosamente');
        }
    });
});

// Obtener el número total de usuarios
router.get('/usuarios/count', (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM usuarios';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error obteniendo el número de usuarios:', error);
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results[0]); // Enviar solo el total
        }
    });
});


module.exports = router;
