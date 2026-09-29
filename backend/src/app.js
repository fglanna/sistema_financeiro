const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { errorHandler } = require('./middlewares/errorHandler');

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares essenciais
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json());

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Módulos de Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Middleware Global de Tratamento de Erros e Logs
app.use(errorHandler);

module.exports = app;
