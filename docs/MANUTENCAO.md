# Guia de Manutenção do Sistema — Sistema de Controle Financeiro Pessoal

Este documento é a referência definitiva para desenvolvedores e agentes de Inteligência Artificial que precisem manter, corrigir, testar ou evoluir este sistema.

---

## 1. Visão Geral

### 1.1. O que o sistema faz
O **Sistema de Controle Financeiro Pessoal** é uma aplicação web para gestão financeira individual, projetada para oferecer previsibilidade, organização e alto rigor no acompanhamento de finanças. Ele permite registrar receitas e despesas, organizar movimentações em categorias (padrão do sistema e personalizadas pelo usuário), registrar formas de pagamento, acompanhar saldos em tempo real e projetar saldos futuros com base em obrigações pendentes.

### 1.2. Para quem foi criado
Destina-se a pessoas físicas, profissionais liberais e tomadores de decisão que buscam controle detalhado de receitas, despesas, contas a pagar e a receber, com clareza visual e integridade contábil.

### 1.3. Problemas que resolve
* **Descontrole de fluxo de caixa:** Diferencia com precisão contábil o que já foi efetivamente pago/recebido do que está apenas agendado ou atrasado.
* **Incerteza de liquidez:** Apresenta o Saldo Atual real e o Saldo Previsto do mês com fórmulas matemáticas determinísticas.
* **Esquecimento de vencimentos:** Notifica via alertas em painel e disparos diários de e-mails sobre contas a vencer ou vencidas.
* **Dificuldade de exportação:** Permite extrair extratos filtrados diretamente em planilha CSV sem intermediários ou gravação em disco.

### 1.4. Principais módulos existentes
1. **Autenticação e Gestão de Usuário:** Cadastro com saldo inicial, login seguro com JWT, recuperação de senha com token de uso único (SHA-256), gerenciamento de perfil e exclusão definitiva de conta com cascade.
2. **Lançamentos Financeiros:** CRUD de receitas e despesas, controle de datas (`due_date` e `payment_date`), status (`PAGO`/`PENDENTE`) e duplicação rápida em rascunho de memória.
3. **Categorias e Formas de Pagamento:** Categorias padrão globais (somente leitura) e categorias personalizadas do usuário, com trava de tipo e restrição de exclusão para registros com movimentação. Formas de pagamento padronizadas.
4. **Dashboard e Extrato:** KPIs em tempo real (Saldo Atual, Saldo Previsto, Entradas, Saídas), gráfico rosca de despesas por categoria, extrato detalhado com busca e filtros, badges com destaque visual para vencidos e exportação CSV em stream de memória.
5. **Serviços de Background (Cron & E-mails):** Agendador diário (`node-cron`) às 06:00 AM (horário de Brasília) para varredura de pendências e disparo de alertas via `nodemailer`.

---

## 2. Stack Tecnológica e Ambientes

### 2.1. Tecnologias Principais
* **Linguagem Backend:** Node.js (v18+)
* **Framework Web:** Express.js
* **Banco de Dados:** PostgreSQL 16
* **Query Builder e Migrações:** Knex.js com driver `pg`
* **Autenticação:** JSON Web Token (`jsonwebtoken`, expiração em 24h)
* **Criptografia:** `bcrypt` (fator de custo 10) e tokens SHA-256 (`crypto`)
* **Proteção de Taxa (Rate Limit):** `express-rate-limit` (5 req / 15 min nas rotas críticas)
* **Agendador de Tarefas:** `node-cron`
* **Envio de E-mails:** `nodemailer`
* **Frontend:** React 18 (SPA via Vite)
* **Estilização:** Tailwind CSS (tokens do tema *Executive Precision*)
* **Ícones:** `lucide-react`
* **Visualização de Dados:** `recharts`
* **Containerização Local:** Docker & Docker Compose

### 2.2. Ambientes
* **Desenvolvimento Local:**
  * Banco de Dados: Container Docker PostgreSQL (porta padrão mapeada no host para `5433:5432` conforme [INC-001](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/docs/ERROS.md)).
  * Backend: Executado com recarga automática (`nodemon`) em `http://localhost:3001`.
  * Frontend: Servidor de desenvolvimento Vite em `http://localhost:5173`.
  * E-mails: Modo mock no `MailService` registrando confirmação em log no terminal (sem credenciais SMTP externas obrigatórias).
