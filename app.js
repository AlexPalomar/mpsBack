const express = require('express');
const http = require('http');
const multer = require('multer');
const { engine } = require('express-handlebars');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const moment = require('moment');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const FirestoreStore = require('./lib/firebaseStore');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
require('./lib/passport');
const SocketServer = require('./socketConnect');


dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 80;

// Inicializar Socket.IO
const socketServer = new SocketServer(server);
socketServer;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configura multer para archivos temporales
const upload = multer({ dest: 'uploads/' });

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Handlebars como motor de plantillas
app.engine('.hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main', // layout general, no la vista específica
  helpers: {
    eq: (a, b) => a === b,
     // 🔹 Helper para formatear fechas
    formatDate: (timestamp) => {
      if (!timestamp) return '';
      let date;
      // Si es un objeto de Firestore Timestamp
      if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } 
      // Si ya es un Date o string
      else {
        date = new Date(timestamp);
      }

      return moment(date).format('DD/MM/YYYY, HH:mm');
    },
    json: context => JSON.stringify(context)
  },
  layoutsDir: path.join(app.get('views'), 'layouts'), 
  partialsDir: path.join(app.get('views'), 'partials'), 
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// middlewares
// Configuración del almacenamiento de sesión en Firebase
app.use(session({
  store: new FirestoreStore({ collection: 'sessions' }),
  secret: 'firebaseSessionSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

// Inicializar Passport
app.use(morgan('dev'));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Globlas Variables
app.use((req, res, next) => {
  res.locals.user = req.user || null; // esto hace que {{user}} esté disponible en TODAS las vistas
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message');
  next();
});

// Routes
app.use(require('./routes/authentication'));
app.use('/api', require('./routes/messagingFCM'));
app.use(require('./routes/indexRoutes'));
app.use(require('./routes/servicesRoutes'));
app.use(require('./routes/usersRoutes'));
app.use(require('./routes/reportRoutes'));


// // Ruta para subir imagen
app.post('/uploads', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'evidencias', // carpeta en cloudinary
      upload_preset: 'MpsService',
      use_filename: true,
      unique_filename: true,
      resource_type: 'image',
    });

    // Elimina el archivo local temporal
    fs.unlinkSync(filePath);

    // const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10; // expira en 10 minutos
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // expira en 30 dias

    const signedUrl = cloudinary.url(result.public_id, {
      version: result.version,
      resource_type: 'image',
      sign_url: true,
      // secure: true,
      expires_at: expiresAt
    });
    console.log(req.file); // Informacion del archivo subido
    return res.json({
      success: true,
      url: signedUrl,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error('Error al subir a Cloudinary:', err);
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.use((req, res, next) => {
  res.status(404);

  // Si usas Handlebars:
  res.render('404', { title: 'Página no encontrada' });
});

server.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://0.0.0.0:${port}`);
});

