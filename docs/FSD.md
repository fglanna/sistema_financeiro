# DOCUMENTO DE ESPECIFICAÇÃO FUNCIONAL (FSD)

## Sistema de Controle Financeiro Pessoal

---

## 1. Visão Geral do Sistema

O Sistema de Controle Financeiro Pessoal é uma aplicação web desacoplada (Fullstack SPA + API REST) voltada ao gerenciamento de finanças pessoais com precisão, agilidade e alta usabilidade. O sistema oferece controle completo sobre movimentações de receitas e despesas, organização por categorias (padrão e personalizadas) e formas de pagamento, acompanhamento de KPIs de saldos atual e previsto, visualização gráfica de despesas por categoria, extrato detalhado com busca e filtros, exportação em planilha CSV e envio automatizado de alertas de vencimento por e-mail.

---

## 2. Arquitetura e Estrutura Técnica

### 2.1. Arquitetura Geral

A aplicação adota uma arquitetura Fullstack JavaScript desacoplada:

* **Frontend:** Single Page Application (SPA) construída em React, estilizada com Tailwind CSS, ícones da biblioteca Lucide React e gráficos com Recharts.
* **Backend:** API REST desenvolvida em Node.js com Express.js, estruturada em camadas lógicas inspiradas no padrão MVC:
* **Routes:** Mapeamento dos endpoints REST e associação com middlewares de autenticação e limitação de taxa (*rate limiting*).
* **Middlewares:** Processamento intermediário para verificação de tokens JWT, sanitização e controle de taxa de requisições.
* **Controllers:** Recepção das requisições HTTP, validação preliminar dos dados de entrada e formatação das respostas JSON.
* **Services (Camada de Negócio):** Concentração das regras de negócio, cálculos de saldos, validações de compatibilidade entre entidades e orquestração de operações.
* **Repositories (Camada de Dados):** Execução de consultas e instruções SQL parametrizadas via Knex.js com PostgreSQL, garantindo o isolamento estrito por usuário (`user_id`).



```
[ Frontend React SPA ] 
        │ (HTTP/HTTPS REST + Bearer Token JWT)
        ▼
[ API Express.js (Backend Node.js) ]
  ├── Middlewares (Auth, Rate Limiting)
  ├── Controllers
  ├── Services (Regras de Negócio & Validações)
  └── Repositories (Knex.js Query Builder)
        │
        ▼
[ Banco de Dados PostgreSQL ]

```

### 2.2. Tecnologias e Dependências

* **Linguagem Backend:** Node.js (v18+)
* **Framework Web:** Express.js
* **Banco de Dados:** PostgreSQL
* **Query Builder / Migrations:** Knex.js
* **Driver Banco de Dados:** `pg`
* **Criptografia de Senhas:** `bcrypt`
* **Autenticação:** `jsonwebtoken` (JWT)
* **Rate Limiting:** `express-rate-limit`
* **Serviço de E-mail:** `nodemailer`
* **Agendador de Tarefas Background:** `node-cron`
* **Frontend Framework:** React
* **Estilização:** Tailwind CSS
* **Biblioteca de Ícones:** `lucide-react`
* **Biblioteca de Gráficos:** `recharts`

---

## 3. Escopo Funcional e Módulos do Sistema

### 3.1. Módulo 1: Autenticação, Perfil e Gerenciamento de Conta

* Cadastro de novo usuário informando Nome, E-mail, Senha e Saldo Inicial.
* Autenticação por e-mail e senha com geração de token JWT de 24 horas.
* Solicitação de redefinição de senha com geração de token único e envio por e-mail.
* Redefinição de senha via token válido com invalidação imediata do token após o uso.
* Visualização e atualização de dados de perfil (Nome e Saldo Inicial).
* Exclusão definitiva de conta com remoção em cascata dos dados associados.

### 3.2. Módulo 2: Lançamentos Financeiros (Receitas e Despesas)

* Registro de lançamentos do tipo `RECEITA` ou `DESPESA`.
* Atribuição de Descrição, Valor, Categoria, Forma de Pagamento, Status (`PAGO` ou `PENDENTE`), Data de Vencimento e Data de Pagamento/Recebimento (quando pago).
* Edição completa de lançamentos existentes.
* Exclusão física de lançamentos.
* Geração de rascunho para duplicação de lançamentos via consulta `GET`, preservando a descrição e dados originais.

### 3.3. Módulo 3: Categorias e Formas de Pagamento

* **Categorias Padrão do Sistema:** Disponibilizadas globalmente para todos os usuários em modo somente leitura (`is_default = TRUE`, `user_id IS NULL`). Não podem ser editadas nem excluídas pelos usuários.
* **Categorias Personalizadas:** Criadas individualmente por cada usuário (`is_default = FALSE`, `user_id IS NOT NULL`). Permitem edição de nome e exclusão (desde que não possuam lançamentos vinculados).
* Restrição de exclusão (`ON DELETE RESTRICT`) e restrição de alteração de tipo (`type`) em categorias personalizadas com histórico de lançamentos.
* Utilização de domínio fixo e padronizado para Formas de Pagamento (Pix, Cartão de Crédito, Cartão de Débito, Dinheiro, Boleto, Transferência).

