# Status do Projeto — Sistema de Controle Financeiro Pessoal

## 1. Fase Atual
* **Documentação Final de Manutenção & Modo Manutenção de Contexto** — **CONCLUÍDA EM 12/10/2026**
* **Fases Funcionais Concluídas:** Fase 1 (Infraestrutura), Fase 2 (Banco de Dados, Migrations & Seeds) e Fase 3 (Backend Core — Auth, Usuários e Segurança).
* **Fases Funcionais Pendentes:** Fase 4 (Backend Domínio — Categorias & Lançamentos), Fase 5 (Backend Avançado — Dashboard, CSV & Cron), Fase 6 (Frontend — Design System, Auth & Layout), Fase 7 (Frontend — Dashboard, Extrato, Modais & CSV) e Fase 8 (Testes Integrados, Validação & Hardening Final).
* **Revisão de Segurança:** Parcial realizada para Fases 1 a 3 (INC-002 a INC-006 resolvidos). Revisão de segurança final global pendente da conclusão das Fases 4 a 8.

---

## 2. O que já foi concluído

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

---

## 3. Pendências Registradas

> **Aviso Importante sobre o Estado do Sistema:**
> A documentação final de manutenção foi solicitada e gerada enquanto o projeto possui fases funcionais abertas no cronograma do [`docs/PLANO.md`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/PLANO.md).
> Por essa razão, a documentação foi estruturada para orientar com segurança o desenvolvimento e a manutenção tanto do código já implementado quanto das fases pendentes.

### Pendências Funcionais:
1. **Fase 4 (Backend Domínio):** Implementação dos serviços, controladores e rotas de Categorias (`/api/categories`) e Transações (`/api/transactions`), com validação RN08 (tipo de categoria compatível com o lançamento) e endpoint de duplicação em rascunho de memória.
2. **Fase 5 (Backend Avançado):** Endpoints do Dashboard (`/api/dashboard`) com fórmulas matemáticas RN02 e RN03, exportação CSV em stream de memória (`/api/transactions/export/csv`) e rotina agendada diária com `node-cron` e `nodemailer`.
3. **Fase 6 (Frontend Base):** Roteamento React, `AuthContext`, telas de autenticação e casca de navegação (*AppLayout*).
4. **Fase 7 (Frontend Funcional):** Telas de Dashboard com Recharts, Extrato com filtros, modais de lançamentos e integração CSV.
5. **Fase 8 (Testes Integrados & Validação Final):** Testes ponta a ponta de todas as 10 regras de negócio e validação geral.

### Pendência de Segurança:
* A **Revisão de Segurança Global Definitiva** deverá ser reexecutada após a implementação das Fases 4 a 8, cobrindo o frontend completo, fluxo de arquivos CSV em memória, tokens em `localStorage` e rotinas do Cron.

---

## 4. Próximo Passo Recomendado

* **Continuidade do Desenvolvimento:** Iniciar a **Fase 4: Backend Domínio — Categorias e Lançamentos Financeiros** (`categoryRepository.js`, `transactionRepository.js`, `paymentMethodRepository.js`, `categoryService.js`, `transactionService.js`, `categoryController.js`, `transactionController.js`, `categoryRoutes.js`, `transactionRoutes.js`).
* **Ou Publicação:** Caso o usuário opte por avançar diretamente para etapas de deploy/infraestrutura externa, iniciar novo chat dedicado com o prompt de publicação correspondente.
