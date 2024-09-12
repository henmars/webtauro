const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const loginRouter = require('./controladores/login');
const registerRouter = require('./controladores/registro');
const rasaRouter = require('./controladores/rasa'); // Importa el nuevo router

const app = express();
const port = 3000;

// Configurar el middleware para sesiones
app.use(session({
    secret: 'tu-secreto-aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configurar el middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta `public`
app.use(express.static(path.join(__dirname, 'public')));

// Configuración para vistas si estás usando un motor de plantillas
app.set('views', path.join(__dirname, 'views'));

// Rutas para servir HTML directamente
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registro.html'));
});

// Rutas adicionales
app.get('/user-info', (req, res) => {
    if (req.session.usuario) {
        res.json({ usuario: req.session.usuario });
    } else {
        res.json({});
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/');
    });
});

// Usar las rutas para manejar solicitudes POST
app.use('/controladores', loginRouter);
app.use('/controladores', registerRouter);
app.use('/api', rasaRouter); // Usa el nuevo router

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
