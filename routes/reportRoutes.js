const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { admin, db } = require('../lib/firebase');
const { isLoggedIn } = require('../lib/auth');
const moment = require('moment');

router.get('/adminReport', isLoggedIn, async (req, res)=> {

  // cuenta todos los registros de usuarios
  const snapshot = await db.collection('user').get();
  const totalUsers = snapshot.size;

  // cuenta todos los registros de usuarios segun el rol
  const adminSnapshot = await db.collection('user')
  .where('role', '==', 'ADMIN')
  .get();
  const adminCount = adminSnapshot.size;

  const driverSnapshot = await db.collection('user')
  .where('role', '==', 'DRIVER')
  .get();
  const driverCount = driverSnapshot.size;

  const tecnicoSnapshot = await db.collection('user')
  .where('role', '==', 'TECNICO')
  .get();
  const tecnicoCount = tecnicoSnapshot.size;

  // cuenta todos los servicios de escalera
  const snapshotServices = await db.collection('escalera').get();
  const totalServices = snapshotServices.size;

  // cuenta servicios filtrados por estado
  const completedSnapshot = await db.collection('escalera')
  .where('status', '==', 'COMPLETADO')
  .get();
  const completedCount = completedSnapshot.size;

  const canceledSnapshot = await db.collection('escalera')
  .where('status', '==', 'CANCELADO')
  .get();
  const canceledCount = canceledSnapshot.size;


  res.render('adminReport', {              
    title: 'Administración de Reportes',
    reportUsers: [adminCount, driverCount, tecnicoCount, totalUsers],
    reportServices: [completedCount, canceledCount, totalServices ],
    // labels: JSON.stringify(labels),
    // data: JSON.stringify(data)
  });
});

router.get('/export-users', isLoggedIn, async (req, res) => {
  try {
    //  Crear un nuevo libro
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');
    
    //  Definir las columnas
    worksheet.columns = [
      { header: 'Cedula', key: 'identification', width: 10 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Correo', key: 'email', width: 30 },
      { header: 'Rol', key: 'role', width: 20 },
      { header: 'Estado', key: 'status', width: 15 }
    ];

    const snapshot = await db.collection('user').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    //  Agregar datos
    worksheet.addRows(users);

    //  Estilos (opcional)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // hace unico cada archivo que se genere con fecha y hora actual
    const nowFormatted = moment().format('DD/MM/YYYY, HH:mm');
    console.log(nowFormatted);

    //  Enviar el archivo al cliente
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="usuarios_'+nowFormatted+'.xlsx"'
    );

    //  Escribir directamente al stream de respuesta
    await workbook.xlsx.write(res);
    res.end();
    // res.status(200);
    // console.log(200);

  } catch (error) {
    console.error('❌ Error generando Excel:', error);
    res.status(500).send('Error al generar el archivo Excel');
  }
});

router.get('/export-services', isLoggedIn, async (req, res) => {
  try {
    // Crear un nuevo libro
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Servicios');
    
    // Definir las columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'startTimeout', width: 30 },
      { header: 'ID servicio', key: 'idService', width: 20 },
      { header: 'Técnico', key: 'tecnico', width: 30 },
      { header: 'Tipo escalera', key: 'ladder', width: 15 },
      { header: 'Conductor', key: 'driver', width: 30 },
      { header: 'Dirección', key: 'addres', width: 30 },
      { header: 'Zona Apoyo', key: 'supportZone', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Evidencia', key: 'evidenceOne', width: 200 },
      { header: 'Ubicación', key: 'location', width: 20 },
      { header: 'Fecha Ejecutado', key: 'finishedAt', width: 20 },
      { header: 'Tiempo Espera', key: 'durationTimeout', width: 15 },
      { header: 'Tiempo Ejecucion', key: 'executeTimeout', width: 15 },
    ];

    const snapshot = await db.collection('escalera').get();
    const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Agregar datos
    worksheet.addRows(services);

    // Estilos (opcional)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // hace unico cada archivo que se genere con fecha y hora actual
    const nowFormatted = moment().format('DD/MM/YYYY, HH:mm');
    console.log(nowFormatted);

    // Enviar el archivo al cliente
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="servicios_'+nowFormatted+'.xlsx"'
    );

    // Escribir directamente al stream de respuesta
    await workbook.xlsx.write(res);
    res.end();
    // res.status(200);
    // console.log(200);

  } catch (error) {
    console.error('❌ Error generando Excel:', error);
    res.status(500).send('Error al generar el archivo Excel');
  }
});


module.exports = router;