### 3.4. Módulo 4: Dashboard, Extrato e Relatórios

* Apresentação de KPIs: Saldo Atual, Saldo Previsto, Total de Entradas e Total de Saídas do mês.
* Gráfico do tipo rosca com o agrupamento de despesas do mês por categoria.
* Bloco de alertas em destaque para contas vencidas e a vencer no dia.
* Extrato mensal de movimentações com ordenação por vencimento.
* Busca por palavra-chave na descrição do lançamento e filtro por categoria.
* Destaque visual diferenciado para contas pendentes com data de vencimento expirada em relação à data atual.
* Exportação dos dados do extrato filtrado para arquivo CSV gerado em memória.

### 3.5. Módulo 5: Serviços de Background (Notificações)

* Varredura diária automatizada via tarefa agendada (Cron) executada às 06:00 AM (fuso horário `America/Sao_Paulo`).
* Identificação de lançamentos pendentes vencidos ou com vencimento para a data atual.
* Agrupamento dos alertas por usuário e envio consolidado via e-mail SMTP.

---

## 4. Telas e Interfaces do Usuário

A interface adota o estilo visual *Executive Precision*, priorizando clareza, alta densidade de informação e numerais tabulares (`font-variant-numeric: tabular-nums`) em tabelas e KPIs.

### 4.1. Tela 1: Login (`/login`)

* **Componentes:** Formulário centralizado com campos E-mail, Senha, botão "Entrar" e links para "Cadastre-se" e "Esqueci minha senha".
* **Comportamentos:** Validação de formato de e-mail; exibição de mensagens de erro claras (ex.: credenciais inválidas ou limite de tentativas excedido).

### 4.2. Tela 2: Cadastro de Usuário (`/register`)

* **Componentes:** Campos Nome Completo, E-mail, Senha, Confirmação de Senha, Saldo Inicial (R$) e botão "Criar Conta".
* **Comportamentos:** Validação de correspondência de senha; saldo inicial padrão em R$ 0,00 se não informado; redirecionamento automático para o Dashboard após cadastro.

### 4.3. Tela 3: Solicitação de Redefinição de Senha (`/forgot-password`)

* **Componentes:** Campo E-mail e botão "Enviar Link de Recuperação".
* **Comportamentos:** Exibição de mensagem de confirmação genérica por questões de segurança (independentemente de o e-mail estar cadastrado na base).

### 4.4. Tela 4: Redefinição de Senha (`/reset-password?token=...`)

* **Componentes:** Campos Nova Senha, Confirmação de Nova Senha e botão "Redefinir Senha".
* **Comportamentos:** Leitura do parâmetro `token` presente na URL de navegação; envio do valor do token no corpo da requisição HTTP `POST /api/auth/reset-password`; validação de tamanho mínimo de senha.

### 4.5. Tela 5: Dashboard Financeiro (`/dashboard`)

* **Componentes:**
* Seletor de Período: Navegação por mês/ano (ex.: "Setembro / 2026").
* Cards de KPI:
* **Saldo Atual:** Destaque para o valor acumulado efetivo.
* **Saldo Previsto:** Projeção considerando pendências do mês.
* **Entradas do Mês:** Soma das receitas do período.
* **Saídas do Mês:** Soma das despesas do período.


* Gráfico de Despesas por Categoria: Gráfico em formato rosca (`Recharts`) detalhando o percentual e valor de cada categoria de despesa.
* Painel de Alertas: Lista resumida de lançamentos com status `PENDENTE` cuja data de vencimento seja menor ou igual à data atual.



### 4.6. Tela 6: Extrato e Lançamentos (`/transactions`)

* **Componentes:**
* Barra de Ferramentas: Botão "+ Novo Lançamento", Campo de Busca Textual (filtra por descrição), Filtro Dropdown por Categoria e Botão "Exportar em CSV".
* Tabela Compacta de Lançamentos:
* Colunas: Status, Vencimento, Descrição, Categoria, Forma de Pagamento, Valor, Ações (Editar, Duplicar, Excluir).
* Status estilizado em badge tipo *pill* (verde para `PAGO`, amarelo para `PENDENTE`).
* Destaque em texto/fundo vermelho para lançamentos com status `PENDENTE` e vencimento expirado em relação à data atual.




* **Modal de Formulário (Novo / Edição / Duplicação):**
* Campos: Tipo (`RECEITA` / `DESPESA`), Descrição, Valor, Categoria (filtrada dinamicamente pelo Tipo selecionado, exibindo categorias padrão e personalizadas do usuário), Forma de Pagamento, Data de Vencimento, Status (`PAGO` / `PENDENTE`) e Data de Pagamento/Recebimento (habilitada apenas quando Status = `PAGO`).



