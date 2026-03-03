const { db } = require('../lib/firebase');

async function clearUsersCollection() {
  const snapshot = await db.collection('user').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

module.exports = { clearUsersCollection };