import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-pro-js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED.code).json({
        code: StatusCodes.UNAUTHORIZED.code,
        message: 'No token provided',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED.code).json({
      code: StatusCodes.UNAUTHORIZED.code,
      message: 'Invalid token',
      data: null
    });
  }
};

export const authorize = (roles) => (req, res, next) => {
  // Convert single string to array if needed
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(StatusCodes.FORBIDDEN.code).json({
      code: StatusCodes.FORBIDDEN.code,
      message: 'Insufficient permissions',
      data: null
    });
  }
  next();
};


