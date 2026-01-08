const bcrypt = require('bcryptjs');
const moment = require('moment');
const crypto = require('crypto');

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

helpers.generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
}


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

helpers.formatedDateToMoment = (timestamp) => {
  if (!timestamp) return '';

  try {
    let date;

    // Si viene como Timestamp de Firestore (._seconds y ._nanoseconds)
    if (timestamp._seconds !== undefined) {
      date = new Date(
        timestamp._seconds * 1000 +
        timestamp._nanoseconds / 1e6
      );
    }

    // Si es un Firestore Timestamp real (SDK)
    else if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    }

    // Si ya es una fecha JS
    else if (timestamp instanceof Date) {
      date = timestamp;
    }

    // Si es un string
    else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    }

    return moment(date).format('DD/MM/YYYY HH:mm');

  } catch (e) {
    console.error("Error formateando fecha:", e);
    return '';
  }
};



module.exports = helpers;