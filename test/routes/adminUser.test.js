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
const { db } = require('../../lib/firebase');
const { clearUsersCollection } = require('../helpers');

describe('POST /create_User', () => {

  beforeEach(async () => {
    await clearUsersCollection();
  });

  test('Debe crear usuario correctamente', async () => {
    // Arrange
    const userData = {
      identification: 123456,
      name: 'Juan',
      role: 'admin',
      email: 'juan@test.com',
      password: '123456',
      confirmPassword: '123456'
    };

    // Act
    const response = await request(app)
      .post('/create_User')
      .send(userData);

    // Assert HTTP
    expect(response.statusCode).toBe(200);

    // Assert DB
    const snapshot = await db.collection('user')
      .where('email', '==', 'juan@test.com')
      .get();

    expect(snapshot.empty).toBe(false);

    const savedUser = snapshot.docs[0].data();

    expect(savedUser.name).toBe('JUAN');
    expect(savedUser.role).toBe('ADMIN');
    expect(savedUser.email).toBe('juan@test.com');
    expect(savedUser.status).toBe('ACTIVO');
    expect(savedUser.password).not.toBe('123456');
  });

});
