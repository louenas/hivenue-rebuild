// backend/middleware/role.js

const validRoles = ['admin', 'manager', 'owner', 'tenant']; // Define all valid roles

const role = (requiredRoles) => {
  return (req, res, next) => {
    // Ensure requiredRoles is an array
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }

    // Validate roles
    const isValid = requiredRoles.every(role => validRoles.includes(role));
    if (!isValid) {
      console.warn(`Invalid role(s) specified in middleware: ${requiredRoles}`);
      return res.status(400).json({ message: 'Invalid role specified in middleware.' });
    }

    console.log(`User (${req.user.id}) Role: ${req.user.role}`);
    console.log(`Allowed Roles: ${requiredRoles.join(', ')}`);

    // Check if user's role is included in the allowed roles
    if (!requiredRoles.includes(req.user.role)) {
      console.warn(`Access denied for user (${req.user.id}) with role: ${req.user.role}`);
      return res.status(403).json({ message: 'Access denied.' });
    }

    next();
  };
};

module.exports = role;