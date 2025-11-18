const bcrypt = require('bcryptjs');
const moment = require('moment');

const helpers = {};

// This method to encript password 
helpers.encryptPassword = async (password) => {
   const salt = await bcrypt.genSalt(10);
   const hash = await bcrypt.hash(password, salt);
   return hash;
   
};

helpers.matchPassword = async (password, savedPassword) => {
    try{
       return await bcrypt.compare(password, savedPassword);
    }catch (e){
        console.log(`Error compare password: ${e}`);
    }
};

helpers.formatedDate = async (timestamp) => {
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
}

helpers.formatTimestamp = (ts) =>{
  try {
    if (!ts) return 'N/A';

    // Si ya viene como Date
    if (ts instanceof Date) {
      return moment(ts).format('DD/MM/YYYY HH:mm:ss');
    }

    // Si viene como Timestamp de Firestore
    if (ts._seconds !== undefined) {
      const date = new Date(ts._seconds * 1000);
      return moment(date).format('DD/MM/YYYY HH:mm:ss');
    }

    // Si viene como string ISO
    if (typeof ts === 'string') {
      return moment(ts).format('DD/MM/YYYY HH:mm:ss');
    }

    return 'N/A';
  } catch (e) {
    return 'N/A';
  }
}


module.exports = helpers;