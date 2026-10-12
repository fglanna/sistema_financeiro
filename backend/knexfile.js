require('dotenv').config();

const getSslConfig = (isProduction) => {
  const sslExplicit = process.env.DB_SSL === 'true';
  const sslViaUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'));

  if (!sslExplicit && !sslViaUrl && !isProduction) {
    return false;
  }
  if (!sslExplicit && !sslViaUrl) {
    return false;
  }

  // Padrão seguro de produção: validação de certificados ativada (rejectUnauthorized: true)
  // Pode ser sobrescrito por DB_SSL_REJECT_UNAUTHORIZED=false se o provedor exigir certificado auto-assinado
  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };
};

const getConnectionConfig = (isProduction) => {
  const ssl = getSslConfig(isProduction);

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || (isProduction ? undefined : 'postgres'),
    database: process.env.DB_NAME || (isProduction ? undefined : 'sistema_financeiro'),
    ssl
  };
};

module.exports = {
  development: {
    client: 'pg',
    connection: getConnectionConfig(false),
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: getConnectionConfig(true),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  }
};
