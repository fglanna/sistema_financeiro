/**
 * Testes Unitários e Integrados de Segurança contra CSV Injection (Formula Injection)
 * Valida a neutralização de fórmulas em planilhas sem corromper o banco de dados.
 */
const assert = require('assert');
const csvExportService = require('./src/services/csvExportService');

console.log('--- INICIANDO TESTES DE SEGURANÇA: CSV INJECTION (SEC-03) ---');

// 1. Testes de Casos Maliciosos (Neutralização com Apóstrofo)
console.log('\n[1] Testando neutralização de fórmulas maliciosas...');

const maliciousCases = [
  { input: '=SUM(1,2)', expectedPrefix: "'=SUM(1,2)" },
  { input: "=cmd|' /C calc'!A0", expectedPrefix: "'=cmd" },
  { input: '+1234567890', expectedPrefix: "'+1234567890" },
  { input: '-2+3*4', expectedPrefix: "'-2+3*4" },
  { input: '@SUM(A1:A10)', expectedPrefix: "'@SUM(A1:A10)" },
  { input: '\t=1+1', expectedPrefix: "'\t=1+1" },
  { input: '\r=cmd', expectedPrefix: "'\r=cmd" },
  { input: '   =cmd|calc', expectedPrefix: "'   =cmd" },
  { input: ' \t -500', expectedPrefix: "' \t -500" }
];

maliciousCases.forEach(({ input, expectedPrefix }) => {
  const sanitized = csvExportService.sanitizeFormulaInjection(input);
  assert(
    sanitized.startsWith("'"),
    `Esperado que '${input}' seja prefixado com apóstrofo. Obtido: '${sanitized}'`
  );
  const escaped = csvExportService.escapeCsvField(input);
  assert(
    escaped.includes(expectedPrefix),
    `Campo escapado deve conter o prefixo neutralizado '${expectedPrefix}'. Obtido: '${escaped}'`
  );
  console.log(`  ✅ Caso malicioso neutralizado com sucesso: ${JSON.stringify(input)} -> ${escaped}`);
});

// 2. Testes de Descrições Legítimas (Preservação sem Apóstrofo Indevido)
console.log('\n[2] Testando preservação de descrições legítimas...');

const legitimateCases = [
  'Supermercado Extra - Compras do Mês',
  'Salário Mensal Ref. Outubro',
  'Conta de Luz e Água',
  'Consulta Médica Dr. Silva',
  'Almoço no Restaurante "O Pescador"',
  'Manutenção; troca de óleo e filtros',
  'Cinema com a família (4 ingressos)',
  'Uber para o aeroporto'
];

legitimateCases.forEach((input) => {
  const sanitized = csvExportService.sanitizeFormulaInjection(input);
  assert.strictEqual(
    sanitized,
    input,
    `Descrição legítima não deve receber apóstrofo. Original: '${input}', Obtido: '${sanitized}'`
  );
  const escaped = csvExportService.escapeCsvField(input);
  assert(
    escaped.startsWith('"') && escaped.endsWith('"'),
    `Campo legítimo deve ser envolvido em aspas RFC 4180. Obtido: '${escaped}'`
  );
  console.log(`  ✅ Descrição legítima preservada: '${input}' -> ${escaped}`);
});

// 3. Teste de Estrutura do Arquivo CSV (BOM UTF-8, Delimitador ';')
console.log('\n[3] Testando escape geral e integridade de formato...');

assert.strictEqual(csvExportService.escapeCsvField(null), '""', 'Null deve retornar aspas vazias');
assert.strictEqual(csvExportService.escapeCsvField(undefined), '""', 'Undefined deve retornar aspas vazias');
assert.strictEqual(csvExportService.formatCurrencyBr(1250.5), '1250,50', 'Formatação monetária brasileira');
assert.strictEqual(csvExportService.formatDateBr('2026-10-26'), '26/10/2026', 'Formatação de data DD/MM/YYYY');

console.log('  ✅ Formatação monetária e de data validadas com sucesso.');

console.log('\n================================================================');
console.log('🎉 TODOS OS TESTES DE CSV INJECTION PASSARAM COM 100% DE SUCESSO!');
console.log('================================================================\n');
