# Guia de Como Solicitar Mudanças para a IA — Sistema de Controle Financeiro Pessoal

Este documento foi criado para ajudar qualquer pessoa (mesmo sem conhecimentos técnicos de programação) a solicitar alterações, melhorias e correções para uma Inteligência Artificial no projeto.

---

## 1. Como Conversar com a IA

Para que a Inteligência Artificial trabalhe com segurança, sem quebrar funcionalidades existentes e respeitando as regras do sistema, siga estas regras simples:

1. **Abra um chat novo para tarefas novas ou complexas:** Isso evita que a IA fique confusa com históricos longos.
2. **Peça sempre para a IA ler a documentação do projeto primeiro:** Antes de alterar qualquer linha de código, ela deve ler os arquivos que explicam como o sistema funciona.
3. **Seja específico no seu pedido:** Diga exatamente qual tela, campo ou comportamento você quer mudar e o que espera como resultado final.
4. **Peça para a IA explicar o plano antes de agir:** Isso permite que você revise o que ela pretende fazer antes de qualquer código ser alterado.
5. **Peça instruções de teste:** A IA deve sempre dizer como você pode testar se a alteração deu certo no navegador ou terminal.

---

## 2. A "Regra de Ouro" de Todo Pedido

Em **todo início de conversa**, inclua a seguinte instrução para a IA:

> *"Antes de começar, leia integralmente os arquivos `docs/MANUTENCAO.md`, `docs/FSD.md`, `docs/DESIGN.md`, `docs/STATUS.md` e `docs/ERROS.md`. Explique o seu plano de ação antes de fazer qualquer alteração de código."*

Isso garante que a IA não inventará comandos inexistentes nem mudará a tecnologia do sistema.

---

## 3. Checklist Antes de Aceitar Qualquer Mudança

Antes de considerar uma alteração como finalizada, confira se a IA cumpriu esta lista:

- [ ] A alteração foi feita sem quebrar o banco de dados existente?
- [ ] O isolamento dos dados de cada usuário (`user_id`) foi mantido?
- [ ] A aparência e as cores respeitam o padrão visual (*Executive Precision* do `docs/DESIGN.md`)?
- [ ] Foram fornecidos os passos claros de teste para você validar no navegador?
- [ ] O arquivo `docs/STATUS.md` foi atualizado com o que foi feito?
- [ ] Se houve algum erro durante o processo, ele foi registrado em `docs/ERROS.md`?
- [ ] Nenhum arquivo com senhas ou segredos (como `.env`) foi adicionado ao Git?

---

## 4. Modelos de Prompts Prontos

Copie e cole os modelos abaixo no seu chat com a IA, ajustando apenas as informações entre colchetes `[ ]`.

---

### Modelo 1: Adicionar um Novo Campo em um Cadastro
Use este modelo quando precisar de uma nova informação em lançamentos, categorias ou perfil.

```text
Responda em português do Brasil.

Antes de qualquer ação, leia integralmente:
- docs/MANUTENCAO.md
- docs/FSD.md
- docs/STATUS.md
- docs/ERROS.md

Preciso adicionar um novo campo no sistema:
- Onde adicionar: No cadastro de Lançamentos Financeiros (financial_transactions).
- Nome do campo: [Observações / Notas Adicionais]
- Tipo de dado: [Texto livre / opcional / até 500 caracteres]
- Comportamento: [Deve aparecer no modal de novo/edição de lançamento e como um ícone/tooltip na tabela do extrato]

Por favor:
1. Apresente o plano detalhado (migration Knex, repositório, service, formulário no React).
2. Não altere nada antes de eu confirmar o plano.
3. Garanta que a alteração seja retrocompatível e não apague dados existentes no banco.
```

---

### Modelo 2: Criar uma Nova Tela no Sistema
Use este modelo para adicionar uma nova página à aplicação.

```text
Responda em português do Brasil.

Antes de qualquer ação, leia integralmente:
- docs/MANUTENCAO.md
- docs/FSD.md
- docs/DESIGN.md
- docs/STATUS.md
- docs/ERROS.md

Gostaria de criar uma nova tela no sistema:
- Nome da tela: [Metas Financeiras / Relatório de Economia Anual]
- Objetivo da tela: [Permitir ao usuário definir um limite mensal de gastos para categorias de despesa e acompanhar o percentual atingido]
- Rota sugerida: [/goals]

Por favor:
1. Explique como essa tela se integra à arquitetura atual (React SPA + Express REST).
2. Se precisar de novas tabelas ou rotas na API, descreva a estrutura antes de programar.
3. Siga com rigor o design system Executive Precision (cores, tipografia Plus Jakarta Sans/Inter e numerais tabulares).
4. Explique o plano passo a passo antes de alterar arquivos.
```

---

### Modelo 3: Corrigir um Erro (Bug)
Use este modelo quando algo não estiver funcionando como esperado.

