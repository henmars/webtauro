const express = require('express');
const axios = require('axios'); // Asegúrate de instalar axios con `npm install axios`
const router = express.Router();

// Endpoint para manejar mensajes de chat
router.post('/rasa', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
            sender: 'user', // Puedes usar un identificador único para cada usuario
            message: message
        });

        // Responde al cliente con la respuesta del chatbot
        const botResponses = response.data;
        res.json({ response: botResponses[0]?.text || 'No se recibió respuesta del bot.' });
    } catch (error) {
        console.error('Error al comunicarse con la API de Rasa:', error);
        res.status(500).json({ response: 'Hubo un error al procesar tu mensaje.' });
    }
});

module.exports = router;
