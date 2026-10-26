/**
 * Testes Automatizados de Integração e Hardening — Fase 8
 * Validação Completa de Ponta a Ponta:
 * - Autenticação, Tokens JWT, Sessão e Rate Limiting (5 req / 15 min)
 * - Regras de Negócio RN01 a RN10
 * - Auditoria em security_logs
 * - Hardening de Headers, Proteção de Payload e Validação de UUID
 * - Integridade de logs de erro em backend/logs/error.log
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const db = require('./src/database/connection');
const config = require('./src/config/config');

const PORT = 3095;
let server;

// Helper HTTP com Promise nativa
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
            rawBody: responseBody,
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

async function runPhase8Tests() {
  console.log('================================================================');
  console.log('--- INICIANDO TESTES INTEGRADOS E HARDENING FINAL (FASE 8) ---');
  console.log('================================================================');

  server = app.listen(PORT, () => {
    console.log(`Servidor de teste da Fase 8 ativo na porta ${PORT}`);
  });

  const timestamp = Date.now();
  const testUserA = {
    name: 'Carlos Alberto Siqueira',
    email: `carlos_phase8_${timestamp}@example.com`,
    password: 'SenhaForte123!',
    initial_balance: 1500.0,
  };

  const testUserB = {
    name: 'Beatriz Menezes',
    email: `beatriz_phase8_${timestamp}@example.com`,
    password: 'SenhaForte123!',
    initial_balance: 800.0,
  };

  let tokenA, userIdA, authHeadersA;
  let tokenB, userIdB, authHeadersB;
  let defaultReceitaCatId, defaultDespesaCatId, customDespesaCatIdA;
  let pixPaymentMethodId;

  try {
    // -------------------------------------------------------------------------
    // 1. HARDENING DE CABEÇALHOS HTTP
    // -------------------------------------------------------------------------
    console.log('\n[1] Validando Hardening de Cabeçalhos HTTP...');
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200, 'Health check responde 200 OK');
    assert(!healthRes.headers['x-powered-by'], 'Cabeçalho X-Powered-By está desativado (app.disable("x-powered-by"))');
    assert(!healthRes.data.environment, 'Health check público não expõe variável environment (INC-003)');

    // -------------------------------------------------------------------------
    // 2. FLUXO DE AUTENTICAÇÃO E CADASTRO
    // -------------------------------------------------------------------------
    console.log('\n[2] Testando Cadastro de Usuários e Tratamento de Duplicidade...');
    const regResA = await request('POST', '/api/auth/register', testUserA);
    assert(regResA.status === 201, 'Cadastro do Usuário A realizado com status 201');
    assert(!!regResA.data.token, 'Token JWT retornado no cadastro do Usuário A');
    assert(regResA.data.user.name === testUserA.name, 'Nome do Usuário A coincide');
    assert(Number(regResA.data.user.initial_balance) === 1500.0, 'RN04: Saldo Inicial registrado como R$ 1500,00');
    tokenA = regResA.data.token;
    userIdA = regResA.data.user.id;
    authHeadersA = { Authorization: `Bearer ${tokenA}` };

    // Tentativa de duplicidade de e-mail (409 Conflict)
    const dupRes = await request('POST', '/api/auth/register', testUserA);
    assert(dupRes.status === 409, 'Cadastro duplicado com mesmo e-mail rejeitado com status 409 Conflict');

    // Cadastro do Usuário B (para testes de multi-tenancy e RN01)
    const regResB = await request('POST', '/api/auth/register', testUserB);
    assert(regResB.status === 201, 'Cadastro do Usuário B realizado com status 201');
    tokenB = regResB.data.token;
    userIdB = regResB.data.user.id;
    authHeadersB = { Authorization: `Bearer ${tokenB}` };

    // -------------------------------------------------------------------------
    // 3. LOGIN, VALIDAÇÃO DE SENHA E TOKENS JWT
    // -------------------------------------------------------------------------
    console.log('\n[3] Testando Autenticação, Login e Validação de JWT...');
    // Senha errada
    const badLoginRes = await request('POST', '/api/auth/login', {
      email: testUserA.email,
      password: 'SenhaIncorreta999!',
    });
    assert(badLoginRes.status === 401, 'Login com senha incorreta retorna 401 Unauthorized');

    // Login com credenciais válidas
    const loginRes = await request('POST', '/api/auth/login', {
      email: testUserA.email,
      password: testUserA.password,
    });
    assert(loginRes.status === 200, 'Login válido retorna 200 OK');
    assert(!!loginRes.data.token, 'Novo token JWT retornado no login');

    // Acesso sem token
    const noTokenRes = await request('GET', '/api/users/me');
    assert(noTokenRes.status === 401, 'Acesso a rota protegida sem header Authorization retorna 401');

    // Acesso com token JWT corrompido / forjado
    const forgedTokenRes = await request('GET', '/api/users/me', null, {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tokenforjado.assinaturainvalida',
    });
    assert(forgedTokenRes.status === 401, 'Acesso com token JWT corrompido retorna 401 Unauthorized');

    // -------------------------------------------------------------------------
    // 4. CICLO DE REDEFINIÇÃO DE SENHA (FORGOT & RESET PASSWORD)
    // -------------------------------------------------------------------------
    console.log('\n[4] Testando Recuperação e Redefinição de Senha...');
    const forgotRes = await request('POST', '/api/auth/forgot-password', {
      email: testUserA.email,
    });
    assert(forgotRes.status === 200, 'Solicitação de recuperação retorna 200 OK genérico');

    // Buscar token gerado diretamente no banco de dados para testar o reset
    const tokenRecord = await db('password_reset_tokens')
      .where('user_id', userIdA)
      .andWhere('used', false)
      .orderBy('created_at', 'desc')
      .first();
    assert(!!tokenRecord, 'Registro de token criado na tabela password_reset_tokens');
    assert(tokenRecord.used === false, 'Token inicializado com used = false');

    // Redefinição de senha com nova senha
    const novaSenha = 'NovaSenhaSegura456!';
    // Precisamos do token em texto claro. Como o banco armazena token_hash SHA-256,
    // o AuthService gera e envia o e-mail mock. No ambiente de teste, podemos simular
    // gerando um novo token conhecido para validação do endpoint /reset-password:
    const crypto = require('crypto');
    const rawTestToken = crypto.randomBytes(32).toString('hex');
    const hashedTestToken = crypto.createHash('sha256').update(rawTestToken).digest('hex');
    await db('password_reset_tokens').insert({
      user_id: userIdA,
      token_hash: hashedTestToken,
      expires_at: new Date(Date.now() + 3600000),
      used: false,
    });

    const resetRes = await request('POST', '/api/auth/reset-password', {
      token: rawTestToken,
      new_password: novaSenha,
    });
    assert(resetRes.status === 200, 'POST /api/auth/reset-password retorna 200 OK');

    // Validar que o token foi marcado como used = true
    const updatedToken = await db('password_reset_tokens').where('token_hash', hashedTestToken).first();
    assert(updatedToken.used === true, 'Token marcado imediatamente como used = true');

    // Tentativa de reutilizar o token consumido
    const reuseTokenRes = await request('POST', '/api/auth/reset-password', {
      token: rawTestToken,
      new_password: 'OutraSenhaQualquer1!',
    });
    assert(reuseTokenRes.status === 400, 'Tentativa de reusar token consumido retorna 400 Bad Request');

    // Login com a nova senha redefinida
    const loginWithNewPass = await request('POST', '/api/auth/login', {
      email: testUserA.email,
      password: novaSenha,
    });
    assert(loginWithNewPass.status === 200, 'Login com a nova senha foi aprovado com 200 OK');
    tokenA = loginWithNewPass.data.token;
    authHeadersA = { Authorization: `Bearer ${tokenA}` };

    // -------------------------------------------------------------------------
    // 5. DOMÍNIO FIXO E CATEGORIAS (RN01 e RN08)
    // -------------------------------------------------------------------------
    console.log('\n[5] Testando Domínio Fixo, Categorias e Regras RN08...');
    const pmRes = await request('GET', '/api/payment-methods', null, authHeadersA);
    assert(pmRes.status === 200, 'GET /api/payment-methods retorna 200');
    assert(Array.isArray(pmRes.data) && pmRes.data.length === 6, 'Exatamente 6 formas de pagamento do domínio fixo');
    pixPaymentMethodId = pmRes.data.find((p) => p.name === 'Pix').id;

    const catRes = await request('GET', '/api/categories', null, authHeadersA);
    assert(catRes.status === 200, 'GET /api/categories retorna 200');
    const defaultReceita = catRes.data.find((c) => c.is_default && c.type === 'RECEITA');
    const defaultDespesa = catRes.data.find((c) => c.is_default && c.type === 'DESPESA');
    assert(!!defaultReceita && !!defaultDespesa, 'Categorias padrão de receita e despesa disponíveis');
    defaultReceitaCatId = defaultReceita.id;
    defaultDespesaCatId = defaultDespesa.id;

    // RN08: Tentativa de alterar categoria padrão deve ser bloqueada
    const editDefaultCat = await request('PUT', `/api/categories/${defaultReceitaCatId}`, { name: 'Novo Nome' }, authHeadersA);
    assert(editDefaultCat.status === 400, 'RN08: Bloqueio de edição em categoria padrão retorna 400');

    // RN08: Tentativa de excluir categoria padrão deve ser bloqueada
    const deleteDefaultCat = await request('DELETE', `/api/categories/${defaultReceitaCatId}`, null, authHeadersA);
    assert(deleteDefaultCat.status === 400, 'RN08: Bloqueio de exclusão em categoria padrão retorna 400');

    // Criar categoria personalizada de despesa para o Usuário A
    const customCatRes = await request('POST', '/api/categories', {
      name: 'Software e Nuvem',
      type: 'DESPESA',
    }, authHeadersA);
    assert(customCatRes.status === 201, 'Categoria personalizada criada para Usuário A com 201');
    customDespesaCatIdA = customCatRes.data.id;

    // RN01: Usuário B NÃO deve enxergar a categoria personalizada de Usuário A
    const catResB = await request('GET', '/api/categories', null, authHeadersB);
    const foundCustomInB = catResB.data.some((c) => c.id === customDespesaCatIdA);
    assert(!foundCustomInB, 'RN01: Multi-tenancy - Usuário B não tem acesso à categoria do Usuário A');

    // -------------------------------------------------------------------------
    // 6. LANÇAMENTOS FINANCEIROS: RN05, RN08 E MULTI-TENANCY (RN01)
    // -------------------------------------------------------------------------
    console.log('\n[6] Testando Lançamentos Financeiros (RN05 e RN08)...');

    // RN05: due_date obrigatório
    const noDueDateRes = await request('POST', '/api/transactions', {
      description: 'Sem due date',
      amount: 100,
      type: 'DESPESA',
      category_id: defaultDespesaCatId,
      payment_method_id: pixPaymentMethodId,
      status: 'PENDENTE',
    }, authHeadersA);
    assert(noDueDateRes.status === 400, 'RN05: Lançamento sem due_date é rejeitado com 400');

    // RN05: Se PAGO, payment_date é obrigatório
    const pagoSemPaymentDateRes = await request('POST', '/api/transactions', {
      description: 'Pago sem payment_date',
      amount: 100,
      type: 'DESPESA',
      category_id: defaultDespesaCatId,
      payment_method_id: pixPaymentMethodId,
      status: 'PAGO',
      due_date: '2026-10-15',
    }, authHeadersA);
    assert(pagoSemPaymentDateRes.status === 400, 'RN05: Lançamento PAGO sem payment_date é rejeitado com 400');

    // RN08: Compatibilidade category.type === transaction.type na camada Service
    const incompatibleTypeRes = await request('POST', '/api/transactions', {
      description: 'Despesa com categoria de receita',
      amount: 250,
      type: 'DESPESA',
      category_id: defaultReceitaCatId, // Categoria de RECEITA
      payment_method_id: pixPaymentMethodId,
      status: 'PENDENTE',
      due_date: '2026-10-15',
    }, authHeadersA);
    assert(incompatibleTypeRes.status === 400, 'RN08: Incompatibilidade categoria x tipo rejeitada na Service com 400');

    // -------------------------------------------------------------------------
    // 7. CÁLCULOS DETERMINÍSTICOS DE SALDOS: RN02, RN03 E RN04
    // -------------------------------------------------------------------------
    console.log('\n[7] Validando Cálculos de Saldos RN02 e RN03...');
    // Saldo Inicial = R$ 1.500,00
    // Lançamento 1: Receita Paga no passado recente (R$ 3.000,00) -> entra no Saldo Atual
    const t1 = await request('POST', '/api/transactions', {
      description: 'Salário Mensal',
      amount: 3000.0,
      type: 'RECEITA',
      category_id: defaultReceitaCatId,
      payment_method_id: pixPaymentMethodId,
      status: 'PAGO',
      due_date: '2026-10-05',
      payment_date: '2026-10-05',
    }, authHeadersA);
    assert(t1.status === 201, 'Lançamento T1 (Receita Paga) criado');

    // Lançamento 2: Despesa Paga no passado recente (R$ 1.200,00) -> subtrai do Saldo Atual
    const t2 = await request('POST', '/api/transactions', {
      description: 'Servidores de Produção',
      amount: 1200.0,
      type: 'DESPESA',
      category_id: customDespesaCatIdA,
      payment_method_id: pixPaymentMethodId,
      status: 'PAGO',
      due_date: '2026-10-10',
      payment_date: '2026-10-10',
    }, authHeadersA);
    assert(t2.status === 201, 'Lançamento T2 (Despesa Paga) criado');
    const transactionIdA = t2.data.id;

    // Lançamento 3: Receita Paga com data futura (R$ 5.000,00) -> payment_date > CURRENT_DATE
    // Conforme RN02: payment_date <= CURRENT_DATE, logo NÃO pode impactar o Saldo Atual
    const futureDate = '2026-10-31';
    const t3Future = await request('POST', '/api/transactions', {
      description: 'Bônus Futuro',
      amount: 5000.0,
      type: 'RECEITA',
      category_id: defaultReceitaCatId,
      payment_method_id: pixPaymentMethodId,
      status: 'PAGO',
      due_date: futureDate,
      payment_date: futureDate,
    }, authHeadersA);
    assert(t3Future.status === 201, 'Lançamento T3 (Receita Paga com data futura 31/10) criado');

    // Lançamento 4: Receita Pendente do mês (R$ 800,00) -> soma no Saldo Previsto
    const t4Pending = await request('POST', '/api/transactions', {
      description: 'Consultoria Pendente',
      amount: 800.0,
      type: 'RECEITA',
      category_id: defaultReceitaCatId,
      payment_method_id: pixPaymentMethodId,
      status: 'PENDENTE',
      due_date: '2026-10-28',
    }, authHeadersA);
    assert(t4Pending.status === 201, 'Lançamento T4 (Receita Pendente) criado');
    assert(t4Pending.data.payment_date === null, 'RN05: Lançamento PENDENTE possui payment_date = null');

    // Lançamento 5: Despesa Pendente do mês e VENCIDA (R$ 400,00, due_date = 2026-10-01) -> subtrai do Previsto e gera alerta
    const t5Overdue = await request('POST', '/api/transactions', {
      description: 'Boleto Atrasado de Energia',
      amount: 400.0,
      type: 'DESPESA',
      category_id: defaultDespesaCatId,
      payment_method_id: pixPaymentMethodId,
      status: 'PENDENTE',
      due_date: '2026-10-01',
    }, authHeadersA);
    assert(t5Overdue.status === 201, 'Lançamento T5 (Despesa Pendente Vencida) criado');

    // Consultar Dashboard de 10/2026
    const dashRes = await request('GET', '/api/dashboard?month=10&year=2026', null, authHeadersA);
    assert(dashRes.status === 200, 'GET /api/dashboard retorna 200');

    // Validação matemática estrita de RN02 e RN03:
    // Saldo Inicial = 1500.00
    // Receitas Pagas (payment_date <= CURRENT_DATE 26/10) = 3000.00
    // Despesas Pagas (payment_date <= CURRENT_DATE 26/10) = 1200.00
    // Saldo Atual esperado = 1500 + 3000 - 1200 = 3300.00 (O bônus de 5000 do dia 31/10 NÃO entra porque payment_date > 26/10)
    assert(
      dashRes.data.kpis.current_balance === 3300.0,
      `RN02: Saldo Atual esperado R$ 3300.00, obtido R$ ${dashRes.data.kpis.current_balance}`
    );

    // Saldo Previsto esperado = Saldo Atual (3300) + Receitas Pendentes (800) - Despesas Pendentes (400) = 3700.00
    assert(
      dashRes.data.kpis.forecasted_balance === 3700.0,
      `RN03: Saldo Previsto esperado R$ 3700.00, obtido R$ ${dashRes.data.kpis.forecasted_balance}`
    );

    // RN06: Destaque de Contas Atrasadas nos Alertas do Dashboard
    const overdueAlert = dashRes.data.alerts.find((a) => a.id === t5Overdue.data.id);
    assert(!!overdueAlert, 'Alerta do lançamento atrasado está presente no painel de alertas');
    assert(overdueAlert.is_overdue === true, 'RN06: Lançamento com due_date < CURRENT_DATE possui is_overdue = true');

    // -------------------------------------------------------------------------
    // 8. BLOQUEIOS DE CATEGORIA VINCULADA A LANÇAMENTOS (RN08)
    // -------------------------------------------------------------------------
    console.log('\n[8] Testando Bloqueios de Categoria Vinculada (RN08)...');
    // Categoria customDespesaCatIdA possui o lançamento T2 vinculado
    // Tentativa 1: Alterar o tipo (type) da categoria
    const alterTypeRes = await request('PUT', `/api/categories/${customDespesaCatIdA}`, {
      type: 'RECEITA',
    }, authHeadersA);
    assert(alterTypeRes.status === 400, 'RN08: Alteração de type em categoria com lançamentos vinculados é bloqueada com 400');

    // Tentativa 2: Excluir a categoria com lançamentos vinculados (ON DELETE RESTRICT)
    const deleteCatWithTxRes = await request('DELETE', `/api/categories/${customDespesaCatIdA}`, null, authHeadersA);
    assert(deleteCatWithTxRes.status === 400, 'RN08: Exclusão de categoria com lançamentos vinculados é bloqueada com 400');

    // -------------------------------------------------------------------------
    // 9. DUPLICAÇÃO DE LANÇAMENTO (FLUXO 3: DUPLICATE-DRAFT)
    // -------------------------------------------------------------------------
    console.log('\n[9] Testando Duplicação em Memória (duplicate-draft)...');
    const draftRes = await request('GET', `/api/transactions/${transactionIdA}/duplicate-draft`, null, authHeadersA);
    assert(draftRes.status === 200, 'duplicate-draft retorna 200 OK');
    assert(draftRes.data.description === 'Servidores de Produção', 'Descrição original preservada intacta');
    assert(draftRes.data.amount === 1200.0, 'Valor preservado no rascunho');
    assert(draftRes.data.status === 'PENDENTE', 'Rascunho configurado com status PENDENTE');
    assert(draftRes.data.payment_date === null, 'Rascunho possui payment_date = null');
    assert(!draftRes.data.id, 'Rascunho gerado exclusivamente em memória sem registro de id no banco');

    // -------------------------------------------------------------------------
    // 10. MULTI-TENANCY EM TRANSAÇÕES (RN01)
    // -------------------------------------------------------------------------
    console.log('\n[10] Validando Isolamento de Dados entre Usuários (RN01)...');
    // Usuário B tenta acessar transação do Usuário A
    const bAccessA = await request('GET', `/api/transactions/${transactionIdA}`, null, authHeadersB);
    assert(bAccessA.status === 404, 'RN01: Usuário B recebe 404 ao tentar ler transação de A');

    const bDraftA = await request('GET', `/api/transactions/${transactionIdA}/duplicate-draft`, null, authHeadersB);
    assert(bDraftA.status === 404, 'RN01: Usuário B recebe 404 ao tentar duplicar transação de A');

    const bEditA = await request('PUT', `/api/transactions/${transactionIdA}`, { description: 'Hacked' }, authHeadersB);
    assert(bEditA.status === 404, 'RN01: Usuário B recebe 404 ao tentar editar transação de A');

    const bDeleteA = await request('DELETE', `/api/transactions/${transactionIdA}`, null, authHeadersB);
    assert(bDeleteA.status === 404, 'RN01: Usuário B recebe 404 ao tentar excluir transação de A');

    // -------------------------------------------------------------------------
    // 11. EXPORTAÇÃO CSV EM MEMÓRIA (RN09)
    // -------------------------------------------------------------------------
    console.log('\n[11] Testando Exportação CSV em Memória (RN09)...');
    const csvRes = await request('GET', '/api/transactions/export/csv?month=10&year=2026', null, authHeadersA);
    assert(csvRes.status === 200, 'GET /api/transactions/export/csv retorna 200 OK');
    assert(csvRes.headers['content-type'].includes('text/csv'), 'Header Content-Type é text/csv');
    assert(csvRes.headers['content-disposition'].includes('extrato_2026_10.csv'), 'Header Content-Disposition define nome extrato_2026_10.csv');
    assert(csvRes.rawBody.startsWith('\uFEFF'), 'Presença do Byte Order Mark (BOM UTF-8)');
    assert(csvRes.rawBody.includes('Servidores de Produção'), 'Transação do mês está presente no CSV');
    assert(csvRes.rawBody.includes(';'), 'Separador de colunas ponto e vírgula (;) utilizado');

    // -------------------------------------------------------------------------
    // 12. NOTIFICAÇÕES CRON DE ALERTA E IDEMPOTÊNCIA (RN07)
    // -------------------------------------------------------------------------
    console.log('\n[12] Testando Cron de Notificações Diárias e Idempotência (RN07)...');
    const cronSecret = config.cron.secret;
    const cronRes1 = await request('POST', '/api/cron/daily-alerts', null, {
      Authorization: `Bearer ${cronSecret}`,
    });
    assert(cronRes1.status === 200, 'Disparo da rota de cron retorna 200 OK com segredo válido');

    // Segundo disparo no mesmo dia deve ser pulado por idempotência
    const cronRes2 = await request('POST', '/api/cron/daily-alerts', null, {
      Authorization: `Bearer ${cronSecret}`,
    });
    assert(cronRes2.status === 200, 'Segundo disparo retorna 200 OK');
    assert(cronRes2.data.status === 'skipped', 'Idempotência: disparo duplicado é pulado com status "skipped"');

    // -------------------------------------------------------------------------
    // 13. VALIDAÇÃO DEFENSIVA DE UUID E LIMITE DE PAYLOAD
    // -------------------------------------------------------------------------
    console.log('\n[13] Testando Validação Defensiva de UUID e Limite de Payload...');
    const invalidUuidRes = await request('GET', '/api/transactions/uuid-completamente-invalido', null, authHeadersA);
    assert(invalidUuidRes.status === 400, 'UUID inválido em rota rejeitado preventivamente com status 400');

    // Limite de payload 100kb
    const hugePayload = { description: 'A'.repeat(120 * 1024) }; // ~120KB
    const payloadRes = await request('POST', '/api/auth/register', hugePayload);
    assert(payloadRes.status === 413, 'Payload maior que 100kb rejeitado com 413 Payload Too Large');

    // -------------------------------------------------------------------------
    // 14. EXCLUSÃO DEFINITIVA EM CASCATA E AUDITORIA (RN10)
    // -------------------------------------------------------------------------
    console.log('\n[14] Testando Exclusão em Cascata (RN10) e Auditoria...');
    const deleteAccountRes = await request('DELETE', '/api/users/me', null, authHeadersA);
    assert(deleteAccountRes.status === 200, 'Exclusão de conta via DELETE /api/users/me retorna 200 OK');

    // Verificar exclusão no banco de dados via Knex
    const userInDb = await db('users').where('id', userIdA).first();
    assert(!userInDb, 'Usuário A foi removido permanentemente da tabela users');

    const txInDb = await db('financial_transactions').where('user_id', userIdA);
    assert(txInDb.length === 0, 'Todas as transações do Usuário A foram removidas em cascata (CASCADE)');

    const catInDb = await db('categories').where('user_id', userIdA);
    assert(catInDb.length === 0, 'Todas as categorias personalizadas do Usuário A foram removidas em cascata (CASCADE)');

    const tokensInDb = await db('password_reset_tokens').where('user_id', userIdA);
    assert(tokensInDb.length === 0, 'Tokens de recuperação do Usuário A foram removidos em cascata (CASCADE)');

    // Verificar log de auditoria em security_logs
    const secLog = await db('security_logs')
      .where('event_type', 'ACCOUNT_DELETED')
      .orderBy('created_at', 'desc')
      .first();
    assert(!!secLog, 'Evento ACCOUNT_DELETED registrado na tabela security_logs para auditoria');

    // Limpar Usuário B
    await db('users').where('id', userIdB).delete();

    // -------------------------------------------------------------------------
    // 15. RATE LIMITING (5 req / 15 min nas rotas de login)
    // -------------------------------------------------------------------------
    console.log('\n[15] Testando Rate Limiting nas Rotas Sensíveis (5 req / 15 min)...');
    // Fazer tentativas consecutivas de login
    let hitRateLimit = false;
    for (let i = 1; i <= 6; i++) {
      const rlRes = await request('POST', '/api/auth/login', {
        email: `ratelimit_test_${timestamp}@example.com`,
        password: 'wrong_password',
      });
      if (rlRes.status === 429) {
        hitRateLimit = true;
        assert(true, `Rate Limiting acionado com sucesso na tentativa ${i} com status 429 Too Many Requests`);
        break;
      }
    }
    assert(hitRateLimit, 'Rate limit bloqueou o cliente após exceder o limite de 5 tentativas');

    // -------------------------------------------------------------------------
    // 16. INTEGRIDADE DO ARQUIVO DE LOGS (error.log)
    // -------------------------------------------------------------------------
    console.log('\n[16] Verificando Integridade do Arquivo de Log (error.log)...');
    const logPath = path.resolve(__dirname, 'logs/error.log');
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      assert(!logContent.includes(novaSenha), 'Nenhuma senha em texto claro gravada no arquivo de logs');
      assert(!logContent.includes(rawTestToken), 'Nenhum token bruto gravado em texto claro no arquivo de logs');
      console.log('✅ OK: Arquivo de log verificado e higienizado com sucesso.');
    } else {
      console.log('ℹ️ Arquivo logs/error.log ainda não gerado ou limpo.');
    }

    console.log('\n================================================================');
    console.log('🎉 TODOS OS TESTES INTEGRADOS DA FASE 8 PASSARAM COM SUCESSO! 🎉');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Erro inesperado na execução da Fase 8:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await db.destroy();
  }
}

runPhase8Tests();
