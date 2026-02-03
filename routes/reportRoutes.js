const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { admin, db } = require('../lib/firebase');
const { isLoggedIn } = require('../lib/auth');
const moment = require('moment');
const helpers = require('../lib/helpers');
const path = require('path');

router.get('/report/admin', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reportDinamic.html'));
});

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
  const snapshotUsers = await db
    .collection('user')
    .where('role', 'in', ['ADMIN', 'TECNICO', 'DRIVER'])
    .get();

  const users = snapshotUsers.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const adminCount = users.filter(u => u.role === 'ADMIN');
  const tecnicoCount = users.filter(u => u.role === 'TECNICO');
  const driverCount = users.filter(u => u.role === 'DRIVER');
  
  // cuenta todos los servicios de escalera
  const snapshotAllServices = await db.collection('escalera').get();
  const totalServices = snapshotAllServices.size;

  const snapshotServices = await db
    .collection('escalera')
    .where('status', 'in', ['COMPLETADO', 'CANCELADO'])
    .get();

  const services = snapshotServices.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // cuenta servicios filtrados por estado
  const completedCount = services.filter(s => s.status === 'COMPLETADO');
  const canceledCount = services.filter(s => s.status === 'CANCELADO');

  const snapshotCierreCiclo = await db.collection('cierreCiclo').get();
  const cierreCicicloCount = snapshotCierreCiclo.size;
  
  const labels = [];
  const values = [];
  const causasMap = {}; // { causa: cantidad }

  snapshotCierreCiclo.forEach(doc => {
    const causa = doc.data().causaCierreCiclo;

    if (!causa) return; // ignora undefined, null o vacío
    // Contar
    causasMap[causa] = (causasMap[causa] || 0) + 1;
  });

  
  Object.keys(causasMap).forEach(causa => {
    labels.push(causa);
    values.push(causasMap[causa]);
  });
  values.push(cierreCicicloCount);
  

  // BLOQUE NUEVO: NPS

  let promotores = 0;
  let neutros = 0;
  let detractores = 0;

  const causasDetractores = {};

  snapshotCierreCiclo.forEach(doc => {
    const d = doc.data();
    const nps = d.promedioNps;

    if (typeof nps !== 'number') return;

    if (nps >= 9) {
      promotores++;
    } else if (nps >= 7) {
      neutros++;
    } else {
      detractores++;

      // contar causas SOLO detractores
      const causa = d.causaCierreCiclo || 'SIN DEFINIR';
      causasDetractores[causa] = (causasDetractores[causa] || 0) + 1;
    }
  });

  const totalEncuestas = promotores + neutros + detractores;

  const npsScore = totalEncuestas > 0
    ? Math.round(((promotores / totalEncuestas) * 100) -
                ((detractores / totalEncuestas) * 100))
    : 0;

  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split('T')[0];

    let fromDate = new Date(primerDiaMes);
    let toDate = hoy.toISOString().split('T')[0];
    const npsFiltrado = await tipificacionNps(snapshotCierreCiclo ,'');

  // preparar data para gráficas
  const npsResumen = {
    promotores,
    neutros,
    detractores,
    totalEncuestas,
    npsScore
  };

  const npsCausasDetractores = {
    labels: Object.keys(causasDetractores),
    data: Object.values(causasDetractores)
  };

    res.json({
    // Data existente
    reportUsers: [
      Object.keys(adminCount).length,
      Object.keys(driverCount).length,
      Object.keys(tecnicoCount).length,
      totalUsers
    ],

    reportServices: [
      Object.keys(completedCount).length,
      Object.keys(canceledCount).length,
      totalServices
    ],

    reportTipificaciones: {
      labels: labels,
      data: Object.values(values)
    },

    npsFiltrado,

    // BLOQUE NPS (NUEVO)
    npsResumen: {
      promotores: npsResumen.promotores,
      neutros: npsResumen.neutros,
      detractores: npsResumen.detractores,
      totalEncuestas: npsResumen.totalEncuestas,
      npsScore: npsResumen.npsScore
    },

    npsCausasDetractores: {
      labels: npsCausasDetractores.labels,
      data: npsCausasDetractores.data
    }
  });

});

