const express = require('express');
const bcrypt = require('bcrypt');
const connection = require('../modelo/db'); // Asegúrate que tienes la conexión a la base de datos
const router = express.Router();

// Obtener todos los usuarios con su rol
router.get('/usuarios', (req, res) => {
    const query = `
        SELECT u.id, u.usuario, u.correo, r.nombre_rol
        FROM usuarios u
        LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuario
        LEFT JOIN roles r ON ur.id_rol = r.id
    `;
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error obteniendo los usuarios:', error);
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results);
        }
    });
});

// Obtener todos los roles
router.get('/roles', (req, res) => {
    const query = 'SELECT * FROM roles';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error obteniendo roles:', error);
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results);
        }
    });
});

// Crear un nuevo usuario con rol
router.post('/usuarios', async (req, res) => {
    const { usuario, correo, password, rol } = req.body;

    if (!usuario || !correo || !password || !rol) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    try {
        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        const queryUsuario = 'INSERT INTO usuarios (usuario, correo, password) VALUES (?, ?, ?)';
        connection.query(queryUsuario, [usuario, correo, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error creando usuario:', error);
                return res.status(500).send('Error en el servidor');
            }

            const userId = results.insertId;
            const queryRol = 'INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES (?, ?)';
            connection.query(queryRol, [userId, rol], (error) => {
                if (error) {
                    console.error('Error asignando rol:', error);
                    return res.status(500).send('Error en el servidor');
                }
                res.status(201).send('Usuario y rol creados exitosamente');
            });
        });
    } catch (error) {
        console.error('Error procesando la solicitud:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Actualizar un usuario y su rol
router.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario, correo, password, rol } = req.body;

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
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            params.push(hashedPassword);
        } catch (error) {
            console.error('Error cifrando la nueva contraseña:', error);
            return res.status(500).send('Error en el servidor');
        }
    }

    if (updates.length > 0) {
        const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`;
        params.push(id);

        connection.query(query, params, (error) => {
            if (error) {
                console.error('Error actualizando usuario:', error);
                return res.status(500).send('Error en el servidor');
            }
        });
    }

    // Actualizar rol del usuario
    const queryRol = 'UPDATE usuarios_roles SET id_rol = ? WHERE id_usuario = ?';
    connection.query(queryRol, [rol, id], (error) => {
        if (error) {
            console.error('Error actualizando rol:', error);
            return res.status(500).send('Error en el servidor');
        }
        res.send('Usuario y rol actualizados exitosamente');
    });
});

// Eliminar un usuario y su rol
router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const queryUsuario = 'DELETE FROM usuarios WHERE id = ?';
    const queryRol = 'DELETE FROM usuarios_roles WHERE id_usuario = ?';

    connection.query(queryRol, [id], (error) => {
        if (error) {
            console.error('Error eliminando rol del usuario:', error);
            return res.status(500).send('Error en el servidor');
        }

        connection.query(queryUsuario, [id], (error) => {
            if (error) {
                console.error('Error eliminando usuario:', error);
                return res.status(500).send('Error en el servidor');
            }
            res.send('Usuario y rol eliminados exitosamente');
        });
    });
});

// Crear un nuevo rol
router.post('/roles', (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).send('El nombre del rol es requerido');
    }

    const query = 'INSERT INTO roles (nombre_rol) VALUES (?)';
    connection.query(query, [nombre], (error) => {
        if (error) {
            console.error('Error creando rol:', error);
            return res.status(500).send('Error en el servidor');
        }
        res.status(201).send('Rol creado exitosamente');
    });
});

// Eliminar un rol
router.delete('/roles/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM roles WHERE id = ?';
    connection.query(query, [id], (error) => {
        if (error) {
            console.error('Error eliminando rol:', error);
            return res.status(500).send('Error en el servidor');
        }
        res.send('Rol eliminado exitosamente');
    });
});

// Actualizar un rol
/*router.put('/roles/:id', (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).send('El nombre del rol es requerido');
    }

    const query = 'UPDATE roles SET nombre_rol = ? WHERE id = ?';
    connection.query(query, [nombre, id], (error) => {
        if (error) {
            console.error('Error actualizando rol:', error);
            return res.status(500).send('Error en el servidor');
        }
        res.send('Rol actualizado exitosamente');
    });
});
*/


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