### 4.7. Tela 7: Perfil do Usuário (`/profile`)

* **Componentes:**
* Formulário de Edição de Perfil: Edição do Nome e ajuste do Saldo Inicial.
* Seção de Segurança / Área Destrutiva: Botão "Excluir Minha Conta".


* **Modal de Confirmação de Exclusão:** Alerta explícito informando sobre a remoção definitiva e irreversível de todas as movimentações e dados da conta.

---

## 5. Fluxos Detalhados do Sistema

### Fluxo 1: Cadastro e Inicialização de Conta

1. O usuário acessa a página `/register` e preenche Nome, E-mail, Senha e Saldo Inicial.
2. O frontend envia a requisição para `POST /api/auth/register`.
3. O backend verifica a unicidade do e-mail. Se já existir, retorna `409 Conflict`.
4. O backend gera o hash da senha via `bcrypt` (fator de custo 10) e insere o novo registro na tabela `users`.
5. O backend emite um token JWT de autenticação e retorna a resposta `201 Created`.
6. O frontend armazena o token e redireciona o usuário diretamente para o `/dashboard`.

### Fluxo 2: Registro e Edição de Lançamento

1. No extrato ou dashboard, o usuário clica em "Novo Lançamento" ou "Editar" em uma linha existente.
2. O modal exibe o formulário. Ao alterar o Tipo (`RECEITA` ou `DESPESA`), o combo de Categorias é atualizado imediatamente exibindo apenas categorias (padrão e personalizadas) compatíveis.
3. Se o Status for alterado para `PAGO`, o campo Data de Pagamento/Recebimento torna-se obrigatório. Se for alterado para `PENDENTE`, a Data de Pagamento é limpa (`NULL`).
4. Ao clicar em "Salvar", o frontend envia `POST /api/transactions` (novo) ou `PUT /api/transactions/:id` (edição).
5. A camada de Service do backend valida se `category.type === transaction.type`. Se incompatível, rejeita com `400 Bad Request`.
6. Após a gravação, o backend retorna `200 OK` ou `201 Created`. O frontend fecha o modal e recarrega os dados do Dashboard/Extrato.

### Fluxo 3: Duplicação de Lançamento

1. Na linha do extrato, o usuário clica na ação "Duplicar".
2. O frontend realiza uma requisição HTTP `GET /api/transactions/:id/duplicate-draft`.
3. O backend busca a transação original, verifica a propriedade do registro (`user_id`), monta um objeto JSON de rascunho em memória (preservando a Descrição original, Valor, Categoria, Forma de Pagamento e Tipo, definindo Status como `PENDENTE` e sem persistir no banco) e retorna `200 OK`.
4. O frontend carrega o rascunho no formulário do modal, permitindo que o usuário edite qualquer campo antes do envio.
5. Ao clicar em "Salvar", o frontend envia os dados via `POST /api/transactions`.
6. O backend insere o novo registro no banco de dados e retorna `201 Created`.

### Fluxo 4: Solicitação e Redefinição de Senha

1. O usuário solicita a redefinição em `/forgot-password` informando o e-mail.
2. O backend processa a rota `POST /api/auth/forgot-password` (sujeita ao limite de taxa de 5 req / 15 min por IP).
3. Se o e-mail existir, o backend gera um token aleatório seguro, grava seu hash SHA-256 na tabela `password_reset_tokens` com expiração para 1 hora (`expires_at`) e `used = FALSE`, e envia um e-mail com o link contendo a URL `/reset-password?token=<valor_do_token>`.
4. O usuário clica no link e a SPA React renderiza a página de redefinição capturando o token da URL.
5. O usuário informa a nova senha e envia para `POST /api/auth/reset-password` contendo o token e a nova senha no corpo da requisição.
6. O backend valida o token (hash correspondente, `used = FALSE` e `expires_at > NOW()`).
7. O backend atualiza o `password_hash` do usuário na tabela `users` e altera o registro em `password_reset_tokens` definindo `used = TRUE` para invalidar imediatamente o reuso.

### Fluxo 5: Visualização do Dashboard e Cálculo dos Saldos

1. O usuário acessa `/dashboard` para o mês/ano selecionado.
2. O frontend faz a requisição `GET /api/dashboard?month=MM&year=YYYY`.
3. O backend executa a camada Service que recupera o `initial_balance` do usuário.
4. Aplica as fórmulas de **Saldo Atual** (RN02) e **Saldo Previsto** (RN03).
5. Calcula os somatórios do mês por categoria e identifica movimentações pendentes vencidas/a vencer.
6. Retorna o JSON formatado e o frontend renderiza os cards de KPI, o gráfico Recharts e a lista de alertas.

### Fluxo 6: Extrato com Filtro e Exportação CSV em Memória

