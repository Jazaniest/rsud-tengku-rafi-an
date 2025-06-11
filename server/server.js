// server.js (backend)
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const workflowRoutes = require('./routes/workflowRoutes');
const { sendNotification } = require('./utils/fcm');

require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const kegiatanRoutes = require('./routes/kegiatanRoutes');
// const subKegiatanRoutes = require('./routes/subKegiatanRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const exportRoutes = require('./routes/exportRoutes');
const switchRoutes = require('./routes/switchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// ✅ Serve frontend (static files) dari folder public
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

// ✅ Middleware
app.use(bodyParser.json());

// ✅ Notification handler
require('./notification-handler/notificationHandler');

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
// app.use('/api/subkegiatan', subKegiatanRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/switch', switchRoutes);
app.use('/api/notification', notificationRoutes);

// ✅ Static folders
app.use('/exports', express.static(path.resolve(__dirname, '..', 'exports')));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// ✅ Endpoint kirim notifikasi
app.post('/api/send-notification', async (req, res) => {
  const { token, title, body } = req.body;
  if (!token || !title || !body) {
    return res.status(400).json({ message: 'Parameter tidak lengkap' });
  }

  const payload = {
    notification: { title, body },
    android: { priority: 'high' },
    apns: { headers: { 'apns-priority': '10' } },
    webpush: { headers: { Urgency: 'high' } }
  };

  try {
    const response = await sendNotification(token, payload);
    res.status(200).json({ message: 'Notifikasi terkirim', response });
  } catch (error) {
    console.error('Error mengirim notifikasi:', error);
    res.status(500).json({ message: 'Gagal mengirim notifikasi', error });
  }
});

// ✅ Catch-all route: untuk menangani SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