* **Produção:**
  * Backend: Executado via `npm start` em Node.js (modo cluster ou PM2/Docker), exigindo verificação de segurança no `config.js` (`JWT_SECRET` com no mínimo 32 caracteres, senha de banco forte e `FRONTEND_URL` configurada).
  * Banco de Dados: PostgreSQL com conexão SSL obrigatória (`rejectUnauthorized: true`).
  * Proxy Reverso: Suporte a `TRUST_PROXY=true` para Cloudflare/Nginx obter o IP real dos clientes.
  * Frontend: Build estático compilado com `npm run build` gerando artefatos otimizados na pasta `dist/`, servido por servidor web (Nginx/Apache/CDN).

---

## 3. Como Rodar Localmente

### 3.1. Pré-requisitos
* Docker e Docker Compose instalados e em execução.
* Node.js v18+ e npm v9+ instalados.

### 3.2. Passo a Passo

#### 1. Iniciar o Banco de Dados
Na raiz do projeto:
```bash
docker compose up -d
```
> O container `finance_postgres` subirá e ficará acessível na porta `5433` do host.

#### 2. Configurar o Backend
Acesse a pasta `backend/`:
```bash
cd backend
cp .env.example .env
npm install
```
> Verifique se o arquivo `backend/.env` aponta para `DB_PORT=5433`.

#### 3. Executar Migrações e Dados Iniciais (Seeds)
Ainda na pasta `backend/`:
```bash
npm run migrate
npm run seed
```

#### 4. Iniciar o Servidor Backend
```bash
npm run dev
```
> O servidor iniciará em `http://localhost:3001`. O endpoint de saúde estará acessível em `http://localhost:3001/api/health`.

#### 5. Configurar e Iniciar o Frontend
Em outro terminal, a partir da raiz do projeto:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
> O frontend Vite iniciará em `http://localhost:5173`.

---

## 4. Mapa de Pastas e Arquivos

```
├── AGENTS.md                 # Guia operacional e de contexto para IAs em modo manutenção
├── docker-compose.yml        # Orquestração do PostgreSQL 16 para desenvolvimento
├── assets/                   # Logotipos oficiais (logo.png, logo_branca.png)
├── docs/                     # Documentação viva do projeto
│   ├── FSD.md                # Especificação funcional, regras de negócio e schema DDL
│   ├── DESIGN.md             # Design tokens e padrões visuais do tema Executive Precision
│   ├── INSUMOS.md            # Inventário de arquivos de apoio
│   ├── PLANO.md              # Roteiro das fases do projeto
│   ├── STATUS.md             # Estado atual, entregas e pendências
│   ├── ERROS.md              # Histórico de incidentes e resoluções técnicas
│   ├── MANUTENCAO.md         # Este guia de manutenção e evolução
│   └── COMO-PEDIR-MUDANCAS.md# Guia para pessoas leigas pedirem mudanças com segurança
├── backend/
│   ├── .env.example          # Modelo de variáveis de ambiente do backend
│   ├── knexfile.js           # Configurações de conexão Knex (dev, test, prod)
│   ├── package.json          # Dependências e scripts do backend
│   ├── logs/
│   │   └── error.log         # Arquivo de log com erros capturados pela API
│   └── src/
│       ├── app.js            # Instância Express, middlewares globais, rotas e errorHandler
│       ├── server.js         # Ponto de inicialização do processo HTTP na porta configurada
│       ├── config/
│       │   └── config.js     # Configuração centralizada e validação de segurança do ambiente
│       ├── controllers/      # Recepção de requisições HTTP e retorno JSON
│       │   ├── authController.js
│       │   └── userController.js
│       ├── cron/             # Workers agendados em segundo plano
│       │   └── notificationWorker.js
│       ├── database/         # Infraestrutura Knex
│       │   ├── connection.js # Conexão única singleton com pool PostgreSQL
│       │   ├── migrations/   # Histórico de versionamento do banco
│       │   └── seeds/        # Carga inicial de formas de pagamento e categorias padrão
│       ├── middlewares/      # Interceptadores de requisições
│       │   ├── auth.js       # Validação de token JWT Bearer
│       │   ├── errorHandler.js # Tratamento global de erros e escrita em logs/error.log
│       │   ├── rateLimiter.js# Limitação de taxa de requisições (express-rate-limit)
│       │   └── validateUuid.js # Validação preventiva de parâmetros UUID em URLs
│       ├── repositories/     # Camada de persistência SQL pura via Knex
│       │   ├── userRepository.js
│       │   ├── tokenRepository.js
│       │   ├── securityLogRepository.js
│       │   └── categoryRepository.js
│       ├── routes/           # Mapeamento de endpoints REST
│       │   ├── authRoutes.js
│       │   └── userRoutes.js
│       └── services/         # Camada de regras de negócio, criptografia e validações
│           ├── authService.js
│           ├── userService.js
│           └── mailService.js
└── frontend/
    ├── .env.example          # Modelo de variáveis de ambiente do frontend
    ├── index.html            # HTML base com fontes Google (Plus Jakarta Sans e Inter)
    ├── package.json          # Dependências e scripts do frontend
    ├── vite.config.js        # Configuração do empacotador Vite
    ├── tailwind.config.js    # Design tokens configurados conforme DESIGN.md
    ├── public/assets/        # Assets estáticos servidos pelo Vite
    └── src/
        ├── main.jsx          # Ponto de entrada React (ReactDOM.createRoot)
        ├── App.jsx           # Estrutura de rotas e provedores da aplicação
        ├── index.css         # Importações do Tailwind e classes utilitárias
        ├── components/       # Componentes reutilizáveis
        │   ├── common/       # Botões, Badges, Modais genéricos
        │   ├── dashboard/    # Cards de KPI, Gráficos Recharts, Alertas
        │   ├── layout/       # Header, Sidebar, Container principal
        │   └── transactions/ # Tabela de extrato, modais de lançamentos e categorias
        ├── contexts/         # Estados globais (AuthContext)
        ├── pages/            # Páginas da aplicação (Login, Register, Dashboard, etc.)
        └── services/         # Cliente de integração HTTP (api.js com interceptors)
```

