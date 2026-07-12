import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb } from './db';
import { startSimulation, setIoInstance, setSimulationSpeed, manualInjectIncident } from './simulation/engine';
import apiRouter from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setIoInstance(io);

// Middleware to inject Socket.IO instance into requests
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

// Mount the modular REST API Router
app.use('/api', apiRouter);

// WebSocket connection events
io.on('connection', (socket) => {
  console.log(`Web browser client connected: ${socket.id}`);
  
  socket.on('set-speed', (speed: number) => {
    setSimulationSpeed(speed);
  });

  socket.on('inject-incident', async (data: { tripId: string, category: string }) => {
    await manualInjectIncident(data.tripId, data.category);
  });
});

// Boot Mongoose and start Express HTTP servers
connectDb().then(() => {
  server.listen(port, () => {
    console.log(`TransitOps+ Express Server listening on port ${port}`);
    startSimulation();
  });
});
