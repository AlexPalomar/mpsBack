const { Server } = require('socket.io');
const { db } = require('./lib/firebase');

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = [
            'http://192.168.80.32:80',
            'http://192.168.80.32'
          ];
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
      try {
        const { socketToken } = socket.handshake.auth;
        if (!socketToken) {
          return next(new Error('Token requerido'));
        }
        
        const doc = await db.collection('socketTokens').doc(socketToken).get();
        if (!doc.exists) {
          return next(new Error('Token no existe'));
        }

        if (doc.data().expiresAt.toDate() < new Date()) {
          await db.collection('socketTokens').doc(socketToken).delete();
          return next(new Error('Token expirado'));
        }

        socket.userId = doc.data().userId;
        socket.role = doc.data().role;

        next();
      } catch (e) {
        console.log('Error en middleware:', e.toString());
        next(new Error('Error interno de autenticación'));
      }
    });
  }

  start() {
    this.io.on('connection', (socket) => {
      console.log(`🟢 Cliente conectado: ${socket.id} (User: ${socket.userId}, Role: ${socket.role})`);

      socket.on('join', (data) => {
        const userId = socket.userId || data?.userId;
        const role = socket.role || data?.role;

        if (role === 'ADMIN') {
          socket.join('ADMIN'); // Sala general de admins si la necesitas
          console.log(`👤 Admin conectado → ${userId}`);
        } else if (role === 'DRIVER') {
          // Cada driver se une a su propia sala única basada en su ID
          socket.join(`driver_${userId}`);
          console.log(`👤 Driver conectado y en sala: driver_${userId}`);
        }

        console.log('Rooms actualizadas:', [...socket.rooms]);
      });

      // 👀 ADMIN elige qué driver ver (Se une a la sala específica de ese driver)
      socket.on('watch-driver', ({ driverId }) => {
        if (socket.role !== 'ADMIN') return;

        const roomName = `driver_${driverId}`;
        socket.join(roomName);
        console.log(`👀 Admin ${socket.userId} comenzó a ver al driver: ${driverId} (Unido a ${roomName})`);
      });

      // 🚫 ADMIN deja de ver al driver (Sale de la sala de ese driver)
      socket.on('unwatch-driver', ({ driverId }) => {
        if (socket.role !== 'ADMIN') return;

        const roomName = `driver_${driverId}`;
        socket.leave(roomName);
        console.log(`🚫 Admin ${socket.userId} dejó de ver al driver: ${driverId} (Salió de ${roomName})`);
      });

      // 📍 DRIVER envía ubicación → Se emite ÚNICAMENTE a los que están viendo a este driver
      socket.on('send-location', (location) => {
        if (socket.role !== 'DRIVER') {
          console.log(`❌ Usuario ${socket.userId} con rol ${socket.role} intentó enviar ubicación.`);
          return;
        }

        const payload = {
          driverId: socket.userId,
          location,
          timestamp: Date.now(),
        };

        const roomName = `driver_${socket.userId}`;
        
        // Emitir a todos los miembros de la sala (incluyendo administradores conectados)
        this.io.to(roomName).emit('location-update', payload);
        console.log(`📍 Ubicación enviada a la sala ${roomName} con datos:`, payload);
      });

      socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado:', socket.userId);
      });
    });
  }

  emit(event, data, room = null) {
    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }
}

module.exports = SocketServer;