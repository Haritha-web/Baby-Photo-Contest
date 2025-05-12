import { roles } from '../utils/roles.js';

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role; // Example: req.user.role = 'admin' or 'user' or 'voter'
    if (!userRole) {
      return res.status(403).json({ message: 'No role assigned to user.' });
    }

    const rolePermissions = roles[userRole]?.permissions || [];

    if (!rolePermissions.includes(requiredPermission)) {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    next();
  };
};
export {
    checkPermission
};