1. O usuário navega em `/transactions`, seleciona o período e aplica buscas ou filtros.
2. Ao clicar em "Exportar em CSV", o frontend efetua um download chamando `GET /api/transactions/export/csv?month=MM&year=YYYY&search=...&category_id=...`.
3. O backend busca os registros correspondentes respeitando o filtro ativo.
4. A camada Service formata o texto no padrão CSV em um buffer/stream de memória sem gravar nenhum arquivo no disco rígido do servidor.
5. O backend responde com os cabeçalhos `Content-Type: text/csv` e `Content-Disposition: attachment; filename="extrato_YYYY_MM.csv"`.

### Fluxo 7: Worker Cron Diário de Notificações por E-mail

1. Diariamente às 06:00 AM (`America/Sao_Paulo`), a biblioteca `node-cron` dispara a execução do Worker.
2. O Worker consulta no PostgreSQL todas as transações com status `PENDENTE` e `due_date <= CURRENT_DATE`.
3. Agrupa as movimentações pendentes por `user_id` e recupera o e-mail e nome dos respectivos usuários.
4. Para cada usuário com pendências, o serviço `nodemailer` dispara um e-mail HTML com a listagem resumida dos débitos/créditos em aberto.

### Fluxo 8: Exclusão Definitiva de Conta (RN10)

1. No perfil (`/profile`), o usuário clica em "Excluir Minha Conta".
2. O modal de confirmação é exibido exigindo ação explícita.
3. O frontend chama `DELETE /api/users/me`.
4. O backend registra previamente o evento de auditoria na tabela `security_logs` com `event_type = 'ACCOUNT_DELETED'` preservando o `user_id` original (ou executa a gravação com `user_id = NULL` imediatamente após a deleção dentro da transação do banco).
5. O backend executa a instrução SQL `DELETE FROM users WHERE id = :user_id`.
6. A restrição `ON DELETE CASCADE` do PostgreSQL exclui automaticamente todas as transações, categorias personalizadas e tokens de redefinição associados.
7. O backend responde com `200 OK`.
8. O frontend limpa o token de autenticação e redireciona para a tela de login.

---

## 6. Regras de Negócio e Validações

* **RN01 (Isolamento de Acesso e Domínio de Dados):** Os dados pertencentes ao usuário devem ser sempre filtrados pelo `user_id` derivado exclusivamente do token JWT autenticado. Categorias padrão, identificadas por `is_default = TRUE` e `user_id IS NULL`, constituem domínio global somente leitura e podem ser consultadas por qualquer usuário autenticado.
* **RN02 (Cálculo do Saldo Atual):**

$$\text{Saldo Atual} = \text{Saldo Inicial} + \text{Total Receitas Pagas/Recebidas} - \text{Total Despesas Pagas}$$



Considera estritamente lançamentos com status `PAGO` e data de pagamento igual ou anterior à data atual (`payment_date <= CURRENT_DATE`) desde o início do histórico da conta até a presente data.
* **RN03 (Cálculo do Saldo Previsto):**

$$\text{Saldo Previsto} = \text{Saldo Atual} + \text{Receitas Pendentes do Mês Selecionado} - \text{Despesas Pendentes do Mês Selecionado}$$



Considera o Saldo Atual somado ao resultado das movimentações com status `PENDENTE` do mês de referência consultado.
* **RN04 (Ponto de Partida do Saldo Inicial):** O Saldo Inicial é informado no cadastro (ou ajustado no Perfil) e atua como valor base inalterável pelos lançamentos.
* **RN05 (Preenchimento de Datas e Status):**
* O campo `due_date` (Data de Vencimento) é obrigatório para todo lançamento.
* Se o status for `PAGO`, o campo `payment_date` (Data de Pagamento/Recebimento) é obrigatório.
* Se o status for `PENDENTE`, o campo `payment_date` deve ser obrigatoriamente `NULL`.


* **RN06 (Destaque de Contas Atrasadas):** Lançamentos com status `PENDENTE` cuja `due_date` seja menor que a data atual (`due_date < CURRENT_DATE`) devem ser exibidos com destaque em cor vermelha no extrato do mês de seu vencimento.
* **RN07 (Horário de Notificação por E-mail):** O envio de lembretes por e-mail deve ser executado impreterivelmente às 06:00 AM no fuso horário `America/Sao_Paulo`.
* **RN08 (Regras de Categorias e Compatibilidade Categoria x Tipo):**
1. **Categorias Padrão vs. Personalizadas:** As categorias padrão (`is_default = TRUE`, `user_id IS NULL`) são globais e estão disponíveis apenas para leitura. Usuários não podem editar ou excluir categorias padrão. As categorias personalizadas (`is_default = FALSE`, `user_id IS NOT NULL`) pertencem ao usuário criador e podem ser gerenciadas por ele.
2. **Compatibilidade Lançamento x Categoria:** O tipo (`RECEITA` ou `DESPESA`) do lançamento deve ser idêntico ao tipo da categoria vinculada. A verificação `category.type === transaction.type` **deve ser obrigatoriamente executada na camada Service do backend** antes de qualquer instrução de inserção ou atualização no banco.
3. **Bloqueio de Alteração de Tipo:** Uma categoria personalizada que possua qualquer lançamento financeiro vinculado **não pode ter seu campo `type` alterado**. Tentativas de alterar o tipo de uma categoria que possui lançamentos associados devem ser bloqueadas com retorno HTTP `400 Bad Request` ou `409 Conflict`.
4. **Bloqueio de Exclusão:** Categorias personalizadas vinculadas a lançamentos não podem ser excluídas (`ON DELETE RESTRICT`).


