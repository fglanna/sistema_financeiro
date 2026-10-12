# AGENTS.md — Guia Operacional em Modo Manutenção

Este documento estabelece as regras, convenções e o protocolo obrigatório de atuação para agentes de Inteligência Artificial e desenvolvedores encarregados da **manutenção contínua, correção de bugs e evolução** do **Sistema de Controle Financeiro Pessoal**.

> **Regra Primária de Comunicação:** Responda SEMPRE em **português do Brasil**.

---

## 1. Documentos Obrigatórios de Referência

Antes de planejar ou executar **qualquer alteração no código**, é **estritamente obrigatório** consultar os documentos oficiais do projeto na ordem abaixo:

1. `docs/MANUTENCAO.md`: Guia de manutenção, mapa técnico detalhado, boas práticas e orientações para evolução do sistema.
2. `docs/FSD.md`: Fonte primária de verdade técnica, arquitetura, schema DDL relacional, regras de negócio inegociáveis (RN01 a RN10) e contratos de API REST.
3. `docs/DESIGN.md`: Sistema de design visual (*Executive Precision*), tokens de cores, tipografia (Plus Jakarta Sans / Inter), espaçamentos e elevações (obrigatório se a mudança envolver interface gráfica).
4. `docs/STATUS.md`: Registro do estado atual do sistema, funcionalidades implementadas, fases em aberto e pendências.
5. `docs/ERROS.md`: Registro histórico de incidentes catalogados (INC-001 em diante), causas-raiz identificadas e soluções aplicadas.

---

## 2. Stack Tecnológica e Arquitetura do Sistema

* **Modelo Arquitetural:** Arquitetura desacoplada Fullstack JavaScript (SPA em React + API RESTful em Express.js).
* **Backend:**
  * Node.js (v18+) com Express.js.
  * Banco de Dados: PostgreSQL 16 (orquestrado via Docker Compose no desenvolvimento local).
  * Camada de Persistência: Knex.js Query Builder + Migrations / Seeds (driver `pg`), organizado em Repositories com queries parametrizadas.
  * Autenticação e Criptografia: `jsonwebtoken` (JWT com expiração de 24h, assinado com `JWT_SECRET`) e `bcrypt` (fator de custo 10).
  * Rate Limiting: `express-rate-limit` (5 req / 15 min nas rotas `POST /api/auth/login` e `POST /api/auth/forgot-password`).
  * Worker Background & Notificações: `node-cron` (agendamento diário às 06:00 AM no fuso `America/Sao_Paulo`) e `nodemailer`.
* **Frontend:**
  * React 18 (Single Page Application desenvolvida com Vite).
  * Estilização: Tailwind CSS (estritamente mapeado para os tokens do `docs/DESIGN.md`).
  * Ícones: `lucide-react`.
  * Gráficos e Visualização: `recharts`.
  * Numerais Tabulares: `tabular-nums` obrigatório em cards, métricas e tabelas de extrato.
* **Infraestrutura Local:**
  * Docker Compose gerenciando PostgreSQL na porta mapeada `5433:5432` (para contornar instâncias locais nativas conforme INC-001).

---

## 3. Resumo da Estrutura de Pastas

Todos os caminhos no repositório devem ser mantidos estritamente relativos à raiz do projeto:

```
├── AGENTS.md                  # Este guia operacional em modo manutenção
├── docker-compose.yml         # Container PostgreSQL para desenvolvimento
├── assets/                    # Logotipos oficiais (logo.png, logo_branca.png)
├── docs/                      # Documentação viva do projeto
│   ├── FSD.md                 # Especificação funcional completa e regras de negócio
│   ├── DESIGN.md              # Design system Executive Precision
│   ├── INSUMOS.md             # Inventário de insumos estáticos
│   ├── PLANO.md               # Cronograma e fases de desenvolvimento
│   ├── STATUS.md              # Estado atual de entregas e pendências
│   ├── ERROS.md               # Registro de incidentes e soluções
│   ├── MANUTENCAO.md          # Guia técnico de manutenção e evolução
│   └── COMO-PEDIR-MUDANCAS.md # Modelos de prompts para solicitações de mudanças
├── backend/
│   ├── .env.example           # Modelo de variáveis de ambiente
│   ├── knexfile.js            # Configurações Knex para ambientes dev/test/prod
│   ├── package.json           # Dependências e scripts do backend
│   ├── logs/
│   │   └── error.log          # Log centralizado de erros da API
│   └── src/
│       ├── config/config.js   # Validação de segurança e leitura de ambiente
│       ├── controllers/       # Recepção HTTP e respostas JSON
│       ├── cron/              # Workers agendados (notificações)
│       ├── database/          # Migrations, Seeds e conexão Knex
│       ├── middlewares/       # Auth JWT, Rate Limit, Error Handler, UUID Validation
│       ├── repositories/      # Queries SQL parametrizadas isoladas por user_id
│       ├── routes/            # Definição e proteção de endpoints REST
│       ├── services/          # Regras de negócio, cálculos financeiros e validações
│       ├── app.js             # Configuração Express e middlewares
│       └── server.js          # Inicialização do servidor HTTP
└── frontend/
    ├── .env.example           # Modelo de variáveis de ambiente do frontend
    ├── index.html             # HTML base com importação de fontes tipográficas
    ├── package.json           # Dependências e scripts do frontend
    ├── vite.config.js         # Configurações do Vite
    ├── tailwind.config.js     # Tokens do Executive Precision
    ├── public/assets/         # Logotipos e assets estáticos
    └── src/
        ├── components/        # Componentes reutilizáveis (common, dashboard, layout, transactions)
        ├── contexts/          # Contextos React (AuthContext)
        ├── pages/             # Telas da aplicação (Login, Register, Dashboard, Transactions, Profile)
        ├── services/api.js    # Cliente Axios/Fetch com interceptors de autenticação
        ├── App.jsx            # Roteamento da aplicação
        └── main.jsx           # Ponto de montagem React
```

