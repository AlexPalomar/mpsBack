const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

let db;

try {
  // Verificar si ya hay una app inicializada
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://notesuper-2ce35-default-rtdb.firebaseio.com"
    });

    console.log("Firebase conectado correctamente");
  } else {
    console.log("Firebase ya estaba inicializado");
  }

  // Conectar con Firestore
  db = admin.firestore();

} catch (error) {
  console.error("Error al inicializar Firebase:", error);
}

// Exportar admin y db para usarlos en todo el proyecto
module.exports = { admin, db };