* **RN09 (Escopo do Extrato e Exportação CSV):** A exportação de dados em CSV deve contemplar exatamente o período e os filtros aplicados na interface no momento do download.
* **RN10 (Exclusão Definitiva em Cascata):** A exclusão da conta do usuário apaga permanentemente do banco de dados a totalidade de seus registros por meio de chaves estrangeiras configuradas com `ON DELETE CASCADE`. O evento de auditoria é registrado no log de segurança no momento da deleção.

---

## 7. Autenticação, Sessão e Controle de Acesso

* **Mecanismo:** Token JSON Web Token (JWT) assinado com chave secreta definida nas variáveis de ambiente (`JWT_SECRET`).
* **Validade do Token:** 24 horas a contar da emissão.
* **Formato do Header HTTP:** `Authorization: Bearer <token_jwt>`
* **Payload do Token:** `{ "user_id": "UUID", "email": "string", "iat": timestamp, "exp": timestamp }`
* **Controle de Acesso (RBAC):** Perfil único de Usuário Comum. Cada usuário possui acesso exclusivo aos seus próprios recursos.
* **Tratamento de Sessão Expirada:** O frontend intercepta respostas HTTP `401 Unauthorized`, limpa o token armazenado e redireciona a interface para `/login`.

---

## 8. Modelo de Dados Relacional (PostgreSQL DDL)

```sql
-- Função para atualização automática da coluna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de Usuários (Possui updated_at)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de Categorias (Possui updated_at)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('RECEITA', 'DESPESA')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_category_owner CHECK (
        (is_default = TRUE AND user_id IS NULL) OR 
        (is_default = FALSE AND user_id IS NOT NULL)
    )
);

CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON categories 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de Formas de Pagamento (Domínio Fixo / Sem updated_at)
CREATE TABLE payment_methods (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

-- Inserção do Domínio Fixo de Formas de Pagamento
INSERT INTO payment_methods (id, name) VALUES
(1, 'Pix'),
(2, 'Cartão de Crédito'),
(3, 'Cartão de Débito'),
(4, 'Dinheiro'),
(5, 'Boleto'),
(6, 'Transferência');

-- Inserção das Categorias Padrão do Sistema (is_default = TRUE, user_id = NULL)
INSERT INTO categories (name, type, is_default, user_id) VALUES
-- Categorias Padrão de Receita
('Salário', 'RECEITA', TRUE, NULL),
('Freelance', 'RECEITA', TRUE, NULL),
('Prestação de Serviços', 'RECEITA', TRUE, NULL),
('Outras Receitas', 'RECEITA', TRUE, NULL),
-- Categorias Padrão de Despesa
('Alimentação', 'DESPESA', TRUE, NULL),
('Moradia', 'DESPESA', TRUE, NULL),
('Transporte', 'DESPESA', TRUE, NULL),
('Saúde', 'DESPESA', TRUE, NULL),
('Lazer', 'DESPESA', TRUE, NULL),
('Educação', 'DESPESA', TRUE, NULL),
('Outras Despesas', 'DESPESA', TRUE, NULL);

-- Tabela de Lançamentos Financeiros (Possui updated_at)
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    payment_method_id SMALLINT NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
    description VARCHAR(150) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('RECEITA', 'DESPESA')),
    status VARCHAR(10) NOT NULL CHECK (status IN ('PAGO', 'PENDENTE')),
    due_date DATE NOT NULL,
    payment_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payment_date_status CHECK (
        (status = 'PENDENTE' AND payment_date IS NULL) OR
        (status = 'PAGO' AND payment_date IS NOT NULL)
    )
);

CREATE TRIGGER update_transactions_updated_at 
BEFORE UPDATE ON financial_transactions 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de Tokens de Redefinição de Senha (Sem updated_at - Registro imutável de uso único)
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Logs de Segurança (Sem updated_at - Registro de auditoria imutável)
CREATE TABLE security_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    details JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices Recomendados para Otimização de Performance
CREATE INDEX idx_transactions_user_due ON financial_transactions (user_id, due_date);
CREATE INDEX idx_transactions_user_status ON financial_transactions (user_id, status);
CREATE INDEX idx_transactions_user_category ON financial_transactions (user_id, category_id);
CREATE INDEX idx_categories_user_type ON categories (user_id, type);

```

---

## 9. Contrato de APIs REST (Endpoints)

### 9.1. Módulo de Autenticação

#### `POST /api/auth/register`

* **Descrição:** Realiza o cadastro inicial de um usuário.
* **Body:**

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "SenhaSegura123",
  "initial_balance": 1500.00
}

