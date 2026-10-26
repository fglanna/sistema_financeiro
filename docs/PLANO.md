# Plano de Implementação — Sistema de Controle Financeiro Pessoal

Este documento define as fases sequenciais e incrementais para a construção do **Sistema de Controle Financeiro Pessoal**, em total conformidade com o **FSD.md** e o **DESIGN.md**.

---

## Visão Geral das Fases

```
[ Fase 1: Preparação do Terreno & Infraestrutura ]
                      │
                      ▼
[ Fase 2: Banco de Dados, Migrations & Seeds ]
                      │
                      ▼
[ Fase 3: Backend Core — Auth, Usuários & Segurança ]
                      │
                      ▼
[ Fase 4: Backend Domínio — Categorias & Lançamentos ]
                      │
                      ▼
[ Fase 5: Backend Avançado — Dashboard, CSV & Cron ]
                      │
                      ▼
[ Fase 6: Frontend — Design System, Auth & Layout ]
                      │
                      ▼
[ Fase 7: Frontend — Dashboard, Extrato, Modais & CSV ]
                      │
                      ▼
[ Fase 8: Testes Integrados, Validação & Hardening ]
```

---

## Fase 1 — Preparação do Terreno e Infraestrutura Base

* **Objetivo:** Estabelecer a estrutura inicial dos repositórios desacoplados (`backend/` e `frontend/`), arquivos operacionais, configurações de ambiente, orquestração de banco local (Docker) e documentação de controle.
* **Dependências de fases anteriores:** Nenhuma.
* **Principais arquivos e áreas envolvidos:**
  * `docker-compose.yml`
  * `AGENTS.md`
  * `docs/PLANO.md`, `docs/STATUS.md`, `docs/ERROS.md`
  * `backend/package.json`, `backend/.env.example`, `backend/knexfile.js`
  * `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`
* **Checklist:**
  - [x] Ler e mapear requisitos do `docs/FSD.md`, `docs/DESIGN.md` e `docs/INSUMOS.md`.
  - [x] Criar `docs/PLANO.md`.
  - [x] Criar `AGENTS.md` com regras operacionais e caminhos relativos.
  - [x] Criar `docs/STATUS.md` e `docs/ERROS.md`.
  - [x] Configurar `docker-compose.yml` para PostgreSQL local.
  - [x] Inicializar projeto Node.js no diretório `backend/` com dependências previstas no FSD.
  - [x] Inicializar projeto React SPA no diretório `frontend/` com Vite, Tailwind CSS e dependências.
  - [x] Configurar design tokens no `tailwind.config.js` conforme `DESIGN.md`.
  - [x] Configurar estrutura inicial de pastas e diretório de logs (`backend/logs/`).
* **Critério de conclusão:** Projetos `backend` e `frontend` inicializados com dependências instaladas sem erros, arquivos de documentação criados e validados, scripts de build/dev prontos para execução.

---

## Fase 2 — Banco de Dados, Migrations e Seeds

* **Objetivo:** Implementar o schema relacional completo no PostgreSQL via Knex.js Migrations e carregar os dados iniciais de domínio e categorias padrão via Seeds.
* **Dependências de fases anteriores:** Fase 1 concluída e container PostgreSQL ativo.
* **Principais arquivos e áreas envolvidos:**
  * `backend/knexfile.js`
  * `backend/src/database/connection.js`
  * `backend/src/database/migrations/*`
  * `backend/src/database/seeds/*`
* **Checklist:**
  - [x] Criar migration para função trigger `update_updated_at_column()`.
  - [x] Criar migration para tabela `users` (com trigger `updated_at`).
  - [x] Criar migration para tabela `categories` (com constraint `chk_category_owner` e trigger `updated_at`).
  - [x] Criar migration para tabela `payment_methods` (domínio fixo com id `SMALLINT`).
  - [x] Criar migration para tabela `financial_transactions` (com constraints de status/pagamento e trigger `updated_at`).
  - [x] Criar migration para tabela `password_reset_tokens` (registro imutável).
  - [x] Criar migration para tabela `security_logs` (registro de auditoria imutável).
  - [x] Criar migration para índices de otimização (`idx_transactions_user_due`, `idx_transactions_user_status`, `idx_transactions_user_category`, `idx_categories_user_type`).
  - [x] Criar seed para inserção do domínio fixo de `payment_methods` (Pix, Cartão de Crédito, Cartão de Débito, Dinheiro, Boleto, Transferência).
  - [x] Criar seed para inserção das categorias padrão do sistema (`is_default = TRUE`, `user_id = NULL`).
  - [x] Executar migrations e seeds e validar estrutura no PostgreSQL.
