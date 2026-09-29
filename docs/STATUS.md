# Status do Projeto — Sistema de Controle Financeiro Pessoal

## 1. Fase Atual
* **Fase 3: Backend Core — Autenticação, Usuários e Segurança** — **CONCLUÍDA**
* **Controle de Versão e Backup (Git / GitHub)** — **CONFIGURADO & SEGURO**

---

## 2. O que já foi concluído

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
- [x] **14 testes integrados automatizados** executados com 100% de sucesso (register, duplicidade, login válido/inválido, JWT, perfil, atualização, forgot-password, reset-password, reuso de token, nova senha, exclusão em cascata, auditoria).
- [x] **Rate limiting** validado — 6ª tentativa recebe `429 Too Many Requests` com mensagem clara.

---

## 3. O que está em andamento
- Preparação para a **Fase 4: Backend Domínio — Categorias e Lançamentos Financeiros**.

---

## 4. Próximo Passo
* **Fase 4:** Backend Domínio — Categorias e Lançamentos Financeiros (`categoryRepository.js`, `transactionRepository.js`, `paymentMethodRepository.js`, `categoryService.js`, `transactionService.js`, `categoryController.js`, `transactionController.js`, `categoryRoutes.js`, `transactionRoutes.js` — com validação RN08 de compatibilidade de tipo, CRUD completo de categorias e transações, rascunho de duplicação e endpoint de listagem).

---

## 5. Observações Importantes
* Toda a camada de autenticação e controle de acesso foi construída em conformidade estrita com o FSD.
* Senhas nunca trafegam em respostas; o payload JWT contém apenas `user_id` e `email`.
* Rate limiting, auditoria em `security_logs` e exclusão em cascata (RN10) foram validados nos testes integrados.
* O `MailService` opera em modo de mock (log no console) em desenvolvimento; a integração SMTP real é ativada ao configurar as variáveis SMTP no `.env`.
