# Status do Projeto — Sistema de Controle Financeiro Pessoal

## 1. Fase Atual
* **Fase 8 (Testes Integrados, Validação de Regras e Hardening Final)** — **CONCLUÍDA EM 26/10/2026**
* **Fases Funcionais Concluídas:** Todas as 8 fases do projeto concluídas com 100% de sucesso (Fase 1: Infraestrutura, Fase 2: Banco de Dados/Migrations/Seeds, Fase 3: Backend Core, Fase 4: Backend Domínio, Fase 5: Backend Avançado, Fase 6: Frontend Auth/Layout, Fase 7: Frontend Operacional e Fase 8: Testes Integrados/Hardening).
* **Fases Funcionais Pendentes:** Nenhuma. Todas as fases previstas no `docs/PLANO.md` foram totalmente construídas e aprovadas.
* **Revisão de Segurança:** Concluída para todas as camadas do sistema (autenticação JWT, senhas bcrypt custo 10, rate limiting, queries parametrizadas Knex, multi-tenancy RN01, proteção de headers HTTP, limite de body 100kb, validação de UUID, logs higienizados sem credenciais e auditoria em `security_logs`).

---

## 2. O que já foi concluído

### Implantação e Nuvem — Provisionamento do PostgreSQL no Neon (03/11/2026)
- [x] Provisionamento do PostgreSQL 18 gerenciado no Neon (projeto `sistema-financeiro`, branch default `production`, região AWS US East 2).
- [x] Execução com sucesso das 8 migrações estruturais do banco de dados (`npm run migrate`) via conexão direta.
- [x] Execução com sucesso dos 2 arquivos de seeds (`01_payment_methods.js` e `02_default_categories.js`), populando formas de pagamento e categorias globais padrão no Neon.
- [x] Validação das tabelas e integridade relacional no ambiente de produção em nuvem.

