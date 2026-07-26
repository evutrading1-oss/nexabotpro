const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authRoutes = require('./auth/auth.routes');
const apiRoutes = require('./api/api.routes');
const analysisRoutes = require('./routes/analysis.routes');
const historyRoutes = require('./routes/history.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/market', apiRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Nexa EVU Bot running on port ${PORT}`));
