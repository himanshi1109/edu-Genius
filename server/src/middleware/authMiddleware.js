import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes — verify JWT token and attach user to request.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      if (req.user.isBlocked) {
        res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
        return;
      }

      next();
      return;
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {
    req.user = null;
  }
  next();
};
