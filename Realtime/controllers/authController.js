import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-pro-js';
import User from '../models/User.js';
import { logActivity } from './commonController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, role = 'employee', avatar, managerId } = req.body;
    
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(StatusCodes.BAD_REQUEST.code).json({
        code: StatusCodes.BAD_REQUEST.code,
        message: 'User already exists',
        data: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: hashedPassword,
      role,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || email}`,
      managerId: managerId || null
    });


    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );


    // Activity Log
    const io = req.app.get('io');
    await logActivity({
      userId: user._id,
      userName: user.name,
      action: 'Register',
      entity: 'Auth',
      entityId: user._id.toString(),
      details: `New account registered: ${user.email}`
    }, io);

    // Broadcast new user to others
    if (io) {
      io.emit('user_created', {
        ...user.toObject(),
        id: user._id
      });
    }

    res.status(StatusCodes.CREATED.code).json({

      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error creating user',
      data: null
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND.code).json({
        code: StatusCodes.NOT_FOUND.code,
        message: 'User not found',
        data: null
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED.code).json({
        code: StatusCodes.UNAUTHORIZED.code,
        message: 'Invalid credentials',
        data: null
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );


    // Activity Log
    const io = req.app.get('io');
    await logActivity({
      userId: user._id,
      userName: user.name,
      action: 'Login',
      entity: 'Auth',
      entityId: user._id.toString(),
      details: `User logged in: ${user.email}`
    }, io);

    res.status(StatusCodes.OK.code).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Login error',
      data: null
    });
  }
};

// Get profile (protected)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND.code).json({
        code: StatusCodes.NOT_FOUND.code,
        message: 'User not found',
        data: null
      });
    }
    res.status(StatusCodes.OK.code).json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      code: StatusCodes.INTERNAL_SERVER_ERROR.code,
      message: 'Error fetching profile',
      data: null
    });
  }
};



