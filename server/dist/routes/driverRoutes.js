"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const Driver_1 = __importDefault(require("../models/Driver"));
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
// GET /drivers
router.get('/', async (req, res) => {
    try {
        const list = await (0, db_1.getDrivers)();
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /drivers
router.post('/', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'FleetManager', 'SafetyOfficer']), async (req, res) => {
    const { id, name, licenseNumber, phone, email } = req.body;
    const operator = req.user?.email || 'Admin';
    try {
        const exists = await Driver_1.default.findOne({ driverId: id });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Driver ID already registered.', errorCode: 'DRIVER_EXISTS' });
        }
        const doc = await Driver_1.default.create({
            driverId: id,
            name,
            licenseNumber,
            licenseExpiry: new Date(Date.now() + 365 * 24 * 3600000), // 1 year
            bloodGroup: 'O+',
            phone,
            email,
            salary: 5000,
            experience: 5,
            status: 'available'
        });
        await logAudit(operator, 'Driver Registered', `Created driver profile: ${id}`);
        res.status(201).json({ success: true, message: 'Driver profile created successfully.', data: doc });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// DELETE /drivers/:id
router.delete('/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'FleetManager', 'SafetyOfficer']), async (req, res) => {
    const { id } = req.params;
    const operator = req.user?.email || 'Admin';
    try {
        await Driver_1.default.updateOne({ driverId: id }, { isDeleted: true });
        await logAudit(operator, 'Driver Deleted', `Soft deleted driver: ${id}`);
        res.json({ success: true, message: `Driver profile ${id} deleted.` });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.default = router;
