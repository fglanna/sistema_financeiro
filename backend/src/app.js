const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const { errorHandler } = require('./middlewares/errorHandler');

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cronRoutes = require('./routes/cronRoutes');

const app = express();

// Segurança HTTP – middleware Helmet
// Configurações padrão são suficientes para maioria dos cabeçalhos.
// Ajustes finos são aplicados apenas em produção para não interferir no
// desenvolvimento ou no consumo da API pelo frontend.
if (process.env.NODE_ENV === 'production') {
  app.use(
    require('helmet')({
      // Exemplo: política de segurança de conteúdo desabilitada para permitir
      // carregamento de assets externos que podem ser necessários.
      contentSecurityPolicy: false,
      // HSTS (Strict-Transport-Security) – apenas em produção.
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Referrer‑Policy para reduzir vazamento de URLs.
      referrerPolicy: { policy: 'no-referrer' },
    })
  );
}


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
app.use('/api/categories', categoryRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cron', cronRoutes);

// Middleware Global de Tratamento de Erros e Logs
app.use(errorHandler);

module.exports = app;
