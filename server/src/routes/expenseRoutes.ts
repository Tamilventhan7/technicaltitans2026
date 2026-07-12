import { Router } from 'express';
import { getExpenses, saveExpense, saveAuditLog } from '../db';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Log Audit Action Helper
async function logAudit(user: string, action: string, details: string) {
  try {
    await saveAuditLog({ user, action, details });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// GET /expenses
router.get('/', async (req, res) => {
  try {
    const list = await getExpenses();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /expenses (Validator check)
router.post('/', authenticateToken, async (req, res) => {
  const { type, amount, driverId, vehicleId, remarks } = req.body;
  const operator = (req as any).user?.email || 'Driver';
  
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
      status: 'pending' as const,
      remarks
    };

    await saveExpense(expense);

    await logAudit(operator, 'Expense Logged', `Logged expense of $${amount} for vehicle ${vehicleId}`);

    res.status(201).json({
      success: true,
      message: 'Expense reported to queue, awaiting Financial Analyst audit.',
      data: expense
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /expenses/:id/approve (Financial analyst guarded)
router.patch('/:id/approve', authenticateToken, requireRole(['Admin', 'FinancialAnalyst']), async (req, res) => {
  const { id } = req.params;
  const operator = (req as any).user?.email || 'FinancialAnalyst';
  try {
    const expenses = await getExpenses();
    const exp = expenses.find(e => e.id === id);
    if (!exp) return res.status(404).json({ success: false, message: 'Expense request not found.' });

    exp.status = 'approved';
    exp.approvedBy = operator;
    await saveExpense(exp);

    await logAudit(operator, 'Expense Approved', `Approved expense transaction ID: ${id}`);
    res.json({ success: true, message: 'Expense approved and added to accounting registers.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /expenses/:id/reject (Financial analyst guarded)
router.patch('/:id/reject', authenticateToken, requireRole(['Admin', 'FinancialAnalyst']), async (req, res) => {
  const { id } = req.params;
  const operator = (req as any).user?.email || 'FinancialAnalyst';
  try {
    const expenses = await getExpenses();
    const exp = expenses.find(e => e.id === id);
    if (!exp) return res.status(404).json({ success: false, message: 'Expense request not found.' });

    exp.status = 'rejected';
    await saveExpense(exp);

    await logAudit(operator, 'Expense Rejected', `Rejected expense transaction ID: ${id}`);
    res.json({ success: true, message: 'Expense request rejected.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