```

* **Respostas:** `201 Created` (com Token JWT e dados do perfil) ou `409 Conflict` (e-mail já cadastrado).

#### `POST /api/auth/login`

* **Descrição:** Autentica o usuário e emite o token JWT.
* **Rate Limit:** **5 requisições por janela de 15 minutos por IP** via `express-rate-limit`.
* **Body:**

```json
{
  "email": "maria@example.com",
  "password": "SenhaSegura123"
}

```

* **Respostas:** `200 OK` (retorna Token JWT e perfil do usuário), `401 Unauthorized` ou `429 Too Many Requests`.

#### `POST /api/auth/forgot-password`

* **Descrição:** Solicita o envio de e-mail com link para redefinição de senha.
* **Rate Limit:** **5 requisições por janela de 15 minutos por IP** via `express-rate-limit`.
* **Body:**

```json
{
  "email": "maria@example.com"
}

```

* **Respostas:** `200 OK` (mensagem genérica de confirmação enviada) ou `429 Too Many Requests`.

#### `POST /api/auth/reset-password`

* **Descrição:** Redefine a senha do usuário consumindo o token.
* **Body:**

```json
{
  "token": "valor_do_token_recebido_no_link",
  "new_password": "NovaSenhaSegura123"
}

```

* **Regra do Token:** Valida se `token_hash` corresponde, se `used = FALSE` e `expires_at > NOW()`. Após atualizar a senha do usuário, define obrigatoriamente `used = TRUE` na tabela `password_reset_tokens`.
* **Respostas:** `200 OK` ou `400 Bad Request` (token inválido, expirado ou já utilizado).

---

### 9.2. Módulo de Usuário e Perfil

#### `GET /api/users/me`

* **Autenticação:** Requer Bearer Token JWT.
* **Descrição:** Retorna as informações do perfil do usuário autenticado.
* **Respostas:** `200 OK` com payload:

```json
{
  "id": "uuid-do-usuario",
  "name": "Maria Silva",
  "email": "maria@example.com",
  "initial_balance": 1500.00
}

```

#### `PUT /api/users/me`

* **Autenticação:** Requer Bearer Token JWT.
* **Body:**

```json
{
  "name": "Maria Silva Santos",
  "initial_balance": 2000.00
}

```

* **Respostas:** `200 OK` com os dados do perfil atualizados.

#### `DELETE /api/users/me`

* **Autenticação:** Requer Bearer Token JWT.
* **Descrição:** Exclui definitivamente a conta do usuário e todos os dados vinculados (RN10).
* **Respostas:** `200 OK`.

---

### 9.3. Módulo de Categorias e Formas de Pagamento

#### `GET /api/categories`

* **Autenticação:** Requer Bearer Token JWT.
* **Descrição:** Retorna a lista consolidada das categorias padrão do sistema (`is_default = TRUE`) juntamente com as categorias personalizadas do usuário autenticado (`user_id = :user_id`).
* **Respostas:** `200 OK`.

#### `POST /api/categories`

* **Autenticação:** Requer Bearer Token JWT.
* **Body:**

```json
{
  "name": "Consultoria Técnica",
  "type": "RECEITA"
}

```

* **Respostas:** `201 Created` (cria categoria personalizada com `is_default = FALSE` e `user_id` do token).

#### `PUT /api/categories/:id`

* **Autenticação:** Requer Bearer Token JWT.
* **Body:**

```json
{
  "name": "Prestação de Serviços Especializados",
  "type": "RECEITA"
}

```

* **Regra de Bloqueio (I1 / RN08):** Permite apenas alteração em categorias personalizadas do próprio usuário. Se houver tentativas de alterar o campo `type` (`RECEITA` $\leftrightarrow$ `DESPESA`) de uma categoria personalizada que já possua lançamentos associados na tabela `financial_transactions`, a operação é bloqueada retornando HTTP `400 Bad Request` ou `409 Conflict`.
* **Respostas:** `200 OK`, `400 Bad Request` ou `409 Conflict`.

#### `DELETE /api/categories/:id`

* **Autenticação:** Requer Bearer Token JWT.
* **Regra de Bloqueio:** Bloqueado para categorias padrão ou categorias personalizadas que possuam lançamentos vinculados (`ON DELETE RESTRICT`).
* **Respostas:** `200 OK` ou `400 Bad Request`.

#### `GET /api/payment-methods`

* **Autenticação:** Requer Bearer Token JWT.
* **Descrição:** Retorna a lista de formas de pagamento do domínio fixo.
* **Respostas:** `200 OK`.

---

### 9.4. Módulo de Lançamentos Financeiros

#### `GET /api/transactions`

* **Autenticação:** Requer Bearer Token JWT.
* **Query Params:** `month` (MM), `year` (YYYY), `search` (opcional), `category_id` (opcional).
* **Respostas:** `200 OK` (lista de lançamentos do período ordenados por `due_date`).

#### `POST /api/transactions`

* **Autenticação:** Requer Bearer Token JWT.
* **Body:**

```json
{
  "description": "Supermercado",
  "amount": 350.50,
  "type": "DESPESA",
  "category_id": "uuid-da-categoria",
  "payment_method_id": 1,
  "status": "PAGO",
  "due_date": "2026-09-15",
  "payment_date": "2026-09-14"
}

