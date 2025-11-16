const express = require('express');
const router = express.Router();
const { admin, db } = require('../lib/firebase');

router.post('/api/send-notification', async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    // console.log('userID: ', userId);
    // Obtener token FCM del usuario
    const userDoc = await db.collection('user').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado'});
    }

    const fcmToken = userDoc.data().fcmToken;
    if (!fcmToken) {
      return res.status(400).json({ message: 'Usuario no tiene token FCM'});
    }

    // Crear mensaje
    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };

    // Enviar mensaje
    const response = await admin.messaging().send(message);
    return res.status(200).json({ message: 'Notificación enviada', response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al enviar notificación', error });
  }
});

module.exports = router;
