const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

let db;

try {
  // Verificar si ya hay una app inicializada
  if (!admin.apps.length) {

    if (process.env.NODE_ENV === 'test') {

      // 🔥 Modo Emulator (sin credenciales reales)
      admin.initializeApp({
        projectId: 'local-project'
      });

      console.log('🔥 Firebase inicializado en modo TEST');

    } else {

      // 🔒 Producción / desarrollo real
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://notesuper-2ce35-default-rtdb.firebaseio.com",
        projectId: "notesuper-2ce35"
      });

      console.log("Firebase conectado correctamente");
    }
  }


  // Conectar con Firestore
  db = admin.firestore();

  if (process.env.NODE_ENV === 'test') {
    db.settings({
      host: '127.0.0.1:8080',
      ssl: false
    });
    console.log('🔥 Conectado a Firestore Emulator');
  }

} catch (error) {
  console.error("Error al inicializar Firebase:", error);
}

// Exportar admin y db para usarlos en todo el proyecto
module.exports = { admin, db };
