const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const loginRouter = require('./controladores/login'); // Importa el router de login
const registerRouter = require('./controladores/registro'); // Importa el router de registro
const crudRouter = require('./controladores/crud'); // Importa el router del CRUD
const rasaRouter = require('./controladores/rasa'); // Importa el router para el chatbot de Rasa

const app = express();
const port = 3000;

// Configurar el middleware para manejar sesiones
app.use(session({
    secret: 'tu-secreto-aqui',  // Cambia esta clave secreta por una más segura en producción
    resave: false,              // No guarda la sesión si no hay cambios
    saveUninitialized: true,    // Guarda nuevas sesiones no inicializadas
    cookie: { secure: false }   // `secure: false` asegura que funcione sin HTTPS (en desarrollo)
}));

// Configurar el middleware para manejar datos en el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para verificar si el usuario está autenticado antes de acceder a ciertas rutas
function isAuthenticated(req, res, next) {
    if (req.session.usuario) {
        return next(); // Si el usuario está autenticado, pasa a la siguiente función
    }
    res.redirect('/login'); // Si no está autenticado, redirige a la página de login
}

// Middleware para redirigir si el usuario ya está autenticado y trata de acceder al login o registro
function redirectIfAuthenticated(req, res, next) {
    if (req.session.usuario) {
        return res.redirect('/'); // Si el usuario ya está autenticado, redirige a la página principal
    }
    next(); // Si no está autenticado, permite el acceso a la página de login/registro
}

// Servir archivos estáticos (CSS, JS, imágenes) desde la carpeta `public`
app.use(express.static(path.join(__dirname, 'public')));

// Configuración para usar vistas si se implementa un motor de plantillas
app.set('views', path.join(__dirname, 'views'));

// Rutas principales

// Ruta para la página principal (requiere autenticación)
app.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para la página de login (redirige si ya está autenticado)
app.get('/login', redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Ruta para la página de registro (redirige si ya está autenticado)
app.get('/registro', redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registro.html'));
});

// Ruta para el CRUD (solo accesible por Admin y Dev)
app.get('/crud', isAuthenticated, (req, res) => {
    // Solo los usuarios con rol de Admin (1) o Dev (2) pueden acceder
    if (req.session.rol === 1 || req.session.rol === 2) {
        res.sendFile(path.join(__dirname, 'views', 'crud.html'));
    } else {
        res.status(403).send('Acceso denegado'); // Si no tiene permiso, muestra un error 403
    }
});

// Ruta para obtener información del usuario actual
app.get('/user-info', (req, res) => {
    if (req.session.usuario) {
        res.json({ userId: req.session.userId, usuario: req.session.usuario, rol: req.session.rol }); // Devuelve los datos del usuario
    } else {
        res.json({}); // Si no está autenticado, devuelve un objeto vacío
    }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión'); // Muestra un error si ocurre
        }
        res.redirect('/'); // Redirige al usuario después de cerrar sesión
    });
});

// Rutas adicionales para manejar solicitudes POST
app.use('/controladores', loginRouter); // Ruta para el login
app.use('/controladores', registerRouter); // Ruta para el registro
app.use('/api', crudRouter); // Ruta para las operaciones CRUD
app.use('/api', rasaRouter); // Ruta para el chatbot de Rasa

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
