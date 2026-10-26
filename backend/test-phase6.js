const http = require('http');
const app = require('./src/app');

let server;
const PORT = 3097;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (data) {
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {
            parsed = responseBody;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ OK: ${message}`);
  }
}

async function runPhase6Tests() {
  console.log('--- INICIANDO TESTES DE INTEGRAÇÃO DA FASE 6 (AUTH & PERFIL) ---');
  server = app.listen(PORT, () => {
    console.log(`Servidor de teste ativo na porta ${PORT}`);
  });

  const timestamp = Date.now();
  const testUser = {
    name: 'Carlos Oliveira',
    email: `carlos_phase6_${timestamp}@example.com`,
    password: 'SenhaForte123!',
    initial_balance: 2500.5,
  };

  try {
    // 1. Cadastro
    console.log('\n[1] Testando Cadastro via POST /api/auth/register...');
    const regRes = await request('POST', '/api/auth/register', testUser);
    assert(regRes.status === 201, 'Cadastro deve retornar status 201');
    assert(regRes.data.token, 'Resposta do cadastro deve conter token JWT');
    assert(regRes.data.user.name === testUser.name, 'Nome do usuário deve corresponder ao informado');
    assert(regRes.data.user.initial_balance === 2500.5, 'Saldo inicial cadastrado deve ser 2500.50');

    const token = regRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Consulta de Perfil
    console.log('\n[2] Testando Consulta do Perfil via GET /api/users/me...');
    const meRes = await request('GET', '/api/users/me', null, authHeaders);
    assert(meRes.status === 200, 'GET /api/users/me deve retornar status 200');
    assert(meRes.data.email === testUser.email, 'E-mail do perfil deve corresponder ao cadastrado');
    assert(meRes.data.initial_balance === 2500.5, 'Saldo inicial retornado deve ser 2500.50');

    // 3. Atualização de Perfil
    console.log('\n[3] Testando Atualização de Perfil via PUT /api/users/me...');
    const updateRes = await request(
      'PUT',
      '/api/users/me',
      { name: 'Carlos Oliveira Santos', initial_balance: 3200.0 },
      authHeaders
    );
    assert(updateRes.status === 200, 'PUT /api/users/me deve retornar status 200');
    const updatedProfile = updateRes.data.user || updateRes.data;
    assert(updatedProfile.name === 'Carlos Oliveira Santos', 'Nome atualizado com sucesso');
    assert(updatedProfile.initial_balance === 3200.0, 'Saldo inicial atualizado para 3200.00');

    // 4. Login com credenciais
    console.log('\n[4] Testando Login via POST /api/auth/login...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    assert(loginRes.status === 200, 'POST /api/auth/login deve retornar status 200');
    assert(loginRes.data.token, 'Login deve retornar novo token JWT');
    assert(loginRes.data.user.name === 'Carlos Oliveira Santos', 'Perfil no login reflete o nome atualizado');

    // 5. Esqueci minha senha
    console.log('\n[5] Testando Solicitação de Recuperação via POST /api/auth/forgot-password...');
    const forgotRes = await request('POST', '/api/auth/forgot-password', {
      email: testUser.email,
    });
    assert(forgotRes.status === 200, 'POST /api/auth/forgot-password deve retornar 200 genérico');

    // 6. Exclusão de Conta (RN10)
    console.log('\n[6] Testando Exclusão de Conta via DELETE /api/users/me (RN10)...');
    const deleteRes = await request('DELETE', '/api/users/me', null, authHeaders);
    assert(deleteRes.status === 200, 'DELETE /api/users/me deve retornar status 200');

    // 7. Validação pós-exclusão
    console.log('\n[7] Validando Invalidação do Token / Acesso pós-exclusão...');
    const afterDeleteRes = await request('GET', '/api/users/me', null, authHeaders);
    assert(
      afterDeleteRes.status === 401 || afterDeleteRes.status === 404,
      'Tentativa de acesso com token de conta excluída deve rejeitar com 401 ou 404 (usuário não encontrado)'
    );

    console.log('\n🎉 TODOS OS TESTES DA FASE 6 PASSARAM COM 100% DE SUCESSO! 🎉\n');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante os testes da Fase 6:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runPhase6Tests();