---

## 4. Comandos Reais de Execução e Manutenção

### 4.1. Infraestrutura do Banco de Dados
* Iniciar PostgreSQL: `docker compose up -d`
* Parar PostgreSQL: `docker compose down`

### 4.2. Backend
* Instalar dependências: `cd backend && npm install`
* Aplicar novas migrations: `cd backend && npm run migrate`
* Reverter última migration: `cd backend && npm run migrate:rollback`
* Aplicar seeds: `cd backend && npm run seed`
* Executar em modo desenvolvimento: `cd backend && npm run dev`
* Executar em produção: `cd backend && npm start`

### 4.3. Frontend
* Instalar dependências: `cd frontend && npm install`
* Iniciar em desenvolvimento: `cd frontend && npm run dev`
* Compilar build de produção: `cd frontend && npm run build`
* Pré-visualizar build: `cd frontend && npm run preview`

---

## 5. Protocolo Obrigatório para Mudanças Futuras

Toda IA ou desenvolvedor deve seguir rigorosamente este ciclo de trabalho:

### Antes de qualquer alteração:
1. **Ler `docs/MANUTENCAO.md`:** Entenda as convenções técnicas e o fluxo do módulo a ser alterado.
2. **Ler `docs/FSD.md`:** Verifique as regras de negócio vigentes e o schema relacional.
3. **Ler `docs/DESIGN.md`:** Verifique os tokens de design se a alteração envolver interface de usuário.
4. **Ler `docs/STATUS.md`:** Confira o estado atual de implementação e pendências ativas.
5. **Ler `docs/ERROS.md`:** Verifique se o problema já ocorreu no passado e como foi solucionado.
6. **Entender o pedido do usuário:** Esclareça ambiguidades antes de propor soluções.
7. **Explicar o plano antes de alterar arquivos:** Apresente ao usuário os arquivos que serão modificados e o racional da solução.

### Depois de qualquer alteração:
1. **Testar o que foi alterado:** Execute os testes manuais ou automatizados cobrindo fluxos felizes e cenários de erro.
2. **Atualizar `docs/STATUS.md`:** Registre a alteração realizada, a data e o status do projeto.
3. **Registrar erro e solução em `docs/ERROS.md`:** Se algum incidente ou bug ocorreu durante o processo, documente-o imediatamente.
4. **Fazer commit ou entregar os comandos:** Verifique o `git status` para garantir que segredos não sejam versionados e monte um commit semântico.
5. **Explicar ao usuário como validar:** Diga exatamente quais telas, botões ou comandos ele deve usar para validar a entrega no navegador.

---

## 6. Diretrizes Inegociáveis de Segurança e Estabilidade

1. **Multi-tenancy e Isolamento de Dados (RN01):** Todo acesso ao banco de dados deve ser obrigatoriamente filtrado pelo `user_id` extraído do token JWT autenticado (`req.user.id`).
2. **Proteção contra Injeção SQL:** Utilize exclusivamente queries parametrizadas via Knex.js na camada de Repositories.
3. **Segurança de Senhas:** Criptografia com `bcrypt` (fator 10). Senhas e tokens nunca devem constar em respostas JSON ou arquivos de log.
4. **Rate Limiting:** As rotas `POST /api/auth/login` e `POST /api/auth/forgot-password` devem obrigatoriamente preservar o limitador de 5 req / 15 min.
5. **Preservação de Regras Financeiras:**
   * **RN02:** Saldo Atual = Saldo Inicial + Receitas Pagas (`payment_date <= CURRENT_DATE`) - Despesas Pagas.
   * **RN03:** Saldo Previsto = Saldo Atual + Receitas Pendentes do Mês - Despesas Pendentes do Mês.
   * **RN05:** `due_date` é obrigatório; se `PAGO`, `payment_date` é obrigatório; se `PENDENTE`, `payment_date` deve ser `NULL`.
   * **RN08:** `category.type === transaction.type` validado na camada de Service. Proibido alterar o tipo ou excluir categorias com lançamentos vinculados.
   * **RN09:** Exportação CSV gerada diretamente em buffer de memória sem gravação em disco.
   * **RN10:** Exclusão de usuário aciona `ON DELETE CASCADE` com auditoria em `security_logs`.
6. **Não Quebrar Funcionalidades Existentes:** Nunca reescreva módulos inteiros sem necessidade. Mantenha compatibilidade com o schema e endpoints existentes.
7. **Segredos e `.env`:** Nunca versionar arquivos com chaves privadas, senhas reais de banco ou credenciais SMTP.
