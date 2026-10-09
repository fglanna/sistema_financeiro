# Registro de Incidentes e Soluções (ERROS.md)

Este documento registra os erros encontrados durante o ciclo de vida do projeto, suas causas-raiz, soluções adotadas e boas práticas para evitar reincidências.

---

| ID | Data | Contexto / Módulo | Descrição do Erro | Causa-Raiz | Solução Aplicada | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| INC-001 | 29/09/2026 | Infraestrutura / PostgreSQL | Conflito de porta 5432 na inicialização do container Docker com serviço PostgreSQL nativo do Windows. | O sistema operacional host possuía uma instância nativa do PostgreSQL em execução na porta 5432. | Configurada a variável `DB_PORT=5433` no arquivo `.env` raiz e `backend/.env`, permitindo mapeamento de portas limpo e isolado no container Docker. | Resolvido |
| INC-002 | 09/10/2026 | config.js / Segurança | Ausência de validação que impedisse a inicialização em produção com JWT_SECRET padrão ou fraco. | O arquivo `config.js` usava fallback estático `'chave_secreta_padrao_desenvolvimento'` sem qualquer bloqueio em ambiente de produção. | Adicionada validação no `config.js` que interrompe o processo (`process.exit(1)`) se `NODE_ENV=production` e `JWT_SECRET` for ausente, estiver na lista de valores padrão inseguros ou tiver menos de 32 caracteres. Validações equivalentes adicionadas para `DB_PASSWORD` e `FRONTEND_URL`. | Resolvido |
| INC-003 | 09/10/2026 | app.js / Health Check | Endpoint `/api/health` expunha o campo `environment` (valor `development` ou `production`) para qualquer cliente sem autenticação. | O campo `environment: config.nodeEnv` foi incluído desnecessariamente na resposta pública do health check. | Campo `environment` removido da resposta do endpoint `/api/health`. A rota continua retornando `status: 'ok'` e `timestamp`. | Resolvido |
| INC-004 | 09/10/2026 | mailService.js / Tokens | Token de redefinição de senha vazava no console em ambiente de desenvolvimento. | O modo mock do `MailService` logava a URL completa de reset (incluindo o token bruto) com `console.log`. | Log alterado para exibir apenas confirmação de geração sem revelar a URL ou o token. O token em texto claro nunca deve aparecer em logs. | Resolvido |
| INC-005 | 09/10/2026 | knexfile.js / SSL | Configuração SSL de banco em produção usava `rejectUnauthorized: false`, desativando verificação de certificado. | O valor hardcoded `{ rejectUnauthorized: false }` foi mantido como padrão ao ativar `DB_SSL=true`, expondo conexões a ataques man-in-the-middle. | Alterado para `rejectUnauthorized: true` por padrão. Pode ser sobrescrito via `DB_SSL_REJECT_UNAUTHORIZED=false` apenas quando o ambiente gerenciado utilizar certificado auto-assinado (ex: alguns provedores cloud). | Resolvido |

---

## 29/09/2026 - Conflito de porta no PostgreSQL local

- **Sintoma:** Falha de autenticação ao tentar conectar no `localhost:5432` devido ao serviço PostgreSQL nativo pré-existente no Windows responder antes do container Docker.
- **Causa:** A porta padrão `5432` estava alocada pelo serviço local `postgresql-x64-18` do sistema operacional.
- **Solução aplicada:** Definido o mapeamento do container para porta `5433:5432` através das variáveis de ambiente `DB_PORT=5433` no `.env` e no `backend/.env`.
- **Como evitar no futuro:** Sempre utilizar arquivos `.env` para parametrização dinâmica de portas de infraestrutura, garantindo que o Knex e a aplicação se comuniquem com a porta configurada no ambiente.

---

## 09/10/2026 - Ausência de guarda de segurança para JWT_SECRET em produção

- **Sintoma:** Sistema poderia ser iniciado em produção com JWT_SECRET padrão (`chave_secreta_padrao_desenvolvimento`), tornando todos os tokens JWT previsíveis e forjáveis por qualquer pessoa que conhecesse o valor padrão.
- **Causa:** O arquivo `config.js` utilizava um fallback estático sem qualquer validação de ambiente ou força da chave.
- **Solução aplicada:** Bloco de validação adicionado no `config.js` que aborta o processo com mensagem clara caso `NODE_ENV=production` e `JWT_SECRET` não esteja configurado corretamente.
- **Como evitar no futuro:** Toda variável de segurança crítica deve ter validação de presença e força mínima na inicialização do servidor em produção.

---

## 09/10/2026 - Exposição de ambiente no health check público

- **Sintoma:** Qualquer pessoa com acesso à URL do backend conseguia saber se o sistema estava em `development` ou `production` acessando `/api/health`.
- **Causa:** O campo `environment: config.nodeEnv` foi incluído na resposta JSON do health check sem necessidade funcional.
- **Solução aplicada:** Campo `environment` removido da resposta do endpoint `/api/health`.
- **Como evitar no futuro:** Endpoints públicos (sem autenticação) devem expor o mínimo possível de informações sobre a infraestrutura.

---

## 09/10/2026 - Token de reset de senha vazando em logs de desenvolvimento

- **Sintoma:** O token bruto de redefinição de senha aparecia no console do servidor em desenvolvimento, podendo ser capturado por quem tivesse acesso aos logs.
- **Causa:** O modo mock do `MailService` registrava `resetUrl` completa (com token) via `console.log`.
- **Solução aplicada:** Log alterado para confirmar apenas que o envio foi simulado, sem exibir URL ou token.
- **Como evitar no futuro:** Nunca registrar tokens, senhas ou credenciais em logs, mesmo em modo desenvolvimento.

---

## 09/10/2026 - SSL de banco de dados com verificação de certificado desativada

- **Sintoma:** Ao ativar `DB_SSL=true` em produção, a conexão com o banco era estabelecida sem validar o certificado do servidor (`rejectUnauthorized: false`), vulnerável a ataques man-in-the-middle.
- **Causa:** Valor hardcoded no `knexfile.js` para facilitar compatibilidade com provedores cloud, mas sem controle via variável de ambiente.
- **Solução aplicada:** Padrão alterado para `rejectUnauthorized: true`. Permite override via `DB_SSL_REJECT_UNAUTHORIZED=false` quando necessário.
- **Como evitar no futuro:** Em produção, SSL deve sempre validar o certificado do servidor, a menos que haja razão técnica explícita documentada.

---

### Notas de Contingência
* Qualquer falha durante instalação de dependências, execução de migrations ou integração de serviços deve ser catalogada acima com seu respectivo plano de ação.

