import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export function initSocket(server: any): Server {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket: Socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIoInstance(): Server | null {
  return ioInstance;
}

export function broadcastAlert(alert: any) {
  if (ioInstance) {
    ioInstance.emit('alert-triggered', alert);
  }
}

export function broadcastTripUpdate(event: string, trip: any) {
  if (ioInstance) {
    ioInstance.emit(event, trip);
  }
}

export function emitToUser(userId: string, event: string, data: any) {
  if (ioInstance) {
    ioInstance.to(userId).emit(event, data);
  }
}
