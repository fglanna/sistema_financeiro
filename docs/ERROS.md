# Registro de Incidentes e Soluções (ERROS.md)

Este documento registra os erros encontrados durante o ciclo de vida do projeto, suas causas-raiz, soluções adotadas e boas práticas para evitar reincidências.

---

| ID | Data | Contexto / Módulo | Descrição do Erro | Causa-Raiz | Solução Aplicada | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| INC-001 | 29/09/2026 | Infraestrutura / PostgreSQL | Conflito de porta 5432 na inicialização do container Docker com serviço PostgreSQL nativo do Windows. | O sistema operacional host possuía uma instância nativa do PostgreSQL em execução na porta 5432. | Configurada a variável `DB_PORT=5433` no arquivo `.env` raiz e `backend/.env`, permitindo mapeamento de portas limpo e isolado no container Docker. | Resolvido |

---

## 29/09/2026 - Conflito de porta no PostgreSQL local

- **Sintoma:** Falha de autenticação ao tentar conectar no `localhost:5432` devido ao serviço PostgreSQL nativo pré-existente no Windows responder antes do container Docker.
- **Causa:** A porta padrão `5432` estava alocada pelo serviço local `postgresql-x64-18` do sistema operacional.
- **Solução aplicada:** Definido o mapeamento do container para porta `5433:5432` através das variáveis de ambiente `DB_PORT=5433` no `.env` e no `backend/.env`.
- **Como evitar no futuro:** Sempre utilizar arquivos `.env` para parametrização dinâmica de portas de infraestrutura, garantindo que o Knex e a aplicação se comuniquem com a porta configurada no ambiente.

---

### Notas de Contingência
* Qualquer falha durante instalação de dependências, execução de migrations ou integração de serviços deve ser catalogada acima com seu respectivo plano de ação.
