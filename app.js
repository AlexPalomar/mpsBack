const express = require('express');
const multer = require('multer');
const { engine } = require('express-handlebars');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const { admin, db } = require('./lib/firebase');
const FirestoreStore = require('./lib/firebaseStore');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
require('./lib/passport');


dotenv.config();

const app = express();
const port = process.env.PORT || 80;

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
    eq: (a, b) => a === b
  },
  layoutsDir: path.join(app.get('views'), 'layouts'), 
  partialsDir: path.join(app.get('views'), 'partials'), 
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Configuración del almacenamiento de sesión en Firebase
app.use(session({
  store: new FirestoreStore({ collection: 'sessions' }),
  secret: 'firebaseSessionSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

// Inicializar Passport
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(require('./routes/indexRoutes'));
app.use(require('./routes/authentication'));


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

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://0.0.0.0:${port}`);
});