```

* **Validação de Serviço (M1 / RN08):** A camada Service valida obrigatoriamente se `category.type === transaction.type`.
* **Respostas:** `201 Created` ou `400 Bad Request`.

#### `GET /api/transactions/:id/duplicate-draft`

* **Autenticação:** Requer Bearer Token JWT.
* **Descrição:** Busca a transação original de id `:id` pertencente ao usuário e monta um objeto JSON de rascunho em memória, mantendo a descrição original sem alterar textos, definindo `status = 'PENDENTE'` e `payment_date = null`, sem gravar nada no banco de dados.
* **Respostas:** `200 OK` com a estrutura do rascunho:

```json
{
  "description": "Supermercado",
  "amount": 350.50,
  "type": "DESPESA",
  "category_id": "uuid-da-categoria",
  "payment_method_id": 1,
  "status": "PENDENTE",
  "due_date": "2026-09-26",
  "payment_date": null
}

```

#### `PUT /api/transactions/:id`

* **Autenticação:** Requer Bearer Token JWT.
* **Body:** Objeto com os campos atualizados do lançamento.
* **Validação de Serviço (M1 / RN08):** A camada Service valida se `category.type === transaction.type`.
* **Respostas:** `200 OK` ou `400 Bad Request`.

#### `DELETE /api/transactions/:id`

* **Autenticação:** Requer Bearer Token JWT.
* **Respostas:** `200 OK` (exclusão física do registro).

#### `GET /api/transactions/export/csv`

* **Autenticação:** Requer Bearer Token JWT.
* **Query Params:** `month` (MM), `year` (YYYY), `search` (opcional), `category_id` (opcional).
* **Descrição:** Gera e envia a planilha CSV diretamente via stream/buffer de memória.
* **Respostas:** `200 OK` com `Content-Type: text/csv`.

---

### 9.5. Módulo de Dashboard

#### `GET /api/dashboard`

* **Autenticação:** Requer Bearer Token JWT.
* **Query Params:** `month` (MM), `year` (YYYY).
* **Respostas:** `200 OK` contendo KPIs de saldos, somatório por categoria para o gráfico e lista de alertas de pendências.

```json
{
  "kpis": {
    "current_balance": 4250.00,
    "forecasted_balance": 3800.00,
    "total_income_month": 5000.00,
    "total_expense_month": 1200.00
  },
  "expenses_by_category": [
    { "category_name": "Alimentação", "amount": 600.00, "percentage": 50.0 },
    { "category_name": "Moradia", "amount": 600.00, "percentage": 50.0 }
  ],
  "alerts": [
    {
      "id": "uuid-transacao",
      "description": "Conta de Luz",
      "amount": 150.00,
      "due_date": "2026-09-20",
      "status": "PENDENTE",
      "is_overdue": true
    }
  ]
}

