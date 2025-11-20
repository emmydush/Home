const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const workersRoutes = require('./routes/workers');
const jobsRoutes = require('./routes/jobs');
const paymentsRoutes = require('./routes/payments');
const reviewsRoutes = require('./routes/reviews');
const healthRoutes = require('./routes/health');

// Import database initialization
const { initDatabase } = require('./render-init');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize database on startup if on Render
if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'development') {
  console.log('🚀 Initializing database for Render deployment...');
  initDatabase().catch(err => {
    console.error('❌ Database initialization failed:', err.message);
  });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});