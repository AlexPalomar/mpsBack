const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { admin, db } = require('../lib/firebase');
const { isLoggedIn } = require('../lib/auth');
const moment = require('moment');
const helpers = require('../lib/helpers');
const path = require('path');

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

router.get('/adminReportData', isLoggedIn, async (req, res)=> {

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

  const snapshotCausaCierre = await db.collection('cierreCiclo').get();

  const counter = [
    'ESTETICA DE CABLEADO',
    'CONFIGURACIÓN DE EQUIPOS',
    'ENTREGA DE SERVICIO',
    'PRESENTACIÓN PERSONAL',  
    'PUNTUALIDAD Y ASISTENCIA',
    'SERVICIOS OK, SIN NOVEDAD',
    'INDICACION MANEJO DE EQUIPOS',
    'AMABILIDAD Y RESPETO',
    'PRUEBAS DE SERVICIO'
  ];

  const labels = [];
  const values = [];
  const causasMap = {}; // { causa: cantidad }

  snapshotCausaCierre.forEach(doc => {
    const causa = doc.data().causaCierreCiclo;

    if (!causa) return; // ignora undefined, null o vacío

    // Contar
    causasMap[causa] = (causasMap[causa] || 0) + 1;
  });

  // Separar en arrays (ideal para Chart.js)
  Object.keys(causasMap).forEach(causa => {
    labels.push(causa);
    values.push(causasMap[causa]);
  });

  console.log('Labels:', labels);
  console.log('Values:', values);

  // console.log(causas);
  res.json( {
    reportUsers: [adminCount, driverCount, tecnicoCount, totalUsers],
    reportServices: [completedCount, canceledCount, totalServices ],
    reportTipificaciones: {
      labels: Object.values(labels),
      data: Object.values(values)
    }
  });
});

router.get('/export-users', isLoggedIn, async (req, res) => {
  try {
    //  Crear un nuevo libro
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');
    
    //  Definir las columnas
    worksheet.columns = [
      { header: 'Fecha Creación', key: 'createdAt', width: 10 },
      { header: 'Ultima Modificación', key: 'modifiedAt', width: 10 },
      { header: 'Cedula', key: 'identification', width: 10 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Correo', key: 'email', width: 30 },
      { header: 'Rol', key: 'role', width: 20 },
      { header: 'Estado', key: 'status', width: 15 }
    ];

    const snapshot = await db.collection('user').get();
    // const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: helpers.formatedDateToMoment(data.createdAt),
        modifiedAt: helpers.formatedDateToMoment(data.modifiedAt)
      };
    });

    //  Agregar datos
    worksheet.addRows(users);

    //  Estilos (opcional)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // hace unico cada archivo que se genere con fecha y hora actual
    const nowFormatted = moment().format('DD/MM/YYYY, HH:mm');

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
    // const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const services = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startTimeout: helpers.formatedDateToMoment(data.startTimeout),
        finishedAt: helpers.formatedDateToMoment(data.finishedAt),
      };
    });

    // Agregar datos
    worksheet.addRows(services);

    // Estilos (opcional)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // hace unico cada archivo que se genere con fecha y hora actual
    const nowFormatted = moment().format('DD/MM/YYYY, HH:mm');

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
    console.error('Error generando Excel:', error);
    res.status(500).send('Error al generar el archivo Excel');
  }
});


router.get('/report/admin', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reportDinamic.html'));
});

// Endpoint para usuarios
router.get('/api/pivot/users', async (req, res) => {
  try {
    const snapshot = await db.collection('user').get();
    const rows = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        Nombre: d.name,
        Correo: d.email,
        Rol: d.role,
        Estado: d.status,
        // FechaCreacion: d.createdAt ? d.createdAt.toDate().toISOString().split('T')[0] : null
        FechaCreacion: d.createdAt ? d.createdAt.toDate().toISOString().split('T')[0] : null
      };
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generando pivot users');
  }
});

// Endpoint para servicios
router.get('/api/pivot/services', async (req, res) => {
  try {
    const snapshot = await db.collection('escalera').get();
    const rows = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        IDServicio: d.idService || '',
        Tecnico: d.tecnico || '',
        Conductor: d.driver || '',
        TipoEscalera: d.ladder || '',
        Estado: d.status || '',
        FechaInicio: d.startTimeout ? d.startTimeout.split('T')[0] : null,
        FechaFin: d.finishedAt ? d.finishedAt.split('T')[0] : null
      };
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generando pivot services');
  }
});

// Endpoint para cierre de ciclo
router.get('/api/pivot/cciclo', async (req, res) => {
  try {
    const snapshot = await db.collection('cierreCiclo').get();
    const rows = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        IDCCiclo: d.idCCiclo || '',
        Cliente: d.cliente || '',
        Orden: d.order || '',
        Telefono: d.phoneNumber || '',
        Direccion: d.addres || '',
        Tecnico: d.tecnico || '',
        Supervisor: d.superviser || '',
        Observacion: d.observation || '',
        presentacionYComportamiento:  d.presentacionComportamiento,
        esteticaYFuncionamiento: d.esteticaFuncionamiento,
        EntregadeServicio: d.recomendacionServicio,
        promedioNps: d.promedioNps,
        causaCierre: d.causaCierreCiclo,
        estadoGestionCC: d.estadoGestionCC,
        FechaCreacion: d.createdAt ? d.createdAt : null,
        FechaModificacion: d.modifiedAt ? d.modifiedAt : null,
        Estado: d.status || ''
      };
    });
    // console.log(rows);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generando pivot services');
  }
});


module.exports = router;