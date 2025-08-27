const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const kknRoutes = require('./routes/kknRoutes');
const magangRoutes = require('./routes/magangRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminKknRoutes = require('./routes/adminKknRoutes');
const adminMagangRoutes = require('./routes/adminMagangRoutes');
const villageRoutes = require('./routes/villageRoutes');
const userRoutes = require('./routes/userRoutes');
const statusRoutes = require('./routes/statusRoutes');
const leaderRoutes = require('./routes/leaderRoutes');
const groupLeaderRoutes = require('./routes/kknGroupLeaderRoutes');
const proposalRoutes = require('./routes/proposalRoutes');


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes
app.use('/api/leader', leaderRoutes);
app.use('/api/village-quota', villageRoutes);
app.use('/api/admin', adminMagangRoutes);
app.use('/api/admin', adminKknRoutes);
app.use('/api/admin', notificationRoutes); // ⬅️ Pindahkan ke /api/admin
app.use('/api/admin', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/group-leaders', groupLeaderRoutes);
app.use('/api', proposalRoutes);


// Public routes
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/kkn', express.static(path.join(__dirname, 'uploads', 'kkn')));
app.use('/api', kknRoutes);
app.use('/api', magangRoutes);
app.use('/api', statusRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});