* **Critério de conclusão:** Todas as migrations e seeds executadas com sucesso sem erros; tabelas, triggers, restrições e índices criados rigorosamente de acordo com a Seção 8 do FSD.

---

## Fase 3 — Backend Core: Autenticação, Usuários e Segurança

* **Objetivo:** Implementar a camada base da API REST com Express, configuração centralizada, middlewares de segurança (CORS, Rate Limiting, JWT, logs de erro) e endpoints de autenticação e perfil.
* **Dependências de fases anteriores:** Fase 2 concluída.
* **Principais arquivos e áreas envolvidos:**
  * `backend/src/config/config.js`
  * `backend/src/middlewares/auth.js`
  * `backend/src/middlewares/rateLimiter.js`
  * `backend/src/middlewares/errorHandler.js`
  * `backend/src/repositories/userRepository.js`
  * `backend/src/repositories/securityLogRepository.js`
  * `backend/src/repositories/tokenRepository.js`
  * `backend/src/services/authService.js`
  * `backend/src/services/userService.js`
  * `backend/src/controllers/authController.js`
  * `backend/src/controllers/userController.js`
  * `backend/src/routes/authRoutes.js`
  * `backend/src/routes/userRoutes.js`
* **Checklist:**
  - [x] Implementar `config.js` centralizando `process.env`.
  - [x] Implementar middleware global de erros com gravação em `backend/logs/error.log`.
  - [x] Implementar rate limiting (5 req / 15 min) com `express-rate-limit` para `/api/auth/login` e `/api/auth/forgot-password`.
  - [x] Implementar autenticação JWT (token 24h, verificação Bearer).
  - [x] Implementar `POST /api/auth/register` (hash bcrypt custo 10, saldo inicial padrão R$ 0,00).
  - [x] Implementar `POST /api/auth/login`.
  - [x] Implementar `POST /api/auth/forgot-password` (geração de token SHA-256 e mock/integração com envio de e-mail).
  - [x] Implementar `POST /api/auth/reset-password` (invalidação com `used = TRUE`).
  - [x] Implementar `GET /api/users/me` e `PUT /api/users/me`.
  - [x] Implementar `DELETE /api/users/me` com exclusão em cascata (RN10) e log de auditoria em `security_logs`.
* **Critério de conclusão:** Todos os endpoints do Módulo de Autenticação e Usuário testados, protegidos por rate limiting e JWT, com auditoria e tratamento de erros funcionando.

---

## Fase 4 — Backend Domínio: Categorias e Lançamentos Financeiros

* **Objetivo:** Implementar o núcleo do controle financeiro com repositórios isolados por `user_id`, validações estritas de negócio (compatibilidade de tipos, bloqueios de alteração/exclusão) e CRUDs de categorias e lançamentos.
* **Dependências de fases anteriores:** Fase 3 concluída.
* **Principais arquivos e áreas envolvidos:**
  * `backend/src/repositories/categoryRepository.js`
  * `backend/src/repositories/transactionRepository.js`
  * `backend/src/repositories/paymentMethodRepository.js`
  * `backend/src/services/categoryService.js`
  * `backend/src/services/transactionService.js`
  * `backend/src/controllers/categoryController.js`
  * `backend/src/controllers/transactionController.js`
  * `backend/src/routes/categoryRoutes.js`
  * `backend/src/routes/transactionRoutes.js`
