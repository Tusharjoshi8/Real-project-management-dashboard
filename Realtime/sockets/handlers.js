import { logActivity } from '../controllers/commonController.js';

const attachSocketHandlers = (io, socket) => {
  console.log(`>>> Socket connected: ${socket.user.email} (${socket.user.role})`);

  // Join role and user rooms for targeted broadcasts
  socket.join(socket.user.role);
  socket.join(`user_${socket.user.id}`);

  // Real-time Activity logging (Optional: if the frontend wants to log events without a REST call)
  socket.on('log_activity', async (data) => {
    data.userId = socket.user.id;
    data.userName = socket.user.name || socket.user.email;
    await logActivity(data, io);
    socket.emit('activity_logged');
  });

  socket.on('disconnect', () => {
    console.log(`<<< Socket disconnected: ${socket.user.email}`);
  });
};

export default attachSocketHandlers;


