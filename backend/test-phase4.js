/**
 * Testes Automatizados de Integração — Fase 4: Backend Domínio
 * Categorias, Formas de Pagamento e Lançamentos Financeiros
 */
const http = require('http');
const app = require('./src/app');
const db = require('./src/database/connection');

const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}/api`;

let server;

// Helper para requisições HTTP
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  return { status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ OK: ${message}`);
}

async function runTests() {
  console.log('--- INICIANDO TESTES DA FASE 4 ---');

  // Iniciar servidor em porta temporária
  await new Promise((resolve) => {
    server = http.createServer(app).listen(PORT, () => {
      console.log(`Servidor de teste ativo na porta ${PORT}`);
      resolve();
    });
  });

  try {
    // 1. Cadastrar Usuário A e Usuário B para testar isolamento multi-tenant
    const userAEmail = `test_fase4_userA_${Date.now()}@example.com`;
    const userBEmail = `test_fase4_userB_${Date.now()}@example.com`;

    const regA = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Usuário Teste A',
        email: userAEmail,
        password: 'Password123!',
        initial_balance: 1000,
      },
    });
    assert(regA.status === 201, 'Cadastro do Usuário A realizado com status 201');
    const tokenA = regA.data.token;
    const userIdA = regA.data.user.id;

    const regB = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Usuário Teste B',
        email: userBEmail,
        password: 'Password123!',
        initial_balance: 500,
      },
    });
    assert(regB.status === 201, 'Cadastro do Usuário B realizado com status 201');
    const tokenB = regB.data.token;
    const userIdB = regB.data.user.id;

    const authHeadersA = { Authorization: `Bearer ${tokenA}` };
    const authHeadersB = { Authorization: `Bearer ${tokenB}` };

    // 2. Testar GET /api/payment-methods
    console.log('\n[2] Testando Formas de Pagamento...');
    const pmRes = await request('/payment-methods', { headers: authHeadersA });
    assert(pmRes.status === 200, 'GET /api/payment-methods retorna 200');
    assert(Array.isArray(pmRes.data) && pmRes.data.length === 6, 'Retorna as 6 formas de pagamento do domínio fixo');
    const pixMethod = pmRes.data.find((pm) => pm.name === 'Pix');
    assert(!!pixMethod, 'Pix encontrado nas formas de pagamento');

    // 3. Testar GET /api/categories (Categorias padrão do sistema)
    console.log('\n[3] Testando Listagem de Categorias...');
    const catRes = await request('/categories', { headers: authHeadersA });
    assert(catRes.status === 200, 'GET /api/categories retorna 200');
    assert(Array.isArray(catRes.data) && catRes.data.length >= 11, 'Retorna ao menos 11 categorias padrão');
    const salaryCat = catRes.data.find((c) => c.name === 'Salário' && c.type === 'RECEITA');
    const foodCat = catRes.data.find((c) => c.name === 'Alimentação' && c.type === 'DESPESA');
    assert(!!salaryCat && salaryCat.is_default, 'Categoria padrão de Receita "Salário" encontrada');
    assert(!!foodCat && foodCat.is_default, 'Categoria padrão de Despesa "Alimentação" encontrada');

    // 4. Testar POST /api/categories (Criação de categoria personalizada)
    console.log('\n[4] Testando Criação de Categoria Personalizada...');
    const createCatRes = await request('/categories', {
      method: 'POST',
      headers: authHeadersA,
      body: {
        name: 'Investimentos em Cripto',
        type: 'RECEITA',
      },
    });
    assert(createCatRes.status === 201, 'POST /api/categories retorna 201 para categoria personalizada válida');
    assert(createCatRes.data.name === 'Investimentos em Cripto', 'Nome da categoria criada corresponde ao informado');
    assert(createCatRes.data.is_default === false, 'Categoria personalizada possui is_default = false');
    assert(createCatRes.data.user_id === userIdA, 'Categoria vinculada ao user_id do Usuário A');
    const customCatAId = createCatRes.data.id;

    // Testar validação: tipo inválido
    const invalidCatRes = await request('/categories', {
      method: 'POST',
      headers: authHeadersA,
      body: {
        name: 'Categoria Inválida',
        type: 'OUTRO',
      },
    });
    assert(invalidCatRes.status === 400, 'POST /api/categories com type inválido retorna 400');

    // 5. Testar Isolamento de Categorias (Usuário B não vê a personalizada do Usuário A)
    console.log('\n[5] Testando Multi-tenancy de Categorias...');
    const catResB = await request('/categories', { headers: authHeadersB });
    const foundCustomInB = catResB.data.some((c) => c.id === customCatAId);
    assert(!foundCustomInB, 'Usuário B não tem acesso à categoria personalizada do Usuário A');

    // 6. Testar PUT /api/categories/:id
    console.log('\n[6] Testando Edição de Categoria...');
    // Impedir edição de categoria padrão
    const editDefaultCat = await request(`/categories/${salaryCat.id}`, {
      method: 'PUT',
      headers: authHeadersA,
      body: { name: 'Novo Nome Salário' },
    });
    assert(editDefaultCat.status === 400, 'Edição de categoria padrão retorna 400');

    // Edição permitida de categoria personalizada
    const editCustomCat = await request(`/categories/${customCatAId}`, {
      method: 'PUT',
      headers: authHeadersA,
      body: { name: 'Rendimentos Dividendos' },
    });
    assert(editCustomCat.status === 200, 'Edição de nome de categoria personalizada retorna 200');
    assert(editCustomCat.data.name === 'Rendimentos Dividendos', 'Nome da categoria foi atualizado com sucesso');

    // 7. Testar POST /api/transactions com Validações de Regra de Negócio (RN05 e RN08)
    console.log('\n[7] Testando Criação de Lançamentos Financeiros (RN05 e RN08)...');

    // Regra RN08: Categoria incompatível com tipo do lançamento (DESPESA com categoria de RECEITA)
    const incompatibleTx = await request('/transactions', {
      method: 'POST',
      headers: authHeadersA,
      body: {
        description: 'Supermercado',
        amount: 250.0,
        type: 'DESPESA',
        category_id: salaryCat.id, // Salário é RECEITA!
        payment_method_id: 1,
        status: 'PENDENTE',
        due_date: '2026-10-20',
      },
    });
    assert(incompatibleTx.status === 400, 'RN08: Criar transação com tipo de categoria incompatível retorna 400');

    // Regra RN05: status PAGO sem payment_date deve falhar com 400
    const missingPaymentDateTx = await request('/transactions', {
      method: 'POST',
      headers: authHeadersA,
      body: {
        description: 'Conta de Energia',
        amount: 150.0,
        type: 'DESPESA',
        category_id: foodCat.id,
        payment_method_id: 1,
        status: 'PAGO',
        due_date: '2026-10-15',
        // payment_date ausente
      },
    });
    assert(missingPaymentDateTx.status === 400, 'RN05: Lançamento PAGO sem payment_date retorna 400');

    // Criação válida de DESPESA PAGA com payment_date
    const validExpenseTx = await request('/transactions', {
      method: 'POST',
      headers: authHeadersA,
      body: {
        description: 'Almoço Restaurante',
        amount: 85.5,
        type: 'DESPESA',
        category_id: foodCat.id,
        payment_method_id: 2, // Cartão de Crédito
        status: 'PAGO',
        due_date: '2026-10-10',
        payment_date: '2026-10-09',
      },
    });
    assert(validExpenseTx.status === 201, 'Criar despesa PAGA válida com payment_date retorna 201');
    assert(validExpenseTx.data.description === 'Almoço Restaurante', 'Descrição do lançamento preservada');
    assert(validExpenseTx.data.category_name === 'Alimentação', 'Join com nome da categoria retornado');
    assert(validExpenseTx.data.payment_method_name === 'Cartão de Crédito', 'Join com forma de pagamento retornado');

    // Criação válida de RECEITA PENDENTE vinculada à categoria personalizada
    const validIncomeTx = await request('/transactions', {
      method: 'POST',
      headers: authHeadersA,
      body: {
        description: 'Dividendos de Ações',
        amount: 320.0,
        type: 'RECEITA',
        category_id: customCatAId,
        payment_method_id: 1, // Pix
        status: 'PENDENTE',
        due_date: '2026-10-25',
      },
    });
    assert(validIncomeTx.status === 201, 'Criar receita PENDENTE válida retorna 201');
    assert(validIncomeTx.data.payment_date === null, 'RN05: Lançamento PENDENTE possui payment_date = null');
    const incomeTxId = validIncomeTx.data.id;

    // 8. Testar RN08: Trava de alteração de TYPE em categoria que possui lançamento vinculado
    console.log('\n[8] Testando Bloqueio de Alteração de Tipo em Categoria com Transações (RN08)...');
    const tryChangeCatType = await request(`/categories/${customCatAId}`, {
      method: 'PUT',
      headers: authHeadersA,
      body: {
        type: 'DESPESA', // Categoria era RECEITA e agora tem o lançamento "Dividendos de Ações"
      },
    });
    assert(
      tryChangeCatType.status === 400,
      'RN08: Alterar type de categoria com lançamentos vinculados é bloqueado com 400'
    );

    // Testar Bloqueio de Exclusão de categoria com lançamentos vinculados (RN08 / ON DELETE RESTRICT)
    const tryDeleteCatWithTx = await request(`/categories/${customCatAId}`, {
      method: 'DELETE',
      headers: authHeadersA,
    });
    assert(
      tryDeleteCatWithTx.status === 400,
      'RN08: Excluir categoria com lançamentos vinculados é bloqueado com 400'
    );

    // 9. Testar GET /api/transactions com Filtros
    console.log('\n[9] Testando Consulta e Filtros de Lançamentos...');
    // Filtro por mês e ano
    const filterRes = await request('/transactions?month=10&year=2026', { headers: authHeadersA });
    assert(filterRes.status === 200, 'GET /api/transactions com filtros de mês e ano retorna 200');
    assert(filterRes.data.length === 2, 'Retornou os 2 lançamentos cadastrados para 10/2026');

    // Filtro por busca textual (search)
    const searchRes = await request('/transactions?search=Almoço', { headers: authHeadersA });
    assert(searchRes.status === 200, 'GET /api/transactions com busca retorna 200');
    assert(searchRes.data.length === 1 && searchRes.data[0].description === 'Almoço Restaurante', 'Filtro por busca textual funcionou corretamente');

    // Filtro por categoria
    const catFilterRes = await request(`/transactions?category_id=${customCatAId}`, { headers: authHeadersA });
    assert(catFilterRes.status === 200, 'GET /api/transactions filtrando por category_id retorna 200');
    assert(catFilterRes.data.length === 1 && catFilterRes.data[0].id === incomeTxId, 'Filtro por category_id retornou apenas o lançamento correspondente');

    // 10. Testar Duplicação em Rascunho de Memória (RN08 / Fluxo 3 / FSD 9.4)
    console.log('\n[10] Testando Duplicação em Memória (duplicate-draft)...');
    const draftRes = await request(`/transactions/${incomeTxId}/duplicate-draft`, { headers: authHeadersA });
    assert(draftRes.status === 200, 'GET /transactions/:id/duplicate-draft retorna 200');
    assert(draftRes.data.description === 'Dividendos de Ações', 'Descrição original preservada intacta');
    assert(draftRes.data.amount === 320, 'Valor preservado');
    assert(draftRes.data.status === 'PENDENTE', 'Rascunho configurado com status PENDENTE');
    assert(draftRes.data.payment_date === null, 'Rascunho possui payment_date = null');
    assert(!draftRes.data.id, 'Rascunho em memória não possui id (não foi gravado no banco)');

    // 11. Testar Isolamento Multi-tenant em Lançamentos (RN01)
    console.log('\n[11] Testando Isolamento Multi-tenant (RN01)...');
    // Usuário B tenta consultar listagem -> não deve ver lançamentos de A
    const listB = await request('/transactions', { headers: authHeadersB });
    assert(listB.data.length === 0, 'Usuário B não vê transações do Usuário A');

    // Usuário B tenta acessar transação do Usuário A diretamente por ID
    const getByIdB = await request(`/transactions/${incomeTxId}`, { headers: authHeadersB });
    assert(getByIdB.status === 404, 'Usuário B recebe 404 ao tentar acessar transação de A por ID');

    // Usuário B tenta duplicar transação de A
    const duplicateB = await request(`/transactions/${incomeTxId}/duplicate-draft`, { headers: authHeadersB });
    assert(duplicateB.status === 404, 'Usuário B recebe 404 ao tentar duplicar transação de A');

    // Usuário B tenta editar transação de A
    const updateB = await request(`/transactions/${incomeTxId}`, {
      method: 'PUT',
      headers: authHeadersB,
      body: { description: 'Hackeado' },
    });
    assert(updateB.status === 404, 'Usuário B recebe 404 ao tentar editar transação de A');

    // Usuário B tenta excluir transação de A
    const deleteB = await request(`/transactions/${incomeTxId}`, {
      method: 'DELETE',
      headers: authHeadersB,
    });
    assert(deleteB.status === 404, 'Usuário B recebe 404 ao tentar excluir transação de A');

    // 12. Testar PUT /api/transactions/:id pelo Usuário A
    console.log('\n[12] Testando Atualização de Lançamento...');
    const updateRes = await request(`/transactions/${incomeTxId}`, {
      method: 'PUT',
      headers: authHeadersA,
      body: {
        description: 'Dividendos de Ações (Atualizado)',
        amount: 350.0,
      },
    });
    assert(updateRes.status === 200, 'PUT /transactions/:id retorna 200');
    assert(updateRes.data.description === 'Dividendos de Ações (Atualizado)', 'Descrição atualizada');
    assert(Number(updateRes.data.amount) === 350.0, 'Valor atualizado');

    // 13. Testar DELETE /api/transactions/:id
    console.log('\n[13] Testando Exclusão de Lançamento...');
    const deleteTxRes = await request(`/transactions/${incomeTxId}`, {
      method: 'DELETE',
      headers: authHeadersA,
    });
    assert(deleteTxRes.status === 200, 'DELETE /transactions/:id retorna 200');

    // Agora que o lançamento vinculado foi excluído, a categoria pode ser excluída
    console.log('\n[14] Testando Exclusão de Categoria após desvinculação...');
    const deleteCatNow = await request(`/categories/${customCatAId}`, {
      method: 'DELETE',
      headers: authHeadersA,
    });
    assert(deleteCatNow.status === 200, 'Categoria personalizada excluída com sucesso após remoção do lançamento');

    // 15. Limpeza de Dados de Teste
    console.log('\n[15] Limpando usuários de teste...');
    const delUserA = await request('/users/me', { method: 'DELETE', headers: authHeadersA });
    assert(delUserA.status === 200, 'Usuário A excluído via RN10');
    const delUserB = await request('/users/me', { method: 'DELETE', headers: authHeadersB });
    assert(delUserB.status === 200, 'Usuário B excluído via RN10');

    console.log('\n🎉 TODOS OS TESTES DA FASE 4 FORAM CONCLUÍDOS COM 100% DE SUCESSO! 🎉');
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await db.destroy();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Erro durante a execução dos testes:', err);
  process.exit(1);
});