* **Checklist:**
  - [x] Implementar `GET /api/categories` (categorias padrão + personalizadas do usuário).
  - [x] Implementar `POST /api/categories` (criação de categoria personalizada).
  - [x] Implementar `PUT /api/categories/:id` com trava de alteração de `type` para categorias com lançamentos vinculados (RN08).
  - [x] Implementar `DELETE /api/categories/:id` com bloqueio para categorias com transações vinculadas (`ON DELETE RESTRICT`).
  - [x] Implementar `GET /api/payment-methods` (leitura do domínio fixo).
  - [x] Implementar `GET /api/transactions` com filtros por `month`, `year`, `search` e `category_id`.
  - [x] Implementar `POST /api/transactions` com validação de serviço `category.type === transaction.type` e consistência de `payment_date`/`status` (RN05, RN08).
  - [x] Implementar `GET /api/transactions/:id/duplicate-draft` retornando rascunho em memória com descrição original preservada e `status = PENDENTE`.
  - [x] Implementar `PUT /api/transactions/:id` com validação de compatibilidade de categoria e datas.
  - [x] Implementar `DELETE /api/transactions/:id` (exclusão física).
* **Critério de conclusão:** Todos os endpoints de categorias e transações testados com sucesso, regras de negócio RN01, RN05, RN08 e RN10 validadas.

---

## Fase 5 — Backend Avançado: Dashboard, Exportação CSV e Worker Cron

* **Objetivo:** Implementar os cálculos financeiros de precisão (Saldo Atual e Saldo Previsto), geração de CSV em stream de memória e rotina diária de alertas por e-mail via agendador Cron.
* **Dependências de fases anteriores:** Fase 4 concluída.
* **Principais arquivos e áreas envolvidos:**
  * `backend/src/services/dashboardService.js`
  * `backend/src/services/csvExportService.js`
  * `backend/src/services/mailService.js`
  * `backend/src/cron/notificationWorker.js`
  * `backend/src/controllers/dashboardController.js`
  * `backend/src/controllers/exportController.js`
  * `backend/src/routes/dashboardRoutes.js`
  * `backend/src/routes/exportRoutes.js`
* **Checklist:**
  - [x] Implementar cálculo de Saldo Atual (RN02: Saldo Inicial + Receitas Pagas com `payment_date <= CURRENT_DATE` - Despesas Pagas).
  - [x] Implementar cálculo de Saldo Previsto (RN03: Saldo Atual + Receitas Pendentes do Mês - Despesas Pendentes do Mês).
  - [x] Implementar agregação de despesas por categoria e lista de alertas para `GET /api/dashboard`.
  - [x] Implementar `GET /api/transactions/export/csv` gerando arquivo diretamente em memória sem gravação em disco (RN09).
  - [x] Implementar worker diário agendado via `node-cron` para as 06:00 AM (`America/Sao_Paulo`) identificando contas pendentes vencidas ou do dia e disparando e-mails via `nodemailer` (RN07).
* **Critério de conclusão:** Endpoint de Dashboard retornando KPIs exatos, exportação CSV funcionando via download direto por stream, e cron configurado e disparável.

---

## Fase 6 — Frontend: Design System, Autenticação e Layout Base

* **Objetivo:** Construir a base do frontend em React SPA, aplicando o tema *Executive Precision* do `DESIGN.md`, gerenciamento de autenticação/sessão, rotas protegidas e casca de navegação (Header, Sidebar, Perfil).
* **Dependências de fases anteriores:** Fase 5 concluída (ou APIs da Fase 3 prontas).
* **Principais arquivos e áreas envolvidos:**
  * `frontend/src/index.css`
  * `frontend/src/contexts/AuthContext.jsx`
  * `frontend/src/services/api.js`
  * `frontend/src/components/layout/AppLayout.jsx`
  * `frontend/src/components/layout/Sidebar.jsx`
  * `frontend/src/components/layout/Header.jsx`
  * `frontend/src/pages/Login.jsx`
  * `frontend/src/pages/Register.jsx`
  * `frontend/src/pages/ForgotPassword.jsx`
  * `frontend/src/pages/ResetPassword.jsx`
  * `frontend/src/pages/Profile.jsx`
