import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import socketAuth from './middleware/socketAuth.js';
import attachSocketHandlers from './sockets/handlers.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';


dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);



// Pass io to req for logging
app.use((req, res, next) => {
  req.app.set('io', io);
  next();
});

// Socket setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.use(socketAuth);

io.on('connection', (socket) => {
  attachSocketHandlers(io, socket);
});

// Connect DB
connectDB();

// Port - use 3001 as fallback
const port = process.env.PORT || 8080;
const serverPort = parseInt(port.toString()) || 8080;

const listener = server.listen(serverPort, '0.0.0.0', () => {
  console.log(`Realtime Server running on port ${serverPort}`);
  console.log(`Socket namespace ready at ws://localhost:${serverPort}`);
});

listener.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Port 8080 in use - kill processes and restart');
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

