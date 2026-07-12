"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Log Audit Action Helper
async function logAudit(user, action, details) {
    try {
        await AuditLog_1.default.create({ action, details, user, timestamp: new Date() });
    }
    catch (err) {
        console.error('Audit log error:', err);
    }
}
// GET /vehicles
router.get('/', async (req, res) => {
    try {
        const list = await (0, db_1.getVehicles)();
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /vehicles
router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'FleetManager']), async (req, res) => {
    const { id, type, plateNumber, odometer } = req.body;
    const operator = req.user?.email || 'Admin';
    try {
        const exists = await Vehicle_1.default.findOne({ vehicleNumber: id });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Vehicle asset number already exists.', errorCode: 'VEHICLE_EXISTS' });
        }
        const doc = await Vehicle_1.default.create({
            vehicleNumber: id,
            vehicleType: type,
            brand: 'Freightliner',
            model: 'Cascadia',
            year: 2023,
            fuelType: 'Diesel',
            capacity: type === 'Sprinter Van' ? 2000 : 25000,
            engineNumber: 'ENG-' + Date.now().toString().slice(-6),
            chassisNumber: 'CHS-' + Date.now().toString().slice(-6),
            insuranceNumber: plateNumber + '-INS',
            insuranceExpiry: new Date(Date.now() + 365 * 24 * 3600000),
            fitnessExpiry: new Date(Date.now() + 365 * 24 * 3600000),
            pollutionExpiry: new Date(Date.now() + 180 * 24 * 3600000),
            purchaseDate: new Date(),
            purchaseCost: 95000,
            odometer: odometer || 0,
            status: 'idle',
            healthScore: 100
        });
        await logAudit(operator, 'Vehicle Created', `Added vehicle asset: ${id}`);
        res.status(201).json({ success: true, message: 'Vehicle created successfully.', data: doc });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// DELETE /vehicles/:id
router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'FleetManager']), async (req, res) => {
    const { id } = req.params;
    const operator = req.user?.email || 'Admin';
    try {
        await Vehicle_1.default.updateOne({ vehicleNumber: id }, { isDeleted: true });
        await logAudit(operator, 'Vehicle Deleted', `Soft deleted vehicle: ${id}`);
        res.json({ success: true, message: `Vehicle ${id} deleted successfully.` });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.default = router;
