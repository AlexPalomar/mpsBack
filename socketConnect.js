// socketServer.js
const { Server } = require('socket.io');
const { db } = require('./lib/firebase');

class SocketServer {
  /**
   * @param {http.Server} server - El servidor HTTP de Express
   */
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = [
            'https://web-w1dz87nli1ku.up-de-fra1-k8s-1.apps.run-on-seenode.com',
            // 'http://192.168.1.7:80'
          ];

          // Flutter / Postman (no envían origin)
          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error('CORS socket no permitido'));
        },
        methods: ['GET', 'POST'],
      },
      transports: ['websocket'],
    });

    this.registerMiddlewares();
    this.start();
  }

  // 🔐 Middleware de autenticación
  registerMiddlewares() {

    this.io.use(async (socket, next) => {
      const { socketToken } = socket.handshake.auth;
      console.log('Handshake auth:', socket.handshake.auth);
      if (!socketToken) {
        console.log('Token requerido');
        return next(new Error('Token requerido'));
      }
      const doc = await db.collection('socketTokens').doc(socketToken).get();

      if (!doc.exists) {
        return next(new Error('Token no existe'));
      }

      if (doc.data().expiresAt.toDate() < new Date()) {
        // borrar token expirado
        await db.collection('socketTokens').doc(socketToken).delete();
        return next(new Error('Token expirado'));
      }

      socket.userId = doc.data().userId;
      socket.role = doc.data().role;

      next();
    });
  }

  start() {
    this.io.on('connection', (socket) => {
      console.log('🟢 Cliente conectado:', socket.id);

      // Cliente se registra (admin o driver)
      socket.on('join', ({ userId, role }) => {
        socket.userId = userId;
        socket.role = role;

        // Crear un room por rol
        socket.join(role);

        console.log(`👤 ${role} conectado → ${userId}`);
      });

      // Recibir ubicación del DRIVER
      socket.on('send-location', (data) => {
        
        // console.log(data);
        // Reenviar la ubicación a los admins
        socket.to('ADMIN').emit('location-update', data);

        // Opcional: almacenar en memoria / cache / DB
        // console.log('Ubicación recibida:', data);
      });

      socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado:', socket.userId);
      });
    });
  }

  /**
   * Emitir evento a todos los clientes o a un room específico
   * @param {string} event 
   * @param {any} data 
   * @param {string} [room] - Opcional
   */
  emit(event, data, room = null) {
    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }
}

module.exports = SocketServer;
