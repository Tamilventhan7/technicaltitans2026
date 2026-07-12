"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Log Audit Action Helper
async function logAudit(user, action, details) {
    try {
        await (0, db_1.saveAuditLog)({ user, action, details });
    }
    catch (err) {
        console.error('Audit log error:', err);
    }
}
// GET /expenses
router.get('/', async (req, res) => {
    try {
        const list = await (0, db_1.getExpenses)();
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /expenses (Validator check)
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    const { type, amount, driverId, vehicleId, remarks } = req.body;
    const operator = req.user?.email || 'Driver';
    // Business Rule: Negative expenses are not allowed
    if (amount < 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation Exception: Negative expense amounts are strictly prohibited.',
            errorCode: 'NEGATIVE_EXPENSE'
        });
    }
    try {
        const expense = {
            id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
            expenseType: type || 'Miscellaneous',
            amount,
            driver: driverId,
            vehicle: vehicleId,
            paymentMode: 'Card',
            status: 'pending',
            remarks
        };
        await (0, db_1.saveExpense)(expense);
        await logAudit(operator, 'Expense Logged', `Logged expense of $${amount} for vehicle ${vehicleId}`);
        res.status(201).json({
            success: true,
            message: 'Expense reported to queue, awaiting Financial Analyst audit.',
            data: expense
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// PATCH /expenses/:id/approve (Financial analyst guarded)
router.patch('/:id/approve', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'FinancialAnalyst']), async (req, res) => {
    const { id } = req.params;
    const operator = req.user?.email || 'FinancialAnalyst';
    try {
        const expenses = await (0, db_1.getExpenses)();
        const exp = expenses.find(e => e.id === id);
        if (!exp)
            return res.status(404).json({ success: false, message: 'Expense request not found.' });
        exp.status = 'approved';
        exp.approvedBy = operator;
        await (0, db_1.saveExpense)(exp);
        await logAudit(operator, 'Expense Approved', `Approved expense transaction ID: ${id}`);
        res.json({ success: true, message: 'Expense approved and added to accounting registers.' });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
// PATCH /expenses/:id/reject (Financial analyst guarded)
router.patch('/:id/reject', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'FinancialAnalyst']), async (req, res) => {
    const { id } = req.params;
    const operator = req.user?.email || 'FinancialAnalyst';
    try {
        const expenses = await (0, db_1.getExpenses)();
        const exp = expenses.find(e => e.id === id);
        if (!exp)
            return res.status(404).json({ success: false, message: 'Expense request not found.' });
        exp.status = 'rejected';
        await (0, db_1.saveExpense)(exp);
        await logAudit(operator, 'Expense Rejected', `Rejected expense transaction ID: ${id}`);
        res.json({ success: true, message: 'Expense request rejected.' });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.default = router;
