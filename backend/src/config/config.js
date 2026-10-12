require('dotenv').config();

const INSECURE_JWT_DEFAULTS = [
  'chave_secreta_padrao_desenvolvimento',
  'seu_segredo_jwt_aqui_substitua_em_producao',
  'secret',
  'changeme'
];

const jwtSecret = process.env.JWT_SECRET || 'chave_secreta_padrao_desenvolvimento';

// Bloqueia inicialização em produção com JWT_SECRET inseguro
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || INSECURE_JWT_DEFAULTS.includes(jwtSecret) || jwtSecret.length < 32) {
    console.error('[SEGURANÇA CRÍTICA] JWT_SECRET não configurado ou inseguro em ambiente de produção. Configure uma chave aleatória com pelo menos 32 caracteres no arquivo .env.');
    process.exit(1);
  }
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'postgres') {
    console.error('[SEGURANÇA CRÍTICA] DB_PASSWORD não configurado ou usando senha padrão em ambiente de produção. Configure uma senha segura no arquivo .env.');
    process.exit(1);
  }
  if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
    console.error('[SEGURANÇA CRÍTICA] FRONTEND_URL não configurado para produção. Configure a URL real do frontend no arquivo .env.');
    process.exit(1);
  }
}

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  trustProxy: process.env.TRUST_PROXY === 'true',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sistema_financeiro',
    ssl: process.env.DB_SSL === 'true'
  },
  jwt: {
    secret: jwtSecret,
    expiresIn: '24h'
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'nao-responda@sistemafinanceiro.com'
  }
};

module.exports = config;
