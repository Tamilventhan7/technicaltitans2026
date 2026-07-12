"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const engine_1 = require("./simulation/engine");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
(0, engine_1.setIoInstance)(io);
// Middleware to inject Socket.IO instance into requests
app.use((req, res, next) => {
    req.io = io;
    next();
});
// Mount the modular REST API Router
app.use('/api', routes_1.default);
// WebSocket connection events
io.on('connection', (socket) => {
    console.log(`Web browser client connected: ${socket.id}`);
    socket.on('set-speed', (speed) => {
        (0, engine_1.setSimulationSpeed)(speed);
    });
    socket.on('inject-incident', async (data) => {
        await (0, engine_1.manualInjectIncident)(data.tripId, data.category);
    });
});
// Boot Mongoose and start Express HTTP servers
(0, db_1.connectDb)().then(() => {
    server.listen(port, () => {
        console.log(`TransitOps+ Express Server listening on port ${port}`);
        (0, engine_1.startSimulation)();
    });
});
