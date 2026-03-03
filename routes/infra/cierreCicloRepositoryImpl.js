const { admin, db } = require('../../lib/firebase');
// const helpers = require('../../lib/helpers');
const ICierreCicloRepository = require('../domain/iCierreCicloRepository');


class CierreCicloRepositoryImpl extends ICierreCicloRepository {
  async getCierreCiclo() {
    const snapshotCierreCiclo = await db.collection('cierreCiclo').get();
    const cierreCiclo = snapshotCierreCiclo.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cierreCiclo;

  }

  async getByIdiccCierreCiclo(idIcc) {
    const snapshotCierreCiclo = await db.collection('cierreCiclo').where('idCCiclo', '==', idIcc).get();
    const cierreCiclo = snapshotCierreCiclo.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cierreCiclo;

  }

  async findByOrder(orden){
    const snapshot = await db.collection('cierreCiclo')
    .where('order', '==', orden)
    .limit(1)
    .get();
    const cierreCiclo = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cierreCiclo;
  }

  async getFilterCierreCiclo(filter, search) {
    const snapshot = await db.collection('cierreCiclo').get();
    let cierreCiclo;

    switch(filter){
      case 'tecnico':
        cierreCiclo = snapshot.docs
          .map(doc => doc.data())
          .filter(u => u.tecnico.toUpperCase().includes(search.toUpperCase()));
      break;
      case 'superviser':
        cierreCiclo = snapshot.docs
          .map(doc => doc.data())
          .filter(u => u.superviser.toUpperCase().includes(search.toUpperCase()));
      break;
      case 'status':
        cierreCiclo = snapshot.docs
          .map(doc => doc.data())
          .filter(u => u.status.toUpperCase().includes(search.toUpperCase()));
      break;
    }
    return cierreCiclo;
  }

  async createCierreCiclo(cierreCiclo) {

    cierreCiclo.modifiedAt = admin.firestore.Timestamp.now();

    const response = await db
      .collection('cierreCiclo')
      .add(cierreCiclo);

    return response.id;
  }

  async updateCierreCiclo(cierreCiclo){
    
    cierreCiclo['modifiedAt'] = admin.firestore.Timestamp.now();
    await db.collection('cierreCiclo').doc(docId).update(updateCC);
    return {updated: true};
  }

  async createMasiveCierreCiclo(dataToSave) {

    if (!dataToSave.length) return 0;

    const batch = db.batch();
    const collectionRef = db.collection('cierreCiclo');

    dataToSave.forEach(item => {
      const ref = collectionRef.doc();
      batch.set(ref, item);
    });

    await batch.commit();

    return dataToSave.length;
  }

  async getOrdersExistentes() {
    const snapshot = await db.collection('cierreCiclo')
      .select('order')
      .get();

    return snapshot.docs.map(doc => doc.data().order);
  }

  async getCausaCierreCiclo(){

    const snapshotCausaCierreCiclo = await db.collection('causaCierreCiclo').get();
    const causa = snapshotCausaCierreCiclo.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return causa;
  }

  async getRolesCierreCiclo(){

    const snapshotUsers = await db
      .collection('user')
      .where('role', 'in', ['ADMIN', 'TECNICO'])
      .get();

    const users = snapshotUsers.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    const supervisor = users.filter(u => u.role === 'ADMIN');
    const tecnicos = users.filter(u => u.role === 'TECNICO');

    return [supervisor, tecnicos];
  }

  async deleteCierreCiclo(orden) {
    const snapshot = await db
    .collection('cierreCiclo')
    .where('orden', '==', orden )
    .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return {message: 'OT eliminada.'};
  }

}

module.exports = CierreCicloRepositoryImpl;
