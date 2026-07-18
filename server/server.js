require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const setupSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ── Connect DB ─────────────────────────────────────────────────────────────
connectDB();

// ── Security ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ──────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ChatApp server is running 🚀', timestamp: new Date() });
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Setup Socket.IO ────────────────────────────────────────────────────────
setupSocket(io);

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ChatApp Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
