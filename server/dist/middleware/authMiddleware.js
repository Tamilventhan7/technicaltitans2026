"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireRole = requireRole;
// Mock Token Decoder Middleware (JWT Simulator)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        // For demo purposes, if no token, check for a mock query role, fallback to Admin
        const queryRole = req.query.simRole;
        req.user = {
            id: 'EMP-MOCK',
            email: 'mockuser@transitops.com',
            role: queryRole || 'Admin'
        };
        return next();
    }
    // Simulating token parsing
    const username = token.replace('mock-jwt-token-', '');
    const mockRoles = {
        admin: 'Admin',
        dispatcher: 'Dispatcher',
        driver: 'Driver',
        safety: 'SafetyOfficer',
        finance: 'FinancialAnalyst',
        manager: 'FleetManager'
    };
    req.user = {
        id: 'EMP-JWT',
        email: `${username}@transitops.com`,
        role: mockRoles[username.toLowerCase()] || 'Admin'
    };
    next();
}
// Role Authorization Middleware Guard
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication session required.', errorCode: 'UNAUTHORIZED' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Security Block: Role ${req.user.role} is not authorized to execute this operation.`,
                errorCode: 'FORBIDDEN'
            });
        }
        next();
    };
}