```

---

## 10. Segurança Funcional e Rate Limiting

* **Proteção de Senhas:** Hash seguro com `bcrypt` (fator de custo 10). Senhas em texto claro jamais são persistidas ou registradas em logs.
* **Prevenção de SQL Injection:** A camada de repositório utiliza exclusivamente chamadas parametrizadas via Query Builder Knex.js.
* **CORS (Cross-Origin Resource Sharing):** Configurado no backend para permitir requisições originadas estritamente a partir do domínio cadastrado do frontend SPA React.
* **Rate Limiting (`express-rate-limit`):**
* Aplicação obrigatória do middleware `express-rate-limit` nas rotas sensíveis:
* `POST /api/auth/login`
* `POST /api/auth/forgot-password`


* Parâmetros configurados:
* Window Ms: `15 * 60 * 1000` (15 minutos).
* Max Requests: `5` requisições por endereço IP durante a janela.
* Resposta ao exceder o limite: Status HTTP `429 Too Many Requests` com corpo JSON contendo mensagem amigável de orientação ao usuário.





---

## 11. Auditoria, Logs e Contingência

### 11.1. Carimbos de Auditoria nas Tabelas

As tabelas mutáveis do domínio principal (`users`, `categories` e `financial_transactions`) possuem as colunas `created_at` e `updated_at`, com gatilho PostgreSQL (*Trigger*) configurado para atualização automática de `updated_at`. As tabelas de histórico imutável, tokens temporários, logs ou domínios fixos (`payment_methods`, `password_reset_tokens` e `security_logs`) possuem apenas `created_at` (ou estrutura fixa sem `updated_at`).

### 11.2. Log de Eventos de Segurança

Ações críticas e auditáveis do sistema (como a exclusão definitiva de conta) geram registros na tabela `security_logs` do PostgreSQL, registrando o tipo de evento, `user_id` (preservado antes da exclusão ou registrado como nulo caso ocorra pós-remoção física em cascata), endereço IP e *User-Agent*.

### 11.3. Mecanismo de Log de Erros de Sistema

O tratamento de exceções do sistema é gerenciado de forma centralizada pelo middleware de erro global do Express.js:

* Exceções inesperadas, erros de execução ou falhas técnicas são capturados pelo middleware global de erro.
* O middleware grava os detalhes técnicos do erro (mensagem e *stack trace*) diretamente no arquivo local de log do servidor `backend/logs/error.log` (e no console do ambiente de desenvolvimento).
* Em nenhuma hipótese dados sensíveis do erro técnico ou estruturas internas de banco são expostos na resposta HTTP enviada ao cliente.

---

## 12. Rotinas de Background (Worker Cron)

* **Biblioteca:** `node-cron`
* **Frequência de Execução:** Diária às 06:00 AM (`0 6 * * *`) configurada no fuso horário `America/Sao_Paulo`.
* **Lógica de Processamento:**
1. Consulta a tabela `financial_transactions` buscando registros com `status = 'PENDENTE'` e `due_date <= CURRENT_DATE`.
2. Executa junção (*join*) com a tabela `users` agrupando os pendentes por usuário.
3. Para cada usuário, formata um modelo de e-mail HTML contendo a lista dos lançamentos vencidos ou que vencem na data.
4. Dispara a mensagem via e-mail utilizando `nodemailer` configurado com transporte SMTP.



---

## 13. Exportação de Dados e Tratamento em Memória

* **Diretriz de Arquivos:** O sistema não salva planilhas exportadas nem arquivos temporários no sistema de arquivos do servidor.
* **Processamento:** A geração de dados no formato CSV é feita via construção de buffer/stream diretamente na camada Service do Node.js.
* **Headers HTTP de Resposta:**
* `Content-Type: text/csv; charset=utf-8`
* `Content-Disposition: attachment; filename="extrato_YYYY_MM.csv"`



---

## 14. Organização Sugerida da Implementação

A equipe técnica e os agentes codificadores devem seguir a sequência de desenvolvimento descrita a seguir:

1. **Estruturação do Repositório:** Configuração do projeto com diretórios desacoplados `backend/` e `frontend/`.
2. **Ambiente e Banco de Dados:** Configuração do ambiente PostgreSQL via Docker e inicialização do projeto Node.js.
3. **Arquivo de Configuração Centralizada:** Implementação do módulo `backend/config/config.js` lendo as variáveis de ambiente (`process.env`).
4. **Mecanismo de Migrations via Knex.js:** Criação das migrations em código para a criação das tabelas `users`, `categories`, `payment_methods`, `financial_transactions`, `password_reset_tokens` e `security_logs`.
5. **População de Dados Iniciais (Seeds):** Execução do arquivo de seed para inserção do domínio de `payment_methods` e das categorias padrão em `categories` (excluindo qualquer menção a módulos fora do escopo).
6. **Criação dos Índices:** Execução das instruções DDL de criação dos índices de otimização de performance.
7. **Camada de Repositories:** Implementação do isolamento estrito por `user_id` em todas as consultas SQL via Knex.js, permitindo a leitura global das categorias padrão (`is_default = TRUE`).
8. **Módulo de Autenticação & Rate Limit:** Implementação dos serviços de cadastro, login, redefinição de senha e aplicação do middleware `express-rate-limit` (5 req / 15 min por IP) nas rotas sensíveis.
9. **Camada Service de Categorias:** Implementação da diferenciação entre categorias padrão e personalizadas, além da trava que impede a alteração do tipo de categoria personalizada com lançamentos vinculados.
10. **Camada Service de Lançamentos:** Implementação da validação da regra de negócio `category.type === transaction.type`, CRUD de movimentações e endpoint de rascunho de duplicação `GET /api/transactions/:id/duplicate-draft` (preservando a descrição original).
11. **Lógica de Saldos e Dashboard:** Implementação do cálculo do Saldo Atual com a condição `payment_date <= CURRENT_DATE` (RN02), Saldo Previsto (RN03) e do endpoint `GET /api/dashboard`.
12. **Exportação CSV em Memória:** Implementação da geração de arquivo CSV via buffer/stream no Service de exportação.
13. **Worker Cron de Notificações:** Configuração do agendador `node-cron` e integração com `nodemailer`.
14. **Perfil e Exclusão Definitiva:** Implementação da exclusão da conta do usuário com limpeza em cascata (`ON DELETE CASCADE` / RN10) e registro de auditoria em `security_logs`.
15. **Middleware de Erros e Logs Técnicos:** Configuração do middleware global de exceções registrando falhas no arquivo `backend/logs/error.log`.
16. **Desenvolvimento Frontend React:** Construção da interface SPA React, estilização com Tailwind CSS, ícones Lucide React, gráficos Recharts e integração com os endpoints REST da API.