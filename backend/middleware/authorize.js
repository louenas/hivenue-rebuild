// backend/middleware/authorize.js

const validRoles = ['admin', 'owner', 'tenant']; // Define all valid roles
const logger = require('../utils/logger'); // Assuming you have a logger setup

const authorize = (...allowedRoles) => {
  // Validate that allowedRoles are within validRoles
  const isValid = allowedRoles.every(role => validRoles.includes(role));
  if (!isValid) {
    throw new Error(`Invalid role(s) specified in middleware: ${allowedRoles}`);
  }

  return (req, res, next) => {
    if (!req.user) {
      logger.warn(`Unauthorized access attempt to ${req.originalUrl} from IP: ${req.ip}`);
      return res.status(401).json({ message: 'Unauthorized: No user information found.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Forbidden access attempt by user ID ${req.user.id} with role ${req.user.role} to ${req.originalUrl}`);
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }

    logger.info(`User (${req.user.id}) with role (${req.user.role}) accessed ${req.originalUrl}`);
    next();
  };
};

module.exports = authorize;