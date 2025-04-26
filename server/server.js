// server.js (backend)
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const workflowRoutes = require('./routes/workflowRoutes');

const { sendNotification } = require('./utils/fcm')

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const kegiatanRoutes = require('./routes/kegiatanRoutes');
const subKegiatanRoutes = require('./routes/subKegiatanRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const exportRoutes = require('./routes/exportRoutes');
const switchRoutes = require('./routes/switchRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
// app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.static('public'));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../public/index.html'));
//   console.log('ini path direktorinya : ', path.resolve(__dirname, '../public/index.html'));
// });
// app.use(express.json());

// Notification handler
require('./notification-handler/notificationHandler');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/subkegiatan', subKegiatanRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/switch', switchRoutes);

app.use('/exports', express.static('exports'));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Endpoint untuk mengirim notifikasi
app.post('/api/send-notification', async (req, res) => {
  const { token, title, body } = req.body;
  if (!token || !title || !body) {
    return res.status(400).json({ message: 'Parameter tidak lengkap' });
  }

  const payload = {
    notification: {
      title: title,
      body: body,
    },
    android: {
      priority: 'high'
    },
    apns: {
      headers: {
        'apns-priority': '10'
      }
    },
    webpush: {
      headers: {
        Urgency: 'high'
      }
    }
  };
  

  try {
    const response = await sendNotification(token, payload);
    res.status(200).json({ message: 'Notifikasi terkirim', response });
  } catch (error) {
    console.error('Error mengirim notifikasi:', error);
    res.status(500).json({ message: 'Gagal mengirim notifikasi', error });
  }
});

// Untuk menangani route yang tidak dikenali agar mengembalikan index.html
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public', 'index.html'));
//   console.log('ini direktorinya : ', path.join(__dirname, 'public', 'index.html'));
// });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