### 4.1. Cuidados por Pasta
* `backend/src/repositories/`: **Nunca** execute queries sem filtrar por `user_id` (exceto categorias padrão globais). Nunca use concatenação de strings em SQL — use sempre os métodos parametrizados do Knex.
* `backend/src/services/`: Todas as regras de negócio (RN01 a RN10), validação de tipos de dados e lógica financeira residem **aqui**, não nos controllers nem nos repositórios.
* `backend/src/database/migrations/`: **Nunca** altere um arquivo de migration que já tenha sido executado em ambientes compartilhados. Crie uma nova migration com timestamp atual.
* `frontend/tailwind.config.js`: Não introduza cores arbitrárias fora da paleta do `docs/DESIGN.md`.

---

## 5. Banco de Dados e Persistência

### 5.1. Mecanismo
O sistema utiliza **PostgreSQL** com **Knex.js** para gerenciamento de migrations e query building.

### 5.2. Onde ficam os arquivos
* **Configuração:** [`backend/knexfile.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/knexfile.js)
* **Conexão Singleton:** [`backend/src/database/connection.js`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/src/database/connection.js)
* **Migrations:** [`backend/src/database/migrations/`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/src/database/migrations/)
* **Seeds:** [`backend/src/database/seeds/`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/backend/src/database/seeds/)

### 5.3. Comandos Úteis
* Executar todas as migrations pendentes:
  ```bash
  cd backend && npm run migrate
  ```
* Reverter a última rodada de migrations:
  ```bash
  cd backend && npm run migrate:rollback
  ```
* Executar sementes de dados (seeds):
  ```bash
  cd backend && npm run seed
  ```
* Criar uma nova migration:
  ```bash
  cd backend && npx knex migrate:make nome_da_alteracao
  ```

### 5.4. Cuidados Importantes
1. **Auditoria e Integridade:** Todas as tabelas principais possuem trigger para atualização automática de `updated_at`.
2. **Exclusão em Cascata (RN10):** A tabela `users` possui `ON DELETE CASCADE` vinculada a `financial_transactions`, `categories` personalizadas e `password_reset_tokens`. Eventos de segurança devem ser persistidos em `security_logs` com `user_id = NULL` caso o registro do usuário seja deletado.
3. **Categorias com Vínculo (RN08):** `financial_transactions` referencia `categories` com `ON DELETE RESTRICT`. Uma categoria com lançamentos vinculados **nunca** pode ser apagada.

---

## 6. Autenticação, Autorização e Usuários

### 6.1. Fluxo de Autenticação
1. O usuário envia credenciais via `POST /api/auth/login`.
2. A rota é protegida por `rateLimiter.js` (máximo de 5 requisições por 15 minutos por IP).
3. O `authService.js` localiza o usuário pelo e-mail e valida o hash da senha usando `bcrypt.compare`.
4. É emitido um JWT assinado com a chave `JWT_SECRET`, contendo `{ user_id, email }`, válido por 24 horas.
5. As requisições subsequentes do frontend enviam o token no cabeçalho `Authorization: Bearer <token>`.
6. O middleware `auth.js` valida o token e injeta `req.user = { id: decoded.user_id, email: decoded.email }`.

### 6.2. Níveis de Acesso
O sistema adota o modelo de usuário único (*Single Tenant Lógico*):
* Todo usuário autenticado tem acesso **exclusivo** aos seus próprios lançamentos, suas categorias personalizadas e seus dados de perfil.
* As categorias padrão (`is_default = TRUE AND user_id IS NULL`) são abertas para leitura a todos os usuários autenticados, mas não podem ser alteradas ou excluídas por ninguém via API.

### 6.3. Cuidados ao Criar Novas Rotas Protegidas
* **Sempre** aplique o middleware `authMiddleware` na rota.
* **Sempre** extraia o ID do usuário de `req.user.id`, nunca de parâmetros fornecidos pelo cliente (`req.params` ou `req.body`).
* No frontend, se a API responder com `401 Unauthorized`, o cliente deve limpar o token do armazenamento local e redirecionar para a tela `/login`.

---

## 7. Como Fazer Alterações no Sistema

### 7.1. Como Adicionar uma Nova Tela

1. **Definir no FSD:** Verifique o propósito da tela e se requer novos endpoints.
2. **Criar a Página no Frontend:** Crie o arquivo em `frontend/src/pages/NomeDaPagina.jsx`.
3. **Registrar a Rota:** No arquivo `frontend/src/App.jsx`, importe o componente e adicione a rota dentro da estrutura do layout protegido (`<AppLayout />` ou rota pública).
4. **Adicionar Item na Navegação:** Se a tela for acessível pelo menu, atualize o componente de menu em `frontend/src/components/layout/Sidebar.jsx`.
5. **Estilização:** Siga estritamente os tokens de `docs/DESIGN.md` (cores, fontes `Plus Jakarta Sans` / `Inter`, elevações).
6. **Integração com a API:** Utilize o serviço centralizado `frontend/src/services/api.js` para realizar requisições.

### 7.2. Como Adicionar um Novo Campo a um Cadastro Existente

Exemplo: Adicionar o campo `notes` (texto opcional) na tabela de lançamentos `financial_transactions`.

1. **Criar Migration no Banco:**
   ```bash
   cd backend && npx knex migrate:make add_notes_to_financial_transactions
   ```
   Defina o método `up` com `table.text('notes').nullable();` e `down` com `table.dropColumn('notes');`. Aplique com `npm run migrate`.
2. **Atualizar o Repositório:** Em `backend/src/repositories/transactionRepository.js`, garanta que o novo campo seja incluído nos métodos de `create`, `update` e `findById` / `findAll`.
3. **Atualizar a Camada de Serviço:** Em `backend/src/services/transactionService.js`, adicione validação de sanitização (limite de caracteres, tipo string).
4. **Atualizar o Controller:** Em `backend/src/controllers/transactionController.js`, receba o campo do corpo da requisição.
5. **Atualizar o Formulário no Frontend:** No componente de modal de lançamentos (`TransactionModal.jsx`), adicione o input/textarea com label e controle de estado.
6. **Atualizar a Listagem/Tabela:** Se o campo for exibido no extrato, inclua a coluna ou tooltip correspondente no componente da tabela.
7. **Atualizar a Exportação CSV:** Se o campo for relevante para auditoria ou relatórios, adicione-o na geração do CSV em `csvExportService.js`.
8. **Documentar:** Atualize a seção correspondente em `docs/FSD.md` e o histórico em `docs/STATUS.md`.

### 7.3. Como Adicionar ou Alterar uma Regra de Negócio

1. **Consultar o FSD:** Leia atentamente a Seção 6 de `docs/FSD.md` para entender as regras vigentes e garantir que a nova regra não cause efeito colateral em RN01 a RN10.
2. **Localizar o Arquivo Service Correto:** A regra deve ser implementada no arquivo de serviço correspondente em `backend/src/services/` (ex.: `transactionService.js` ou `dashboardService.js`).
3. **Tratamento de Exceções:** Lance erros de negócio com status HTTP semântico (ex.: `400 Bad Request`, `409 Conflict`, `422 Unprocessable Entity`).
4. **Testes de Cenários:** Teste manualmente o fluxo positivo e todos os fluxos de erro (ex.: envio de dados inválidos, tentativas de burlar regras de permissão).

---

## 8. Como Testar Alterações

### 8.1. Testes Automatizados
* Para executar testes automatizados no backend:
  ```bash
  cd backend && npm test
  ```
  *(Quando scripts de teste estiverem configurados no `package.json`)*.

### 8.2. Testes Manuais Obrigatórios
A cada alteração relevante, valide os seguintes fluxos:
1. **Fluxo de Autenticação:** Login, expiração de token, registro e solicitação de recuperação de senha.
2. **Isolamento de Dados (RN01):** Certifique-se de que o usuário A não consegue ler, alterar ou excluir dados do usuário B.
3. **Cálculos de Saldo (RN02 e RN03):**
   * Saldo Atual soma apenas receitas pagas (`payment_date <= data atual`) e subtrai despesas pagas.
   * Saldo Previsto projeta o impacto das contas pendentes do mês.
4. **Compatibilidade Categoria x Lançamento (RN08):** Uma despesa nunca pode receber uma categoria do tipo receita e vice-versa.
5. **Datas e Status (RN05):** Status `PAGO` exige `payment_date`; status `PENDENTE` exige `payment_date = NULL`.

### 8.3. Verificação de Logs de Erro
Qualquer erro não tratado ou exceção da API é gravado automaticamente em:
```
backend/logs/error.log
```
* Verifique o conteúdo do arquivo com `tail -n 50 backend/logs/error.log` ou abra o arquivo diretamente.
* O logger sanitiza automaticamente tokens e senhas para evitar vazamento de dados sensíveis.

### 8.4. Registro de Erros
Se encontrar um bug durante a execução ou manutenção, **não o ignore**. Registre-o imediatamente em `docs/ERROS.md` contendo:
* ID incremental (ex.: INC-007)
* Data
* Contexto e sintoma
* Causa-raiz
* Solução adotada
* Como evitar no futuro

---

## 9. Diretrizes Rígidas de Segurança

Toda alteração futura deve respeitar impreterivelmente estas diretrizes:

1. **Isolamento por `user_id` (RN01):** Todo acesso ao banco deve ser vinculado ao `user_id` decodificado do JWT. Nunca confie em identificadores vindos no payload da requisição.
2. **Proteção contra Injeção SQL:** Utilize apenas o query builder do Knex com parâmetros preparados. Nunca use template strings para concatenar SQL (`knex.raw('... ${var}')` é proibido).
3. **Segurança de Senhas:** Senhas devem ser tratadas com `bcrypt` (fator de custo 10) e nunca devem ser registradas em logs ou retornadas em endpoints JSON.
4. **Proteção contra Força Bruta:** Endpoints críticos de autenticação devem manter o middleware `rateLimiter.js` ativo.
5. **Validação de UUIDs:** Parâmetros `:id` nas rotas devem ser validados pelo middleware `validateUuid.js` para rejeitar IDs malformatados antes de atingir o banco.
6. **Variáveis de Ambiente e Segredos:** Nunca comite arquivos `.env`. Utilize exclusivamente `.env.example` com placeholders.
7. **Sanitização de Respostas e Headers:** O Express deve manter `app.disable('x-powered-by')` e o endpoint `/api/health` nunca deve revelar o ambiente de execução.

---

## 10. O que NÃO Fazer

* **NÃO** instale bibliotecas não especificadas sem justificativa arquitetural documentada.
* **NÃO** remova verificações de autenticação ou rate limit para "facilitar testes".
* **NÃO** altere tipos de colunas em banco sem criar uma migration reversível (`down`).
* **NÃO** misture lógica de persistência SQL dentro de Controllers ou Services — use Repositories.
* **NÃO** hardcode URLs, portas ou credenciais de banco no código-fonte.
* **NÃO** ignore a atualização de `docs/STATUS.md` após concluir uma etapa de trabalho.