### Preparação de Publicação para Vercel + Render + PostgreSQL Gerenciado (12/10/2026)
- [x] Criação do guia definitivo de deploy e infraestrutura ([`docs/DEPLOY.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/DEPLOY.md)) cobrindo Vercel, Render, PostgreSQL e estratégias seguras de migrations em produção.
- [x] Suporte híbrido a `DATABASE_URL` e variáveis individuais no [`backend/src/config/config.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/src/config/config.js) e [`backend/knexfile.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/knexfile.js) com validação de certificados SSL mantida como padrão (`rejectUnauthorized: true`).
- [x] Criação da configuração de reescrita (*rewrite*) para SPA React no [`frontend/vercel.json`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/frontend/vercel.json) prevenindo erro 404 em recarregamentos diretos.
- [x] Implementação da infraestrutura do Cron diário (RN07) via rota interna protegida por `CRON_SECRET` (`POST /api/cron/daily-alerts`), com autenticação timing-safe, idempotência por data de São Paulo registrada em `security_logs`, proteção contra disparos duplicados e timeout de segurança.
- [x] Atualização da documentação de variáveis de ambiente no [`backend/.env.example`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/.env.example).

### Documentação Final e Modo Manutenção (12/10/2026)
- [x] Criação do [`docs/MANUTENCAO.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/MANUTENCAO.md) contendo visão geral, arquitetura, comandos reais, mapa detalhado de pastas, persistência/migrations, autenticação/permissões, passos para adicionar telas, campos e regras de negócio, testes e segurança.
- [x] Criação do [`docs/COMO-PEDIR-MUDANCAS.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/COMO-PEDIR-MUDANCAS.md) com guia acessível para pessoas leigas, checklist de validação e 8 modelos de prompts concretos e adaptados à stack.
- [x] Atualização de [`AGENTS.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/AGENTS.md) para o **Modo Manutenção**, definindo o protocolo de intervenção de 7 passos antes e 5 passos após cada alteração.
- [x] Rastreamento das pendências funcionais e de segurança decorrentes das fases futuras do projeto.

### Fase 1: Preparação do Terreno e Infraestrutura Base
- [x] Leitura detalhada e assimilação dos requisitos de `docs/FSD.md`, `docs/DESIGN.md` e `docs/INSUMOS.md`.
- [x] Mapeamento completo da arquitetura, dependências, restrições e regras de negócio.
- [x] Criação do plano de implementação sequencial em fases incrementais ([`docs/PLANO.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/PLANO.md)).
- [x] Criação do guia operacional e de segurança com caminhos portáteis ([`AGENTS.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/AGENTS.md)).
- [x] Criação dos arquivos de rastreabilidade e governança ([`docs/STATUS.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/STATUS.md) e [`docs/ERROS.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/ERROS.md)).
- [x] Criação do [`docker-compose.yml`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docker-compose.yml) para orquestração do PostgreSQL 16.
- [x] Inicialização do projeto [`backend`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/package.json) (Node.js, Express, Knex, pg, bcrypt, jsonwebtoken, express-rate-limit, node-cron, nodemailer, cors, dotenv).
- [x] Configuração centralizada ([`backend/src/config/config.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/src/config/config.js)), conexão de banco ([`backend/src/database/connection.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/src/database/connection.js)), log de erros ([`backend/logs/error.log`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/logs/error.log)) e knexfile ([`backend/knexfile.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/knexfile.js)).
- [x] Inicialização do projeto [`frontend`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/frontend/package.json) (React SPA com Vite, Tailwind CSS, Lucide React, Recharts).
- [x] Configuração dos tokens de design *Executive Precision* no [`frontend/tailwind.config.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/frontend/tailwind.config.js) e importação das fontes no [`frontend/index.html`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/frontend/index.html).
- [x] Cópia e disponibilização dos assets oficiais em [`frontend/public/assets/`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/frontend/public/assets/).
- [x] Teste de compilação do frontend (`npm run build`) e teste do servidor backend (`/api/health`) executados com 100% de sucesso.
- [x] Criação do [`.gitignore`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/.gitignore) personalizado e blindado para Node.js, React SPA, Docker, credenciais sensíveis e logs.
- [x] Inicialização do Git local (`git init` e branch `main`).

### Fase 2: Banco de Dados, Migrations e Seeds
- [x] 8 migrations criadas e aplicadas (função trigger, tabelas `users`, `categories`, `payment_methods`, `financial_transactions`, `password_reset_tokens`, `security_logs` e índices).
- [x] Seeds executados: 6 formas de pagamento e 11 categorias padrão inseridas.
- [x] Todos os triggers, constraints e índices validados diretamente no PostgreSQL.

### Fase 3: Backend Core — Autenticação, Usuários e Segurança
- [x] Middleware global de erros (`errorHandler.js`) com gravação automática de stack traces em `backend/logs/error.log` e respostas genéricas seguras ao cliente.
- [x] Middleware de rate limiting (`rateLimiter.js`) — 5 req / 15 min por IP — aplicado nas rotas `POST /api/auth/login` e `POST /api/auth/forgot-password` via `express-rate-limit`.
- [x] Middleware de autenticação JWT (`auth.js`) — verificação do cabeçalho `Authorization: Bearer <token>`, injeção de `req.user.id` e `req.user.email`, tratamento de token expirado e inválido.
- [x] `UserRepository` — `findByEmail`, `findById`, `create`, `update`, `delete` com queries parametrizadas via Knex.js.
- [x] `TokenRepository` — `create`, `findByTokenHash`, `markAsUsed` para ciclo completo de tokens de recuperação de senha.
- [x] `SecurityLogRepository` — `create` para registro de eventos de auditoria com `user_id`, `event_type`, `ip_address`, `user_agent` e `details` JSONB.
- [x] `MailService` — envio de e-mail de recuperação de senha via nodemailer com fallback de log em desenvolvimento.
- [x] `AuthService` — `register` (bcrypt custo 10 + validação de duplicidade + JWT), `login` (validação de hash), `forgotPassword` (token SHA-256 + expiração 1h + e-mail), `resetPassword` (validação de token + invalidação `used = TRUE`).
- [x] `UserService` — `getProfile`, `updateProfile`, `deleteAccount` (auditoria prévia em `security_logs` + cascade).
- [x] `AuthController` e `UserController` — delegação para serviços com tratamento de erros via `next(err)`.
- [x] `authRoutes.js` — rotas `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` com rate limiter aplicado nas sensíveis.
- [x] `userRoutes.js` — rotas `GET/PUT/DELETE /api/users/me` protegidas por `authMiddleware`.
- [x] `app.js` — Express com CORS restrito ao frontend, JSON body parser, registro das rotas e middleware de erro no final da cadeia.
- [x] `server.js` — entrada do processo, escuta na porta configurada via `process.env.PORT`.
- [x] **14 testes integrados automatizados** executados com 100% de sucesso.
- [x] **Rate limiting** validado — 6ª tentativa recebe `429 Too Many Requests`.

### Revisão de Segurança Parcial e Hardening (09/10/2026 e 12/10/2026)
- [x] Bloqueio de inicialização em produção com segredos fracos no `config.js` (INC-002).
- [x] Ocultação de ambiente no health check `/api/health` (INC-003).
- [x] Proteção de token de recuperação de senha em logs de desenvolvimento (INC-004).
- [x] SSL do PostgreSQL com `rejectUnauthorized: true` por padrão (INC-005).
- [x] Suporte a `TRUST_PROXY`, desativação de `X-Powered-By`, limite de payload de 100kb, sanitização de URLs em logs e middleware `validateUuid.js` (INC-006).

### Fase 4: Backend Domínio — Categorias e Lançamentos Financeiros (12/10/2026)
- [x] `PaymentMethodRepository` — `findAll` e `findById` para acesso ao domínio fixo.
- [x] `CategoryRepository` — `findAllForUser`, `findByIdForUser`, `findCustomByIdAndUser`, `create`, `update`, `remove` e `hasLinkedTransactions` (para validação de restrições de negócio RN08).
- [x] `TransactionRepository` — `findAll` com filtros (`month`, `year`, `search`, `category_id`), ordenação por `due_date ASC`, joins com categorias e formas de pagamento, `findById`, `create`, `update` e `remove` físico, com isolamento absoluto por `user_id` (RN01).
- [x] `PaymentMethodService` e `PaymentMethodController` — consulta das 6 formas de pagamento do domínio fixo.
- [x] `CategoryService` e `CategoryController` — listagem consolidada (padrão + personalizadas), criação com validação de tipo, edição com trava estrita de alteração de `type` para categorias que possuam lançamentos vinculados (RN08), bloqueio de alteração e exclusão de categorias padrão do sistema e bloqueio de exclusão para categorias com transações vinculadas.
- [x] `TransactionService` e `TransactionController` — validação de integridade e valor (> 0), validação RN05 (obrigatoriedade de `due_date`, `payment_date` obrigatório se status `PAGO`, `payment_date = NULL` se `PENDENTE`), validação estrita RN08 (`category.type === transaction.type`), endpoint de rascunho de duplicação em memória (`GET /api/transactions/:id/duplicate-draft`) preservando a descrição original sem alteração e `status = PENDENTE`, atualização e exclusão física.
- [x] Rotas registradas no Express: `categoryRoutes.js`, `paymentMethodRoutes.js` e `transactionRoutes.js`, protegidas por JWT e validação defensiva de UUID (`validateUuidParam`).
- [x] **15 testes integrados automatizados** (`npm test` / `node test-phase4.js`) executados cobrindo fluxos felizes, isolamento multi-tenant, validações RN05, RN08, filtros, duplicação e exclusão, com 100% de sucesso.

### Fase 5: Backend Avançado — Dashboard, Exportação CSV e Worker Cron (17/10/2026)
- [x] `DashboardService` e `DashboardController` — implementação das fórmulas determinísticas de **Saldo Atual** (RN02: Saldo Inicial + Receitas Pagas com `payment_date <= CURRENT_DATE` - Despesas Pagas), **Saldo Previsto** (RN03: Saldo Atual + Receitas Pendentes do Mês - Despesas Pendentes do Mês), totais de entradas/saídas do mês, agregação percentual de despesas por categoria e lista de alertas de pendências com identificador `is_overdue`.
- [x] `dashboardRoutes.js` — rota `GET /api/dashboard?month=MM&year=YYYY` protegida por autenticação JWT (RN01) e montada no `app.js`.
- [x] `CsvExportService` e método `exportCsv` no `TransactionController` — geração de planilha CSV diretamente em memória em conformidade estrita com RFC 4180 e RN09 (sem arquivos temporários em disco), respeitando filtros aplicados de período, categoria e busca textual, com inclusão de BOM UTF-8 (`EF BB BF`), separador brasileiro (ponto e vírgula), valores formatados em moeda nacional e cabeçalhos `Content-Type: text/csv; charset=utf-8` e `Content-Disposition: attachment; filename="extrato_YYYY_MM.csv"`.
- [x] Rota de exportação registrada no `transactionRoutes.js`: `GET /api/transactions/export/csv`.
- [x] `cronService.js` — implementação da rotina real de varredura no PostgreSQL (`_runDailyAlertsLogic`) filtrando lançamentos com `status = 'PENDENTE'` e `due_date <= CURRENT_DATE`, agrupando pendências por usuário com dados de contato e calculando débitos em aberto.
- [x] `mailService.js` — implementação do método `sendDailyAlertMail` disparando e-mails HTML responsivos formatados no padrão visual *Executive Precision*, contendo tabela de débitos, somatório total, identificação de vencidos e links diretos para o extrato.
- [x] `notificationWorker.js` — inicialização do agendador automático `node-cron` programado para rodar diariamente às 06:00 AM no fuso horário `America/Sao_Paulo` (`0 6 * * *`) com parada segura (`stopNotificationWorker`) e acoplamento no `server.js`.
- [x] Hardening de segurança do agendador: proteção em `config.js` exigindo que `CRON_SECRET` possua no mínimo 32 caracteres em ambiente de produção, preservando timing-safe auth via `crypto.timingSafeEqual` e idempotência registrada em `security_logs`.
- [x] **Suíte completa de testes automatizados (`npm test`)** executando 15 testes da Fase 4 e testes avançados da Fase 5 (`test-phase5.js`) cobrindo 100% dos fluxos e regras RN01, RN02, RN03, RN07 e RN09 com sucesso.

### Revisão SMTP e Correção de Contagem de E-mails (17/10/2026 — INC-007)
- [x] Correção de `mailService.js` — detecção de credenciais SMTP placeholder (`seu_usuario_smtp`, `your_smtp_user`) no `initTransporter()`, ativando modo mock automaticamente em ambientes sem SMTP real configurado.
- [x] Correção de `mailService.js` — `sendDailyAlertMail` agora retorna status explícito (`{ sent: true }`, `{ sent: false, error }` ou `{ sent: 'mock' }`) para que o caller distinga sucesso real de falha.
- [x] Correção de `cronService.js` — loop de envio distingue `emailsSentCount` (sucessos + mock) de `emailsFailedCount` (falhas SMTP), usando o retorno de `sendDailyAlertMail`.
- [x] Correção de `test-phase5.js` — assertions do Cron não validam mais `emailsSentCount >= 1` como prova de envio real. Verificam `totalAttempts >= 1` e `emailsFailedCount === 0`.
- [x] `npm test` executado com **100% de sucesso** e **zero erros SMTP** no output (modo mock ativo).
- [ ] **Pendência:** Validação de envio real de e-mails com SMTP configurado (credenciais reais no `.env`) será feita manualmente pelo usuário em ambiente de produção.

### Fase 6: Frontend — Design System, Autenticação e Layout Base (26/10/2026)
- [x] Configuração centralizada do cliente HTTP (`frontend/src/services/api.js`) com Axios, interceptor de injeção automática de `Authorization: Bearer <token>` e interceptor de redirecionamento automático para `/login` ao capturar status HTTP `401 Unauthorized`.
- [x] Criação do contexto de autenticação (`frontend/src/contexts/AuthContext.jsx`) gerenciando estado de `user`, `token`, `loading`, `error`, ciclo de persistência no `localStorage`, validação na montagem via `GET /api/users/me`, e métodos `login`, `register`, `logout`, `updateProfile` e `deleteAccount`.
- [x] Criação de componentes base de UI em conformidade com o tema *Executive Precision* (`DESIGN.md`): `Button.jsx` (variantes primary, secondary, destructive e ghost com loading spinner), `Input.jsx` (altura 40px, estados de foco, helper text e suporte a numerais tabulares) e `Modal.jsx` (elevação Level 4 com backdrop blur e tecla ESC).
- [x] Implementação da casca de layout responsiva: `AppLayout.jsx` com proteção de rota (`PrivateRoute`), `Sidebar.jsx` (navegação com links ativos e logotipo oficial) e `Header.jsx` (contexto da tela, perfil resumido e logout).
- [x] Implementação de telas públicas de autenticação com validações de entrada e alertas de erro:
  - `Login.jsx` (`/login`): formulário centralizado, validação de e-mail/senha e redirecionamento pós-login.
  - `Register.jsx` (`/register`): campos completos, saldo inicial opcional (default R$ 0,00), confirmação de senha e login imediato.
  - `ForgotPassword.jsx` (`/forgot-password`): solicitação de redefinição com feedback genérico por segurança e proteção a rate limiting.
  - `ResetPassword.jsx` (`/reset-password?token=...`): captura do token da URL, formulário de nova senha e confirmação com mensagem de sucesso.
- [x] Implementação da tela de Perfil (`Profile.jsx` em `/profile`): formulário de edição de nome e saldo inicial (`PUT /api/users/me`) e Seção Destrutiva com modal de confirmação e exclusão definitiva de conta (`DELETE /api/users/me` — RN10).
- [x] Telas de transição para `/dashboard` e `/transactions` com placeholders informativos preparados para recepção dos componentes analíticos da Fase 7.
- [x] Criação da suíte de testes de integração da Fase 6 (`backend/test-phase6.js`) cobrindo 100% dos fluxos de cadastro, login, perfil, forgot-password e exclusão em cascata, integrada ao comando `npm test`.
- [x] Compilação do frontend validada via `npm run build` com 100% de sucesso sem warnings ou erros.

### Fase 7: Frontend — Dashboard, Extrato, Modais e Exportação CSV (26/10/2026)
- [x] Criação do componente `MonthYearSelector.jsx` permitindo navegação entre meses/anos com botões anterior/próximo e atalho para o mês atual.
- [x] Criação de `KpiCards.jsx` renderizando os 4 indicadores financeiros obrigatórios (Saldo Atual com RN02, Saldo Previsto com RN03, Entradas do Mês e Saídas do Mês) com tipografia tabular (`tabular-nums`), ícones e badges contextuais.
- [x] Criação de `ExpensesChart.jsx` com gráfico rosca interativo via `recharts` (`PieChart`, `Tooltip`), paleta executiva e legenda detalhando valores e participações percentuais.
- [x] Criação de `AlertsPanel.jsx` exibindo lista de obrigações pendentes com destaque imediato para vencidas (`is_overdue`) e a vencer no dia.
- [x] Criação de `TransactionTable.jsx` com layout denso, ordenação, badges de status, formatação monetária em BRL e destaque visual em vermelho para contas atrasadas (RN06).
- [x] Criação de `TransactionModal.jsx` atendendo à criação, edição e duplicação com sincronização dinâmica de categorias por tipo (RN08) e travas de datas/status (RN05).
- [x] Criação de `CategoryManagerModal.jsx` para gerenciamento completo de categorias personalizadas (criação, edição e exclusão) com travas de integridade para categorias padrão e bloqueio de exclusão/alteração de tipo (RN08).
- [x] Implementação de gatilho de exportação CSV em memória via stream (`handleExportCsv`) com download imediato do arquivo filtrado no navegador (RN09).
- [x] Integração completa da tela `Dashboard.jsx` consumindo `GET /api/dashboard`.
- [x] Integração completa da tela `Transactions.jsx` com filtros de texto, dropdown de categorias e paginação/recarregamento.
- [x] Criação da suíte automatizada `backend/test-phase7.js` validando todos os fluxos de ponta a ponta integrada ao `npm test`.
- [x] Validação do build de produção via `npm run build` no frontend com 100% de sucesso.

### Fase 8: Testes Integrados, Validação de Regras e Hardening Final (26/10/2026)
- [x] Criação do script de testes integrados e hardening `backend/test-phase8.js` e acoplamento ao comando `npm test`.
- [x] Validação de cabeçalhos HTTP: remoção confirmada do header `X-Powered-By` (`app.disable('x-powered-by')`) e endpoint público `/api/health` estritamente minimalista sem expor ambientes.
- [x] Validação do fluxo de autenticação e contas: cadastro seguro com hash bcrypt custo 10, rejeição de duplicidade (409 Conflict), emissão de JWT com 24h de validade, bloqueio de senhas incorretas e rejeição de tokens forjados ou ausentes (401 Unauthorized).
- [x] Validação do ciclo de redefinição de senha: solicitação via `POST /api/auth/forgot-password`, geração de hash SHA-256 no banco com expiração de 1h e `used = false`, redefinição com nova senha, invalidação imediata do token (`used = true`), bloqueio estrito contra reutilização de token consumido (400 Bad Request) e login imediato com a nova credencial.
- [x] Validação estrita de Rate Limiting: 5 requisições em 15 minutos por IP no `POST /api/auth/login`, com bloqueio imediato na tentativa subsequente retornando status `429 Too Many Requests`.
- [x] Validação de regras de negócio de categorias e compatibilidade (RN08):
  - Bloqueio de edição e exclusão de categorias padrão (`is_default = true`).
  - Criação de categoria personalizada com tipo validado.
  - Rejeição na camada Service de lançamentos com tipos incompatíveis (`category.type !== transaction.type`).
  - Bloqueio de alteração de `type` em categorias personalizadas que possuam lançamentos vinculados.
  - Bloqueio de exclusão (`ON DELETE RESTRICT`) para categorias com lançamentos vinculados.
- [x] Validação estrita de multi-tenancy e isolamento de domínio (RN01):
  - Usuários não têm acesso a categorias personalizadas de terceiros.
  - Tentativa de consulta, duplicação, edição ou exclusão de transações de outro usuário rejeitadas com 404 Not Found.
- [x] Validação de consistência de datas e status (RN05):
  - `due_date` obrigatório.
  - Lançamento com status `PAGO` exige obrigatoriamente `payment_date`.
  - Lançamento com status `PENDENTE` força `payment_date = null`.
- [x] Validação matemática determinística de saldos (RN02, RN03 e RN04):
  - Saldo Inicial (RN04) atua como valor base.
  - Saldo Atual (RN02): Saldo Inicial + Receitas Pagas (`payment_date <= CURRENT_DATE`) - Despesas Pagas (`payment_date <= CURRENT_DATE`). Transações pagas com data futura não afetam o Saldo Atual.
  - Saldo Previsto (RN03): Saldo Atual + Receitas Pendentes do Mês - Despesas Pendentes do Mês.
- [x] Validação de destaque de contas atrasadas (RN06):
  - Lançamentos pendentes com `due_date < CURRENT_DATE` marcados com `is_overdue = true` no painel de alertas do Dashboard.
- [x] Validação de duplicação em rascunho de memória:
  - `GET /api/transactions/:id/duplicate-draft` preserva a descrição original, categoria, forma de pagamento e valor, define status `PENDENTE` e `payment_date = null`, sem persistir nenhum registro prévio no banco.
- [x] Validação de exportação CSV em memória (RN09):
  - Retorno via stream em memória em conformidade com RFC 4180, cabeçalhos `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="extrato_YYYY_MM.csv"`, BOM UTF-8 e separador de colunas `;`.
- [x] Validação do worker Cron e idempotência (RN07):
  - Acionamento seguro da rota interna de cron via cabeçalho `Authorization: Bearer <CRON_SECRET>` com comparação timing-safe.
  - Idempotência validada: disparos repetidos na mesma data são interceptados e retornam `status: "skipped"` com `reason: "already_executed"`.
- [x] Validação defensiva de entrada e limites de infraestrutura:
  - Parâmetros de rota com UUID malformado rejeitados defensivamente com status `400 Bad Request` pelo middleware `validateUuidParam`.
  - Body payload superior a 100kb rejeitado com status `413 Payload Too Large`.
- [x] Validação de exclusão em cascata (RN10) e auditoria:
  - `DELETE /api/users/me` remove o usuário da tabela `users` e expurga em cascata todas as transações, categorias personalizadas e tokens de redefinição.
  - Auditoria confirmada na tabela `security_logs` com evento `ACCOUNT_DELETED`.
- [x] Validação e higienização do arquivo de log `backend/logs/error.log`:
  - Confirmação de que nenhuma senha em texto claro ou token bruto é exposto nos arquivos de log.
- [x] Suíte de testes completa automatizada executada via `npm test` englobando fases 4, 5, 6, 7 e 8 com **100% de sucesso**.
- [x] Build de produção do frontend (`npm run build`) validado com **100% de sucesso**.

---

## 3. Pendências Registradas

### Pendências Funcionais:
* **Nenhuma.** Todas as funcionalidades de negócio e testes das 8 fases do projeto estão 100% implementadas e validadas.

### Pendência de Operação em Produção:
* **Validação de envio real de e-mails com provedor SMTP de produção:** em ambiente de desenvolvimento local, o sistema opera em modo mock seguro com integridade comprovada. O usuário deverá configurar as credenciais reais de SMTP (ex.: SendGrid, Amazon SES, Mailtrap Live) no arquivo `.env` de produção durante o go-live.

---

## 4. Próximo Passo Recomendado

* **Todas as fases de codificação do projeto foram concluídas.**
* **Recomendação:** Orientar o usuário a abrir um novo chat e executar o prompt de validação final de segurança e go-live (Passo 5).