function clasificarNps(valor) {
  if (valor >= 9) return 'PROMOTOR';
  if (valor >= 7) return 'NEUTRO';
  return 'DETRACTOR';
}

async function tipificacionNps(snapshotCierreCiclo, from, to, nps){
  // FILTRO NPS + FECHA

  let fromDate = from ? new Date(from) : null;
  let toDate = to ? new Date(to) : null;
  
  // incluir todo el día final
  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }

  const npsFiltrado = [];
  snapshotCierreCiclo.forEach(doc => {
    const d = doc.data();

    if (typeof d.promedioNps !== 'number') return;
    if (!d.createdAt) return;

    const fecha = d.createdAt.toDate
      ? d.createdAt.toDate()
      : new Date(d.createdAt);

    // filtro por fecha
    if (fromDate && fecha < fromDate) return;
    if (toDate && fecha > toDate) return;

    const tipoNps = clasificarNps(d.promedioNps);
    // filtro por tipo NPS
    if (nps && tipoNps !== nps) return;

    npsFiltrado.push({
      idCCiclo: d.idCCiclo || '',
      cliente: d.cliente || '',
      orden: d.order || '',
      telefono: d.phoneNumber || '',
      direccion: d.address || '',
      tecnico: d.tecnico || '',
      supervisor: d.superviser || '',
      observacion: d.observation || '',
      promedioNps: d.promedioNps,
      clasificacionNps: tipoNps,
      causaCierre: d.causaCierreCiclo || '',
      estado: d.estadoGestionCC || '',
      fecha: fecha
    });
  });
  return  npsFiltrado;
}

async function contarNpsPorFecha(snapshotCierreCiclo, from, to) {
  let fromDate = from ? new Date(from) : null;
  let toDate = to ? new Date(to) : null;

  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }

  let promotores = 0;
  let neutros = 0;
  let detractores = 0;

  snapshotCierreCiclo.forEach(doc => {
    const d = doc.data();

    if (typeof d.promedioNps !== 'number') return;
    if (!d.createdAt) return;

    const fecha = d.createdAt.toDate
      ? d.createdAt.toDate()
      : new Date(d.createdAt);

    // filtro por fecha
    if (fromDate && fecha < fromDate) return;
    if (toDate && fecha > toDate) return;

    const tipo = clasificarNps(d.promedioNps);

    if (tipo === 'PROMOTOR') promotores++;
    else if (tipo === 'NEUTRO') neutros++;
    else detractores++;
  });

  const totalEncuestas = promotores + neutros + detractores;

  const npsScore = totalEncuestas > 0
    ? Math.round(
        (promotores / totalEncuestas) * 100 -
        (detractores / totalEncuestas) * 100
      )
    : 0;

  return {
    promotores,
    neutros,
    detractores,
    totalEncuestas,
    npsScore
  };
}


router.get('/tipificacionNpsFilter', isLoggedIn, async (req, res) => {

  // FILTRO NPS + FECHA (AISLADO)
  const { from, to, nps } = req.query;
  const snapshotCierreCiclo = await db.collection('cierreCiclo').get();
  const npsFiltrado = await tipificacionNps(snapshotCierreCiclo,from, to, nps);
  var totalEnc = snapshotCierreCiclo.size;
  res.json({
    npsFiltrado,
    totalEnc
  });
});

router.get('/conteoNpsFilter', isLoggedIn, async (req, res) => {

  // FILTRO CONTEO NPS + FECHA (AISLADO)
  const { from, to, nps } = req.query;
  const snapshotCierreCiclo = await db.collection('cierreCiclo').get();
  const conteoNpsFiltrado = await contarNpsPorFecha(snapshotCierreCiclo, from, to);
  
  res.json({
    conteoNpsFiltrado
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
    console.error('Error generando Excel:', error);
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