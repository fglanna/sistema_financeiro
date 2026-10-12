# Guia de Publicação e Infraestrutura de Produção (DEPLOY.md)

Este documento descreve a estratégia, os requisitos e o passo a passo para a publicação segura do **Sistema de Controle Financeiro Pessoal**, utilizando:
* **Frontend:** Vercel (SPA React + Vite)
* **Backend:** Render (Web Service Node.js + Express)
* **Banco de Dados:** PostgreSQL Gerenciado (Render PostgreSQL, Neon, Supabase ou similar)
* **Agendador Cron (RN07):** Agendador em nuvem externo disparando endpoint HTTPS seguro com token secreto

> [!IMPORTANT]
> **Aviso de Escopo Funcional:** A preparação desta infraestrutura **não** torna o sistema pronto para uso final de produção. As fases de domínio e telas (**Fases 4, 5, 6 e 7**) devem ser concluídas para que a aplicação tenha suas funcionalidades completas (lançamentos, categorias, dashboard com gráficos e extrato financeiro).

---

## 1. Arquitetura de Publicação

```
  +-----------------------------+
  |       Navegador Web         |
  +--------------+--------------+
                 |
                 v (HTTPS)
  +-----------------------------+
  |    Vercel (Frontend SPA)    | <--- Roteamento SPA via vercel.json
  |  https://app.seudominio.com |
  +--------------+--------------+
                 |
                 | API REST (HTTPS / CORS Restrito)
                 v
  +-----------------------------+
  |   Render (Node.js API)      | <--- Web Service atrás de Proxy Reverso (TRUST_PROXY=true)
  | https://api.seudominio.com  |
  +-------+-------------+-------+
          |             ^
          |             | Acionamento Diário às 06:00 (America/Sao_Paulo)
          |             | POST /api/cron/daily-alerts (Bearer CRON_SECRET)
          |             +-----------------------------------------+
          v (SSL Obrigatório)                                    |
  +-----------------------------+                 +---------------+---------------+
  |   PostgreSQL Gerenciado     |                 |  Agendador Externo de Nuvem   |
  |  (DATABASE_URL / SSL)       |                 | (cron-job.org / GitHub Actions|
  +-----------------------------+                 +-------------------------------+
```

---

## 2. Variáveis de Ambiente em Produção

### 2.1. Backend (Painel do Render)

No painel do Render, acesse **Environment Variables** do seu Web Service e configure:

| Variável | Valor Recomendado | Finalidade |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Ativa otimizações do Express e verificações rígidas de segurança. |
| `PORT` | *(definido pelo Render)* | O Render injeta automaticamente a porta interna (ex.: 10000). |
| `FRONTEND_URL` | `https://seu-frontend.vercel.app` | **Obrigatório.** Restringe o CORS exclusivamente ao domínio da SPA. |
| `TRUST_PROXY` | `true` | **Obrigatório.** Permite capturar o IP real do cliente atrás do proxy para o Rate Limiter. |
| `JWT_SECRET` | *(string aleatória de 32+ caracteres)* | Assinatura e integridade dos tokens JWT (bloqueia o servidor se fraco). |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname?sslmode=require` | Conexão do banco gerenciado fornecida pelo provedor. |
| `DB_SSL` | `true` | Ativa conexão criptografada com o PostgreSQL. |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` | Validação de certificados SSL. Mude para `false` apenas se o provedor nuvem usar certificados auto-assinados. |
| `CRON_SECRET` | *(chave aleatória de 32+ caracteres)* | Segredo para autorizar acionamentos externos da rotina matinal das 06:00. |
| `CRON_TIMEOUT_MS` | `30000` | Limite de tempo de execução da rotina (30 segundos). |
| `SMTP_HOST` | *(ex.: smtp.resend.com / smtp.sendgrid.net)* | Host do provedor transacional de e-mails. |
| `SMTP_PORT` | `587` ou `465` | Porta TLS/SSL do provedor SMTP. |
| `SMTP_USER` | *(seu usuário SMTP)* | Credencial de envio. |
| `SMTP_PASS` | *(sua senha SMTP)* | Credencial de envio. |
| `SMTP_FROM` | `Financeiro <nao-responda@seudominio.com>` | Remetente dos e-mails de recuperação de senha e alertas. |

> [!CAUTION]
> **Nunca** inclua arquivos `.env` ou senhas reais no controle de versão Git. Configure-os exclusivamente através da interface web do Render.

---

### 2.2. Frontend (Painel da Vercel)

No painel da Vercel, acesse **Settings > Environment Variables**:

| Variável | Valor Recomendado | Finalidade |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://sua-api.onrender.com/api` | Prefixo HTTPS de todas as chamadas HTTP à API. |

---

## 3. Configuração dos Serviços

