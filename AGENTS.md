# AGENTS.md — Guia Operacional para IAs e Desenvolvedores

Este documento estabelece as regras e convenções operacionais para agentes de IA e desenvolvedores que atuam no **Sistema de Controle Financeiro Pessoal**.

---

## 1. Documentos Oficiais de Referência

Antes de iniciar qualquer tarefa ou alteração, é **obrigatório** consultar:

* `docs/FSD.md`: Fonte primária de verdade técnica, arquitetura, schema DDL, regras de negócio e contratos de API.
* `docs/DESIGN.md`: Sistema de design (*Executive Precision*), tokens de cores, tipografia e componentes.
* `docs/INSUMOS.md`: Inventário e diretrizes de uso de arquivos e assets estáticos.
* `docs/PLANO.md`: Planejamento sequencial e escopo de cada fase de desenvolvimento.
* `docs/STATUS.md`: Registro da fase atual, entregas concluídas e próximos passos.
* `docs/ERROS.md`: Registro de incidentes, causas identificadas e soluções aplicadas.

---

## 2. Stack Tecnológica e Arquitetura

* **Modelo:** Arquitetura desacoplada Fullstack JavaScript (SPA + API REST).
* **Backend:**
  * Node.js (v18+) + Express.js.
  * Banco de Dados: PostgreSQL.
  * Camada de Dados: Knex.js Query Builder + Migrations / Seeds (driver `pg`).
  * Autenticação & Criptografia: `jsonwebtoken` (JWT, expiração 24h) e `bcrypt` (fator de custo 10).
  * Rate Limiting: `express-rate-limit` (5 req / 15 min nas rotas de login e recuperação de senha).
  * Worker Background & E-mails: `node-cron` (disparo diário às 06:00 AM America/Sao_Paulo) e `nodemailer`.
* **Frontend:**
  * React (SPA com Vite).
  * Estilização: Tailwind CSS (configurado estritamente com os tokens de `docs/DESIGN.md`).
  * Ícones: `lucide-react`.
  * Visualização de Dados / Gráficos: `recharts`.
* **Infraestrutura Local:**
  * Docker & Docker Compose para execução do container PostgreSQL.

---

## 3. Estrutura de Pastas e Caminhos do Repositório

Todos os caminhos devem ser mantidos estritamente relativos à raiz do projeto:

