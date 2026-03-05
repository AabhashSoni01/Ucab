const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Routes
const userRoutes    = require('./routes/userRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const carRoutes     = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes  = require('./routes/driverRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Sockets
const initSockets = require('./sockets/index');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect DB
connectDB();

// ── Middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.requestMiddleware);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ── API Routes ──
app.use('/api/users',    userRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/cars',     carRoutes);
app.use('/api/rides',    bookingRoutes);
app.use('/api/drivers',  driverRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'UCab API is running 🚖', timestamp: new Date() });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ── Socket.IO ──
initSockets(io);

// ── Start server ──
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  logger.info(`🚀 UCab server running on http://localhost:${PORT}`);
});