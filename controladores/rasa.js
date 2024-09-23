const express = require('express');
const axios = require('axios'); // Asegúrate de instalar axios con `npm install axios`
const bcrypt = require('bcrypt'); // Asegúrate de instalar bcrypt con `npm install bcrypt`
const connection = require('../modelo/db'); // Ajusta la ruta según tu estructura de archivos
const router = express.Router();

// Endpoint para manejar mensajes de chat
router.post('/rasa', async (req, res) => {
    const { message, userId } = req.body; // Asegúrate de enviar el userId desde el cliente

    try {
        const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
            sender: userId, // Usamos el ID del usuario como identificador
            message: message
        });

        // Guarda la conversación en la base de datos
        const botResponses = response.data;
        const respuestaChatbot = botResponses[0]?.text || 'No se recibió respuesta del bot.';

        // Guardar la conversación
        const query = 'INSERT INTO conversaciones_chatbot (id_usuario, mensaje_usuario, respuesta_chatbot) VALUES (?, ?, ?)';
        connection.query(query, [userId, message, respuestaChatbot], (error) => {
            if (error) {
                console.error('Error al guardar la conversación:', error);
            }
        });

        res.json({ response: respuestaChatbot });
    } catch (error) {
        console.error('Error al comunicarse con la API de Rasa:', error);
        res.status(500).json({ response: 'Hubo un error al procesar tu mensaje.' });
    }
});

module.exports = router;
