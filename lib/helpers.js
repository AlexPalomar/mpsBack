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


module.exports = helpers;