```
├── AGENTS.md
├── docker-compose.yml
├── assets/
│   ├── logo.png
│   └── logo_branca.png
├── docs/
│   ├── FSD.md
│   ├── DESIGN.md
│   ├── INSUMOS.md
│   ├── PLANO.md
│   ├── STATUS.md
│   ├── ERROS.md
│   ├── code.html
│   └── screen.png
├── backend/
│   ├── .env.example
│   ├── knexfile.js
│   ├── package.json
│   ├── logs/
│   │   └── error.log
│   └── src/
│       ├── config/
│       │   └── config.js
│       ├── controllers/
│       ├── cron/
│       │   └── notificationWorker.js
│       ├── database/
│       │   ├── connection.js
│       │   ├── migrations/
│       │   └── seeds/
│       ├── middlewares/
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   └── rateLimiter.js
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── app.js
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        │   ├── common/
        │   ├── dashboard/
        │   ├── layout/
        │   └── transactions/
        ├── contexts/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── ForgotPassword.jsx
        │   ├── Login.jsx
        │   ├── Profile.jsx
        │   ├── Register.jsx
        │   ├── ResetPassword.jsx
        │   └── Transactions.jsx
        ├── services/
        │   └── api.js
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

---

## 4. Comandos Essenciais de Execução

### 4.1. Infraestrutura do Banco de Dados
* Iniciar PostgreSQL: `docker compose up -d`
* Parar PostgreSQL: `docker compose down`

### 4.2. Backend
* Instalar dependências: `cd backend && npm install`
* Executar migrations: `cd backend && npm run migrate`
* Executar seeds: `cd backend && npm run seed`
* Reverter última migration: `cd backend && npm run migrate:rollback`
* Iniciar servidor em desenvolvimento: `cd backend && npm run dev`
* Iniciar servidor em produção: `cd backend && npm start`

### 4.3. Frontend
* Instalar dependências: `cd frontend && npm install`
* Iniciar servidor de desenvolvimento: `cd frontend && npm run dev`
* Compilar build de produção: `cd frontend && npm run build`
* Pré-visualizar build: `cd frontend && npm run preview`

---

## 5. Diretrizes de Segurança e Boas Práticas

1. **Credenciais e Segredos:**
   * Nunca versione senhas, segredos (`JWT_SECRET`) ou dados reais de conexão no repositório.
   * Utilize arquivos `.env` locais baseados nos arquivos `.env.example`.
2. **Senhas e Criptografia:**
   * Todas as senhas devem ser criptografadas utilizando `bcrypt` com fator de custo 10.
   * Senhas nunca devem trafegar ou ser exibidas em respostas de API ou logs.
3. **Autenticação e Sessão:**
   * Toda rota protegida exige o header `Authorization: Bearer <token_jwt>`.
   * O payload do JWT deve conter apenas `user_id` e `email`.
   * O frontend deve interceptar respostas `401 Unauthorized`, limpar a sessão e redirecionar para `/login`.
4. **Isolamento de Dados (Multi-tenancy Lógico):**
   * Toda consulta no banco de dados deve ser obrigatoriamente filtrada por `user_id` extraído do JWT validado (RN01).
   * Apenas categorias padrão (`is_default = TRUE AND user_id IS NULL`) podem ser lidas por todos os usuários autenticados.
5. **Proteção contra Injeção SQL:**
   * Utilize exclusivamente o Knex.js com queries parametrizadas na camada de Repositories.
6. **Controle de Taxa (Rate Limiting):**
   * As rotas `POST /api/auth/login` e `POST /api/auth/forgot-password` devem aplicar o middleware `express-rate-limit` fixado em 5 requisições por janela de 15 minutos por IP.
7. **CORS:**
   * Permitir requisições estritamente a partir da URL configurada do frontend.
8. **Tratamento e Logs de Erro:**
   * O backend deve capturar exceções globalmente no middleware `errorHandler.js` e gravar mensagens e stack traces em `backend/logs/error.log`.
   * As respostas HTTP de erro devem retornar mensagens seguras ao cliente, sem expor detalhes internos do banco de dados ou do servidor.
9. **Auditoria de Eventos Críticos:**
   * Ações sensíveis como exclusão de conta (RN10) devem registrar eventos na tabela `security_logs`.

---

## 6. Regras de Negócio Inegociáveis (FSD)

* **RN01:** Isolamento estrito por `user_id` e leitura pública de categorias padrão.
* **RN02:** Saldo Atual = Saldo Inicial + Total Receitas Pagas (`payment_date <= CURRENT_DATE`) - Total Despesas Pagas.
* **RN03:** Saldo Previsto = Saldo Atual + Receitas Pendentes do Mês - Despesas Pendentes do Mês.
* **RN04:** Saldo Inicial definido no cadastro ou perfil como ponto de partida histórico.
* **RN05:** `due_date` é obrigatório; se `PAGO`, `payment_date` é obrigatório; se `PENDENTE`, `payment_date` deve ser `NULL`.
* **RN06:** Lançamentos com `status = 'PENDENTE'` e `due_date < CURRENT_DATE` recebem destaque visual em vermelho.
* **RN07:** O worker Cron de alertas por e-mail dispara diariamente às 06:00 AM (`America/Sao_Paulo`).
* **RN08:** A camada Service valida `category.type === transaction.type`. Categorias personalizadas vinculadas a lançamentos não podem ter seu `type` alterado nem ser excluídas (`ON DELETE RESTRICT`).
* **RN09:** Exportação CSV é gerada e transmitida diretamente via stream/buffer de memória, sem escrita de arquivos no disco.
* **RN10:** Exclusão de usuário executa `DELETE FROM users WHERE id = :user_id` acionando `ON DELETE CASCADE` no PostgreSQL com prévio registro em `security_logs`.

---

## 7. Diretrizes de Interface e Design System

* Siga fielmente o padrão **Executive Precision** especificado em `docs/DESIGN.md`.
* **Cores Principais:** Primary (`#4F46E5`), Secondary (`#1E293B`), Tertiary/Receitas (`#10B981` / `#059669`), Destructive/Despesas (`#F43F5E` / `#E11D48`), Fundo (`#F8FAFC`), Superfícies (`#FFFFFF`).
* **Tipografia:** `Plus Jakarta Sans` para números, KPIs e títulos; `Inter` para tabelas e formulários.
* **Numerais Tabulares:** Aplicar obrigatoriamente `font-variant-numeric: tabular-nums` (classe Tailwind `tabular-nums`) em tabelas, extratos e cards de saldos.
* **Assets:** Utilizar os logotipos oficiais presentes em `assets/logo.png` e `assets/logo_branca.png`.

---

## 8. Protocolo de Acompanhamento para Agentes de IA

A cada sessão ou etapa de trabalho:
1. **Antes de codificar:** Verifique `docs/STATUS.md` e o escopo da fase correspondente em `docs/PLANO.md`.
2. **Durante a execução:** Siga estritamente as regras técnicas do `docs/FSD.md` e não introduza bibliotecas ou tecnologias não especificadas.
3. **Se encontrar erros ou bloqueios:** Registre o incidente, a causa-raiz e a solução em `docs/ERROS.md`.
4. **Ao finalizar uma etapa:** Atualize o `docs/STATUS.md` com o que foi entregue, o que está em andamento e o próximo passo.
