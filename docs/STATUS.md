# Status do Projeto — Sistema de Controle Financeiro Pessoal

## 1. Fase Atual
* **Fase 5 (Backend Avançado: Dashboard, Exportação CSV e Worker Cron)** — **CONCLUÍDA EM 17/10/2026**
* **Fases Funcionais Concluídas:** Fase 1 (Infraestrutura), Fase 2 (Banco de Dados, Migrations & Seeds), Fase 3 (Backend Core — Auth, Usuários e Segurança), Fase 4 (Backend Domínio — Categorias & Lançamentos) e Fase 5 (Backend Avançado — Dashboard, CSV & Cron Alertas).
* **Fases Funcionais Pendentes (Obrigatórias antes do Go-Live):** Fase 6 (Frontend — Design System, Auth & Layout), Fase 7 (Frontend — Dashboard, Extrato, Modais & CSV) e Fase 8 (Testes Integrados, Validação & Hardening Final).
* **Revisão de Segurança:** Realizada para Fases 1 a 5 e infraestrutura de deploy (suporte a DATABASE_URL, SSL com verificação de certificado, CRON_SECRET timing-safe e idempotência de disparos). Revisão final pendente das Fases 6 a 8.

---

## 2. O que já foi concluído

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

---

## 3. Pendências Registradas

### Pendências Funcionais:
1. **Fase 6 (Frontend Base):** Roteamento React, `AuthContext`, telas de autenticação e casca de navegação (*AppLayout*).
2. **Fase 7 (Frontend Funcional):** Telas de Dashboard com Recharts, Extrato com filtros, modais de lançamentos e integração CSV.
3. **Fase 8 (Testes Integrados & Validação Final):** Testes ponta a ponta de todas as 10 regras de negócio e validação geral.

### Pendência de Segurança:
* A **Revisão de Segurança Global Definitiva** deverá ser reexecutada após a implementação das Fases 6 a 8, cobrindo o frontend completo, tokens em `localStorage` e fluxos de telas.

---

## 4. Próximo Passo Recomendado

* **Continuidade do Desenvolvimento:** Iniciar a **Fase 6: Frontend — Design System, Autenticação e Layout Base** (`frontend/src/contexts/AuthContext.jsx`, `frontend/src/services/api.js`, `frontend/src/components/layout/AppLayout.jsx`, telas de autenticação `/login`, `/register`, `/forgot-password`, `/reset-password` e tela de perfil `/profile`).
