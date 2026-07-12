import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { connectDb } from './db';
import { initSocket } from './sockets/socket.handler';
import { startSimulation } from './simulation/engine';
import { initCronJobs } from './jobs';
import { xssSanitizer } from './middleware/xss';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes';
import { swaggerUi, swaggerSpec } from './docs/swagger';

const app = express();
const port = process.env.PORT || 3001;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP locally to make Swagger UI load scripts easily
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization against XSS attacks
app.use(xssSanitizer);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount REST Router
app.use('/api', apiRouter);

// Centralized error handling
app.use(errorHandler);

const server = http.createServer(app);

// Connect to Socket.IO Handlers
const io = initSocket(server);

// Boot database connection and start loops
connectDb().then(() => {
  server.listen(port, () => {
    console.log(`TransitOps Express Server running on port ${port}`);
    console.log(`Swagger Interactive documentation available at http://localhost:${port}/api-docs`);
    
    // Start background cron scheduler
    initCronJobs();
    
    // Start Digital Twin Simulation Ticks
    startSimulation();
  });
}).catch(err => {
  console.error('Failed to bootstrap TransitOps+ Server:', err);
});
