/**
 * Authentication and RBAC Middleware for PhishGuard
 */

const jwt = require('jsonwebtoken');
const { inMemoryStore, executeQuery } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'phishguard_ultra_secure_jwt_secret_key_2026_cyber';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: No authorization token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Look up user in SQL or memory
    const user = inMemoryStore.users.find(u => u.UserID === decoded.userId);
    if (!user || !user.IsActive) {
      return res.status(401).json({ success: false, message: 'Invalid or deactivated user account' });
    }

    req.user = {
      userId: user.UserID,
      email: user.Email,
      fullName: user.FullName,
      role: user.RoleName,
      roleId: user.RoleID
    };

    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token', error: err.message });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] permissions`
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
