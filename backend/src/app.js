const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { errorHandler } = require('./middlewares/errorHandler');

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Hardening de Segurança HTTP: remove header que expõe a stack Express
app.disable('x-powered-by');

// Trust Proxy: necessário em produção quando o servidor estiver atrás de proxy reverso
// (Nginx, Cloudflare, etc.) para que o rate limiter identifique o IP real do cliente.
// Ative via TRUST_PROXY=true no .env de produção.
if (config.trustProxy) {
  app.set('trust proxy', 1);
}

// Middlewares essenciais
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Módulos de Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Middleware Global de Tratamento de Erros e Logs
app.use(errorHandler);

module.exports = app;