* **Checklist:**
  - [x] Configurar tipografia (Plus Jakarta Sans e Inter) e variáveis de tema no CSS.
  - [x] Configurar cliente HTTP (Axios ou Fetch) com interceptor para Bearer Token e redirecionamento automático em caso de 401.
  - [x] Implementar `AuthContext` com login, registro, logout e persistência de token no LocalStorage.
  - [x] Implementar telas de autenticação (`/login`, `/register`, `/forgot-password`, `/reset-password`).
  - [x] Implementar layout base da aplicação com Sidebar e Header contendo os logos oficiais (`assets/logo.png` e `assets/logo_branca.png`).
  - [x] Implementar tela de Perfil (`/profile`) com edição de nome/saldo inicial e modal de exclusão definitiva de conta.
* **Critério de conclusão:** Fluxo completo de autenticação e perfil funcionando no frontend com feedback visual responsivo e design fiel ao `DESIGN.md`.

---

## Fase 7 — Frontend: Dashboard, Extrato, Modais e Exportação CSV

* **Objetivo:** Implementar as telas operacionais completas do sistema: Dashboard com cards de KPI, gráfico rosca Recharts e lista de alertas; Extrato com tabela densa, busca, filtros, destaque de vencidos, modal unificado de lançamento e exportação CSV.
* **Dependências de fases anteriores:** Fase 6 concluída.
* **Principais arquivos e áreas envolvidos:**
  * `frontend/src/pages/Dashboard.jsx`
  * `frontend/src/pages/Transactions.jsx`
  * `frontend/src/components/dashboard/KpiCards.jsx`
  * `frontend/src/components/dashboard/ExpensesChart.jsx`
  * `frontend/src/components/dashboard/AlertsPanel.jsx`
  * `frontend/src/components/transactions/TransactionTable.jsx`
  * `frontend/src/components/transactions/TransactionModal.jsx`
  * `frontend/src/components/transactions/CategoryManagerModal.jsx`
  * `frontend/src/components/common/Badge.jsx`
  * `frontend/src/components/common/Button.jsx`
* **Checklist:**
  - [x] Implementar seletor de mês/ano no Dashboard e Extrato.
  - [x] Implementar Cards de KPI com numerais tabulares (`tabular-nums`) e badges de variação.
  - [x] Implementar gráfico de rosca de despesas por categoria usando `Recharts`.
  - [x] Implementar painel de alertas no Dashboard com listagem de contas vencidas e a vencer.
  - [x] Implementar tabela densa de transações com badges de status, formatação de moeda e destaque vermelho em contas atrasadas (RN06).
  - [x] Implementar filtros de busca por descrição e categoria no Extrato.
  - [x] Implementar modal de criação, edição e duplicação de lançamentos com sincronização dinâmica de categorias por tipo.
  - [x] Implementar modal de gerenciamento de categorias personalizadas (criação, edição e exclusão).
  - [x] Implementar gatilho de exportação CSV no frontend recebendo o arquivo via stream.
* **Critério de conclusão:** Interface 100% funcional integrada à API REST, permitindo ciclo completo de gestão financeira com excelente usabilidade.

---

## Fase 8 — Testes Integrados, Validação de Regras e Hardening

* **Objetivo:** Executar testes ponta a ponta em todos os fluxos do sistema, validar todas as 10 regras de negócio do FSD, verificar rate limiting, segurança de senhas, tratamento de erros e auditoria.
* **Dependências de fases anteriores:** Fase 7 concluída.
* **Principais arquivos e áreas envolvidos:**
  * Todo o backend e frontend.
  * `backend/logs/error.log`
* **Checklist:**
  - [ ] Testar fluxo de cadastro, login, esqueci a senha e redefinição.
  - [ ] Testar rate limiting em rotas de auth (bloqueio na 6ª tentativa em 15 minutos).
  - [ ] Validar RN02 e RN03 (cálculos exatos de saldos atual e previsto com datas de corte).
  - [ ] Validar RN08 (tentativa de criar despesa com categoria de receita, tentativa de alterar tipo de categoria com lançamentos vinculados).
  - [ ] Validar duplicação de lançamento (rascunho sem alterar descrição original).
  - [ ] Validar exclusão em cascata de usuário (RN10) e inserção em `security_logs`.
  - [ ] Validar exportação CSV com filtros aplicados.
  - [ ] Verificar integridade do arquivo de log `backend/logs/error.log`.
* **Critério de conclusão:** Sistema aprovado em 100% dos cenários de teste, sem regressões ou inconsistências.
