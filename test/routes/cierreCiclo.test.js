// 🔹 1. Mockear auth y passport ANTES de importar app
jest.mock('../../lib/auth', () => ({
  isLoggedIn: (req, res, next) => next(),
  isNotLoggedIn: (req, res, next) => next(),
  isNotLoggedInApi: (req, res, next) => next()
}));

jest.mock('passport', () => ({
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
  initialize: () => (req, res, next) => next(),
  session: () => (req, res, next) => next(),
  authenticate: () => (req, res, next) => next()
}));

// 🔹 2. Ahora sí importar app y firebase
const request = require('supertest');
const app = require('../../app');
const { db, admin } = require('../../lib/firebase');
const helpers = require('../../lib/helpers'); // para generateCodeCC
const { clearUsersCollection } = require('../helpers');
// const { cierreCiclo } = require('../fixture');
const { cierreCicloService } = require('../../container');


describe('CierreCicloService', () => {
  test('getCierreCiclo integration → retorna json', async () => {

    // beforeEach(async () => {
    //   await clearUsersCollection();
    // });

    // Arrange
    // Datos fake para test
    const cierreCiclo = {
      cliente: 'Juan Pérez',
      orden: 'ORD12345',
      telefono: '+573001234567',
      direccion: 'Calle Falsa 123',
      tecnico: 'Carlos López',
      superviser: 'Ana Gómez',
      observaciones: 'Todo funcionó correctamente',
      fechaCreacion: '2026-02-13 10:00',
      estado: 'finalizado',
      calificacionPyC: 8,
      calificacionEyF: 9,
      calificacionRS: 7,
      estadoGestionCierreCiclo: 'Completado',
      user: 'adminTest'
    };

    const promedioNps = 9.5;

    const newCC = {
      idCCiclo: helpers.generateCodeCC(),
      cliente: cierreCiclo.cliente.toUpperCase(),
      order: cierreCiclo.orden,
      phoneNumber: cierreCiclo.telefono,
      address: cierreCiclo.direccion.toUpperCase(),
      tecnico: cierreCiclo.tecnico.toUpperCase(),
      superviser: cierreCiclo.superviser.toUpperCase(),
      observation: cierreCiclo.observaciones.toUpperCase(),
      createdAt: cierreCiclo.fechaCreacion.toUpperCase(),
      modifiedAt: admin.firestore.Timestamp.now(),
      status: cierreCiclo.estado.toUpperCase(),
      presentacionComportamiento: cierreCiclo.calificacionPyC,
      esteticaFuncionamiento: cierreCiclo.calificacionEyF,
      recomendacionServicio: cierreCiclo.calificacionRS,
      promedioNps: promedioNps,
      estadoGestionCC: cierreCiclo.estadoGestionCierreCiclo,
      causaCierreCiclo: 'N/A',
      createdBy: cierreCiclo.user.toUpperCase(),
      modifiedBy: 'N/A',
      notesClousure: 'N/A',
      evidence: 'N/A'
    };
    
    // Act
    const snapshot = await db.collection('cierreCiclo').add(newCC);
    const response = await request(app)
      .get('/cierreCiclo');

    // Assert HTTP
    expect(response.statusCode).toBe(200);
    
    // Asert DB
    // console.log(snapshot.id);
    expect(snapshot.id).toEqual(expect.any(String));
    const result = await cierreCicloService.getCierreCiclo();

    // const result = await cierreCicloService.getCierreCiclo();
    // expect(result).toBeInstanceOf(Object);
    expect(result).toEqual(expect.any(Object));
  });
});

// describe('CierreCicloService', () => {
//   test('getCierreCiclo integración → retorna json', async () => {


//     const result = await cierreCicloService.getCierreCiclo();

//     expect(result).toEqual(expect.any(Object));
//   });
// });

// describe('Users API', () => {
//   test('GET /users → retorna array', async () => {
//     const res = await request(app).get('/adminUsers');
    
//     // expect(res.statusCode).toBe(200);
//     expect(res.statusCode).toBe(302);
//     // expect(Array.isArray(res.body)).toBe(true);
//     expect(res.headers['content-type']).toContain('text/plain; charset=utf-8');
//   });
// });

// describe('Report API', () => {
//   test('GET /report → retorna json', async () => {
//     const res = await request(app).get('/adminReportData');
//     console.log(res.body);
//     // expect(res.statusCode).toBe(200);
//     expect(res.statusCode).toBe(302);
//     expect(res.body).toBe(true);
//   });
// });
