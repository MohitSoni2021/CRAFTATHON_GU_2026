import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust origins in production (e.g., process.env.FRONTEND_URL)
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    connectionStateRecovery: {
      // Enable reconnection and offline buffering
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (!user) return;

    // Join room based on user role and id
    // Patient joins 'patient:{id}'
    // Caregiver joins 'caregiver:{id}'
    const roleId = `${user.role}:${user.id}`;
    socket.join(roleId);
    socket.join(`user:${user.id}`); // Added for generic user events as per instructions
    console.log(`📡 Socket connected & joined room: ${roleId} and user:${user.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected (${roleId}): ${reason}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    console.error('Socket.io NOT initialized!');
  }
  return io;
}

/**
 * Emit an event to a specific user (by role and id)
 */
export function emitToUser(role: 'patient' | 'caregiver', id: string, event: string, data: any) {
  if (io) {
    io.to(`${role}:${id}`).emit(event, data);
  }
}

/**
 * Emit to all caregivers linked to a patient
 */
export async function emitToCaregivers(patientId: string, event: string, data: any) {
  if (!io) return;
  
  // We need to import CaregiverLink dynamically here or use a dependency injection approach
  // to avoid circular dependencies if we use this in many places.
  try {
    const CaregiverLink = (await import('../modules/caregiver/caregiver-link.model')).default;
    const links = await CaregiverLink.find({ patientId, status: 'ACCEPTED' });
    
    links.forEach(link => {
      if (link.caregiverId) {
        io.to(`caregiver:${link.caregiverId.toString()}`).emit(event, {
          patientId,
          ...data
        });
      }
    });
  } catch (error) {
    console.error('Error emitting to caregivers:', error);
  }
}
