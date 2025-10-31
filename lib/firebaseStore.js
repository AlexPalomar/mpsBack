const session = require('express-session');
const { db } = require('./firebase');

class FirestoreStore extends session.Store {
  constructor(options = {}) {
    super();
    this.collection = db.collection(options.collection || 'sessions');
  }

  
  // Obtener sesión
  async get(sid, callback) {
    try {
      const doc = await this.collection.doc(sid).get();
      if (!doc.exists) return callback(null, null);
      callback(null, doc.data());
    } catch (err) {
      callback(err);
    }
  }

  // Guardar sesión
  async set(sid, sessionData, callback) {

    try {
      // Convertimos a JSON plano
      const plainSession = JSON.parse(JSON.stringify(sessionData));
      await this.collection.doc(sid).set(plainSession, { merge: true });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  // Eliminar sesión
  async destroy(sid, callback) {
    try {
      await this.collection.doc(sid).delete();
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = FirestoreStore;
