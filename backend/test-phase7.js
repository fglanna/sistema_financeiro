const http = require('http');
const app = require('./src/app');

let server;
const PORT = 3096;

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

async function runPhase7Tests() {
  console.log('--- INICIANDO TESTES DE INTEGRAÇÃO DA FASE 7 (DASHBOARD, EXTRATO & CSV) ---');
  server = app.listen(PORT, () => {
    console.log(`Servidor de teste ativo na porta ${PORT}`);
  });

  const timestamp = Date.now();
  const testUser = {
    name: 'Ana Carolina Lima',
    email: `ana_phase7_${timestamp}@example.com`,
    password: 'SenhaForte123!',
    initial_balance: 1000.0,
  };

  try {
    // 1. Cadastro
    console.log('\n[1] Cadastrando Usuário de Teste...');
    const regRes = await request('POST', '/api/auth/register', testUser);
    assert(regRes.status === 201, 'Cadastro com status 201');
    const token = regRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Metadados
    console.log('\n[2] Consultando Categorias e Formas de Pagamento...');
    const catRes = await request('GET', '/api/categories', null, authHeaders);
    assert(catRes.status === 200, 'GET /api/categories retorna 200');
    assert(Array.isArray(catRes.data) && catRes.data.length >= 11, 'Retorna categorias padrão');

    const pmRes = await request('GET', '/api/payment-methods', null, authHeaders);
    assert(pmRes.status === 200, 'GET /api/payment-methods retorna 200');
    assert(Array.isArray(pmRes.data) && pmRes.data.length === 6, 'Retorna 6 formas de pagamento');
    const pixMethodId = pmRes.data[0].id;

    // 3. Criação de Categoria Personalizada
    console.log('\n[3] Criando Categoria Personalizada...');
    const customCatRes = await request(
      'POST',
      '/api/categories',
      { name: 'Investimentos em Fundos', type: 'RECEITA' },
      authHeaders
    );
    assert(customCatRes.status === 201, 'POST /api/categories retorna 201');
    const customRevenueCatId = customCatRes.data.id;

    const alimentacaoCat = catRes.data.find(
      (c) => c.name.toLowerCase() === 'alimentação' && c.type === 'DESPESA'
    );
    assert(alimentacaoCat, 'Categoria padrão Alimentação (DESPESA) encontrada');

    // 4. Teste de Bloqueio RN08 (Incompatibilidade de Tipo)
    console.log('\n[4] Validando RN08: Incompatibilidade de Tipo...');
    const invalidTxRes = await request(
      'POST',
      '/api/transactions',
      {
        description: 'Supermercado Mensal',
        amount: 350.0,
        type: 'DESPESA',
        category_id: customRevenueCatId, // Categoria é de RECEITA!
        payment_method_id: pixMethodId,
        due_date: '2026-10-10',
        status: 'PENDENTE',
      },
      authHeaders
    );
    assert(invalidTxRes.status === 400, 'RN08: Rejeitado com status 400 por categoria incompatível');

    // 5. Inserção de Transações Válidas
    console.log('\n[5] Criando Lançamentos para o Mês 10/2026...');
    // Receita Paga: +R$ 2.000,00
    const t1 = await request(
      'POST',
      '/api/transactions',
      {
        description: 'Dividendos de Ações',
        amount: 2000.0,
        type: 'RECEITA',
        category_id: customRevenueCatId,
        payment_method_id: pixMethodId,
        due_date: '2026-10-05',
        status: 'PAGO',
        payment_date: '2026-10-05',
      },
      authHeaders
    );
    assert(t1.status === 201, 'T1 Receita Paga criada');

    // Despesa Paga: -R$ 400,00
    const t2 = await request(
      'POST',
      '/api/transactions',
      {
        description: 'Compras de Alimentos',
        amount: 400.0,
        type: 'DESPESA',
        category_id: alimentacaoCat.id,
        payment_method_id: pixMethodId,
        due_date: '2026-10-10',
        status: 'PAGO',
        payment_date: '2026-10-10',
      },
      authHeaders
    );
    assert(t2.status === 201, 'T2 Despesa Paga criada');

    // Despesa Pendente do mês: -R$ 300,00
    const t3 = await request(
      'POST',
      '/api/transactions',
      {
        description: 'Conta de Energia',
        amount: 300.0,
        type: 'DESPESA',
        category_id: alimentacaoCat.id,
        payment_method_id: pixMethodId,
        due_date: '2026-10-28',
        status: 'PENDENTE',
      },
      authHeaders
    );
    assert(t3.status === 201, 'T3 Despesa Pendente criada');

    // 6. Teste de Consulta do Dashboard (RN02 e RN03)
    console.log('\n[6] Consultando Dashboard para 10/2026 (Validação RN02 e RN03)...');
    const dashRes = await request('GET', '/api/dashboard?month=10&year=2026', null, authHeaders);
    assert(dashRes.status === 200, 'GET /api/dashboard retorna 200');
    const kpis = dashRes.data.kpis || dashRes.data;
    // Saldo Inicial = 1000. Saldo Atual = 1000 + 2000 - 400 = 2600.
    assert(kpis.current_balance === 2600.0, 'RN02: Saldo Atual deve ser exatamente R$ 2600.00');
    // Saldo Previsto = Saldo Atual (2600) + Receitas Pendentes (0) - Despesas Pendentes (300) = 2300.
    assert(kpis.forecasted_balance === 2300.0, 'RN03: Saldo Previsto deve ser exatamente R$ 2300.00');
    assert(kpis.total_income_month === 2000.0, 'Total de receitas do mês = 2000.00');
    assert(kpis.total_expense_month === 700.0, 'Total de despesas do mês = 700.00');

    // 7. Duplicação de Transação via duplicate-draft (Fluxo 3)
    console.log('\n[7] Testando Duplicação em Rascunho (duplicate-draft)...');
    const draftRes = await request(
      'GET',
      `/api/transactions/${t2.data.id}/duplicate-draft`,
      null,
      authHeaders
    );
    assert(draftRes.status === 200, 'duplicate-draft retorna 200');
    assert(draftRes.data.description === 'Compras de Alimentos', 'Descrição original preservada');
    assert(draftRes.data.amount === 400.0, 'Valor preservado');
    assert(draftRes.data.status === 'PENDENTE', 'Rascunho inicia com status PENDENTE');

    // 8. Teste de Exportação CSV em Memória (RN09)
    console.log('\n[8] Testando Exportação CSV via Stream de Memória (RN09)...');
    const csvRes = await request(
      'GET',
      '/api/transactions/export/csv?month=10&year=2026',
      null,
      authHeaders
    );
    assert(csvRes.status === 200, 'GET /api/transactions/export/csv retorna 200');
    assert(
      csvRes.headers['content-type'] && csvRes.headers['content-type'].includes('text/csv'),
      'Content-Type é text/csv'
    );
    assert(
      csvRes.headers['content-disposition'] &&
        csvRes.headers['content-disposition'].includes('extrato_2026_10.csv'),
      'Content-Disposition define nome do arquivo extrato_2026_10.csv'
    );

    // 9. Exclusão em Cascata (RN10)
    console.log('\n[9] Limpando Dados de Teste via Exclusão em Cascata (RN10)...');
    const delRes = await request('DELETE', '/api/users/me', null, authHeaders);
    assert(delRes.status === 200, 'DELETE /api/users/me executado com sucesso');

    console.log('\n🎉 TODOS OS TESTES DA FASE 7 PASSARAM COM 100% DE SUCESSO! 🎉\n');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante os testes da Fase 7:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runPhase7Tests();
