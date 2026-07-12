"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const vehicleRoutes_1 = __importDefault(require("./vehicleRoutes"));
const driverRoutes_1 = __importDefault(require("./driverRoutes"));
const tripRoutes_1 = __importDefault(require("./tripRoutes"));
const expenseRoutes_1 = __importDefault(require("./expenseRoutes"));
const systemRoutes_1 = __importDefault(require("./systemRoutes"));
const aiRoutes_1 = __importDefault(require("./aiRoutes"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Mount Sub-routers
router.use('/auth', authRoutes_1.default);
router.use('/vehicles', vehicleRoutes_1.default);
router.use('/drivers', driverRoutes_1.default);
router.use('/trips', tripRoutes_1.default);
router.use('/expenses', expenseRoutes_1.default);
router.use('/system', systemRoutes_1.default);
router.use('/ai', aiRoutes_1.default);
// Shared route for warehouses
router.get('/warehouses', async (req, res) => {
    try {
        const list = await (0, db_1.getWarehouses)();
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