```text
Responda em português do Brasil.

Antes de qualquer ação, leia integralmente:
- docs/MANUTENCAO.md
- docs/FSD.md
- docs/STATUS.md
- docs/ERROS.md

Encontrei um erro no sistema:
- Onde aconteceu: [Na tela de Extrato / No cálculo de Saldo Previsto]
- O que eu fiz: [Cadastrei uma despesa com status PENDENTE para o dia 20 do mês]
- O que aconteceu: [O saldo previsto não atualizou o valor da nova despesa]
- O que era esperado: [O saldo previsto deveria subtrair a despesa pendente do saldo atual]

Por favor:
1. Investigue a causa-raiz no código (camada Service ou Frontend).
2. Verifique o arquivo `backend/logs/error.log` se houver registros de exceção.
3. Explique a causa e a solução antes de alterar o código.
4. Ao resolver, registre o incidente em `docs/ERROS.md` e atualize `docs/STATUS.md`.
```

---

### Modelo 4: Alterar uma Regra de Negócio
Use este modelo quando as regras financeiras ou de cálculo precisarem mudar.

```text
Responda em português do Brasil.

Antes de qualquer ação, leia integralmente:
- docs/MANUTENCAO.md
- docs/FSD.md (especialmente a Seção 6 de Regras de Negócio)
- docs/STATUS.md
- docs/ERROS.md

Preciso alterar uma regra de negócio do sistema:
- Regra atual: [RN05 define que quando o status é PENDENTE a data de pagamento deve ser nula]
- Nova regra desejada: [Permitir registrar uma data de pagamento agendada como data prevista de liquidação sem alterar o status para PAGO]

Por favor:
1. Avalie o impacto dessa mudança em outras regras (como RN02 e RN03 sobre cálculo de saldos).
2. Explique em quais arquivos (Service, Controller, Frontend) a alteração precisa ocorrer.
3. Mostre o plano antes de codificar.
4. Atualize o `docs/FSD.md` e o `docs/STATUS.md` após a conclusão.
```

---

### Modelo 5: Ajustar Visual ou Interface
Use este modelo para melhorar o acabamento visual de uma página ou componente.

```text
Responda em português do Brasil.

Antes de qualquer ação, leia integralmente:
- docs/MANUTENCAO.md
- docs/DESIGN.md
- docs/STATUS.md

Preciso fazer um ajuste visual na tela:
- Tela/Componente: [Cards de KPI do Dashboard / Tabela de Extrato]
- Ajuste necessário: [Os números dos saldos precisam ter mais contraste e utilizar rigorosamente a classe tabular-nums e fonte Plus Jakarta Sans; o espaçamento entre cards deve ser ajustado para telas menores]

Por favor:
1. Use estritamente as classes Tailwind e os tokens de cores definidos no `docs/DESIGN.md` (Primary #4F46E5, Emerald #10B981, Rose #F43F5E).
2. Não introduza estilos embutidos (`style="..."`) nem bibliotecas CSS externas.
3. Mostre o que vai mudar antes de editar.
```

---

### Modelo 6: Criar um Novo Relatório ou Filtro
Use este modelo para criar filtros avançados ou novas opções de exportação.

```text
Responda em português do Brasil.

Antes de qualquer ação, leia integralmente:
- docs/MANUTENCAO.md
- docs/FSD.md
- docs/STATUS.md

Gostaria de adicionar um novo filtro na tela de Extrato:
- Filtro desejado: [Filtrar lançamentos por Forma de Pagamento (ex: Pix, Cartão de Crédito, Boleto)]
- Comportamento: [Ao selecionar uma forma de pagamento no dropdown, a tabela de lançamentos deve recarregar apenas os itens correspondentes e o botão "Exportar em CSV" deve respeitar o filtro ativo]

Por favor:
1. Verifique se o backend já suporta o parâmetro `payment_method_id` na rota `GET /api/transactions` e na exportação CSV.
2. Explique as mudanças necessárias no backend e no frontend.
3. Apresente o plano detalhado antes de programar.
```

---

### Modelo 7: Revisão de Segurança Após Mudanças
Use este modelo após implementar qualquer nova funcionalidade para garantir que não surgiram brechas.

```text
Responda em português do Brasil.

Antes de qualquer ação, leia integralmente:
- docs/MANUTENCAO.md
- docs/FSD.md (Seção 7 e Seção 9)
- docs/STATUS.md
- docs/ERROS.md

Acabamos de fazer alterações no sistema. Execute uma revisão de segurança focada nos seguintes pontos:
1. Todos os endpoints novos ou alterados exigem autenticação JWT Bearer?
2. Todas as consultas ao banco de dados garantem o isolamento estrito por `user_id` (RN01)?
3. As entradas do usuário foram sanitizadas e os parâmetros de rota utilizam validação de UUID (`validateUuidParam`)?
4. Alguma senha, segredo ou token confidencial está sendo retornado na resposta da API ou gravado em logs?
5. Apresente um relatório com eventuais vulnerabilidades e sugira as correções necessárias.
```

---

### Modelo 8: Preparar Alterações para Versionamento (Commit)
Use este modelo quando a tarefa estiver concluída e você quiser salvar com segurança no Git.

```text
Responda em português do Brasil.

Finalizamos a tarefa com sucesso. Agora vamos preparar o versionamento no Git:
1. Verifique o status dos arquivos (`git status`).
2. Confirme que nenhum arquivo sensível (como `.env`, logs ou arquivos temporários) está na lista de staged.
3. Atualize o `docs/STATUS.md` com o que foi entregue.
4. Sugira uma mensagem de commit semântica e clara no padrão adotado pelo projeto.
5. Forneça os comandos prontos para eu executar o commit e o push no terminal.
```