### 3.1. Frontend na Vercel
1. No painel da Vercel, clique em **Add New... > Project** e selecione o repositório GitHub.
2. Na seção **Root Directory**, clique em **Edit** e selecione a pasta: `frontend`.
3. Framework Preset: **Vite**.
4. Verifique as configurações de Build:
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Install Command:** `npm install`
5. Adicione a variável `VITE_API_BASE_URL` conforme tabela acima.
6. Clique em **Deploy**.
7. O arquivo [`frontend/vercel.json`](file:///e:/Jornada_IA-VibeCoding/sistema_financeiro/frontend/vercel.json) já contém a regra de rewrite para direcionar todas as rotas para `index.html`, evitando erros 404 em recarregamentos (F5).

---

### 3.2. Backend no Render
1. No painel do Render, selecione **New + > Web Service** e conecte o repositório.
2. Configure os campos:
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
3. Configure todas as variáveis de ambiente descritas na seção 2.1.
4. **Plano:** Pode ser utilizado o plano Free (com a estratégia de Cron via webhook externo detalhada no item 5).

---

## 4. Estratégia Segura de Migrations em Produção

> [!WARNING]
> **Por que NÃO executar `npm run migrate` automaticamente no Build Command em produção?**
> A execução cega de migrações em cada build automatizado apresenta riscos graves:
> 1. Se um deploy falhar no meio da inicialização, o banco pode ficar em estado inconsistente.
> 2. Se duas instâncias subirem simultaneamente, pode haver concorrência (*race condition*) no schema.
> 3. Impossibilita conferência humana de planos de execução antes de alterações estruturais.

### Procedimento Recomendado para Migrações de Produção:
1. **Inspeção Prévia:** Verifique o arquivo de migração para assegurar que não há instruções destrutivas (`DROP TABLE`, `DROP COLUMN`) sem estratégia de contingência.
2. **Execução Deliberada:**
   * **Via Shell do Render:** Acesse a aba **Shell** do Web Service no Render e execute manualmente:
     ```bash
     npm run migrate
     ```
   * **Ou via Script Local com Conexão Segura:** Rodar apontando `DATABASE_URL` de produção temporariamente em uma máquina segura:
     ```bash
     DATABASE_URL="sua_string_producao" npm run migrate
     ```
3. **Verificação de Status:** Confirme que todas as migrações foram aplicadas:
   ```bash
   npx knex migrate:status
   ```
4. **Seeds em Produção:** O comando `npm run seed` só deve ser rodado uma única vez na inicialização de um banco virgem para criar formas de pagamento e categorias padrão globais. Nunca execute seeds destrutivos com `truncate`.

---

## 5. Rotina Cron Diária (RN07: 06:00 AM em America/Sao_Paulo)

A regra de negócio **RN07** exige que os alertas matinais sejam disparados impreterivelmente às **06:00 AM no fuso horário de Brasília** (`America/Sao_Paulo`).

### Por que usar Webhook Externo?
No plano Free do Render, os servidores entram em modo de suspensão (*spin down*) após 15 minutos sem tráfego HTTP. Agendadores em memória (`node-cron`) congelam e **não disparam**.

### Arquitetura de Disparo:
1. O backend expõe o endpoint seguro:
   * **Método:** `POST`
   * **Rota:** `https://sua-api.onrender.com/api/cron/daily-alerts`
   * **Cabeçalho:** `Authorization: Bearer <SEU_CRON_SECRET>`
2. **Mecanismos de Proteção Implementados:**
   * **Timing-Safe Auth:** O middleware `cronAuthMiddleware` compara o token usando `crypto.timingSafeEqual`.
   * **Idempotência por Data Civil:** O serviço verifica se já houve um registro `CRON_DAILY_ALERTS_SUCCESS` na data civil atual de Brasília na tabela `security_logs`. Se o agendador fizer retries automáticos no mesmo dia, o sistema responde com status `200` e motivo `already_executed`, prevenindo 100% de e-mails duplicados aos clientes.
   * **Timeout de Segurança:** Limite estrito de tempo de execução (`CRON_TIMEOUT_MS = 30000`).
   * **Auditoria:** Registro detalhado com IP, data de execução e duração em `security_logs`.

### Configuração no Agendador Externo (ex.: cron-job.org):
1. Crie uma conta gratuita em [cron-job.org](https://cron-job.org).
2. Crie um novo Cron Job:
   * **Title:** `Painel Financeiro - Alertas Diários`
   * **URL:** `https://sua-api.onrender.com/api/cron/daily-alerts`
   * **Schedule:** Diário às `06:00` selecionando o fuso horário `America/Sao_Paulo` (ou `09:00 UTC`).
   * **Request Method:** `POST`
   * **Headers:** Adicionar cabeçalho:
     * Chave: `Authorization`
     * Valor: `Bearer <SEU_CRON_SECRET>`
3. Salve o agendamento.
4. Ao disparar, a requisição externa "acorda" a API caso ela esteja suspensa e processa os envios com total integridade.

---

## 6. Checklist de Validação Pós-Deploy

Após configurar a Vercel, o Render e o Banco:

1. **Health Check da API:**
   * Acesse no navegador: `https://sua-api.onrender.com/api/health`
   * Resposta esperada: `{"status":"ok","timestamp":"..."}` (sem expor variáveis internas).
2. **CORS e Carregamento do Frontend:**
   * Acesse `https://seu-frontend.vercel.app`.
   * Abra o DevTools (F12) > Console. Confirme que não há erros de bloqueio de CORS.
3. **Roteamento SPA:**
   * Navegue para qualquer rota interna e pressione F5 (Recarregar).
   * Confirme que a página não retorna erro 404 da Vercel.
4. **Teste de Autenticação do Cron:**
   * Faça uma requisição sem token:
     ```bash
     curl -X POST https://sua-api.onrender.com/api/cron/daily-alerts
     ```
     *Resposta esperada:* `401 Unauthorized`.
   * Faça uma requisição com o token correto:
     ```bash
     curl -X POST https://sua-api.onrender.com/api/cron/daily-alerts -H "Authorization: Bearer <SEU_CRON_SECRET>"
     ```
     *Resposta esperada:* `200 OK` com `status: "completed"`.
   * Repita a requisição no mesmo dia:
     *Resposta esperada:* `200 OK` com `status: "skipped"` e `reason: "already_executed"`.
