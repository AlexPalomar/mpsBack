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
            // 'https://web-w1dz87nli1ku.up-de-fra1-k8s-1.apps.run-on-seenode.com',
            'http://192.168.1.7:80'
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

      try{
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
      }catch(e){console.log(e.toString())}
    });
  }

  // start() {
  //   this.io.on('connection', (socket) => {
  //     console.log('🟢 Cliente conectado:', socket.id);

  //     socket.on('join', ({ userId, role }) => {
  //       socket.userId = userId;
  //       socket.role = role;

  //       socket.join(role); // ADMIN o DRIVER

  //       // if (role === 'DRIVER') {
  //       //   socket.join(`DRIVER:${userId}`);
  //       // }

  //       console.log(`👤 ${role} conectado → ${userId}`);
  //       console.log('Rooms:', [...socket.rooms]);
  //     });

  //     // 👀 ADMIN elige qué driver ver
  //     socket.on('watch-driver', (driverId) => {
  //       if (socket.role !== 'ADMIN') return;

  //       socket.join(`DRIVER:${driverId}`);
  //       console.log(`👀 Admin viendo driver ${driverId}`);
  //     });

  //     socket.on('unwatch-driver', (driverId) => {
  //       if (socket.role !== 'ADMIN') return;

  //       socket.leave(`DRIVER:${driverId}`);
  //       console.log(`🚫 Admin dejó de ver driver ${driverId}`);
  //     });

  //     // 📍 DRIVER envía ubicación
  //     socket.on('send-location', (location) => {
  //       if (socket.role !== 'DRIVER') return;

  //       const payload = {
  //         driverId: socket.userId,
  //         location,
  //         timestamp: Date.now(),
  //       };

  //       // 🔥 SOLO admins suscritos a este driver
  //       // socket
  //       //   .to(`DRIVER:${socket.userId}`)
  //       //   .emit('location-update', payload);
  //       socket
  //         // .to(`DRIVER:${socket.userId}`)
  //         .to(`ADMIN`)
  //         .emit('location-update', payload);
  //     });

  //     socket.on('disconnect', () => {
  //       console.log('🔴 Cliente desconectado:', socket.userId);
  //     });
  //   });
  // }

  start() {
  this.io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado:', socket.id);

    socket.on('join', ({ userId, role }) => {
      socket.userId = userId;
      socket.role = role;

      // socket.join(role); // ADMIN o DRIVER
      socket.join('ADMIN'); // ADMIN o DRIVER

      console.log(`👤 ${role} conectado → ${userId}`);
      console.log('Rooms:', [...socket.rooms]);
    });

    // 📍 DRIVER envía ubicación → TODOS los ADMIN
    socket.on('send-location', (location) => {
      if (socket.role !== 'DRIVER') return;

      const payload = {
        driverId: socket.userId,
        location,
        timestamp: Date.now(),
      };

      // 🔥 TODOS los admins lo reciben
      socket.to('ADMIN').emit('location-update', payload);
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
