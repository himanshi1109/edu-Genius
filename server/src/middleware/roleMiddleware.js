/**
 * Role-based access control middleware.
 * Usage: authorize('instructor') or authorize('student', 'instructor')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Admins bypass role checks
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const userRole = req.user.role?.toLowerCase();
    const authorizedRoles = roles.map(r => r.toLowerCase());

    if (!authorizedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};

export default authorize;
