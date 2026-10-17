const transactionRepository = require('../repositories/transactionRepository');

class CsvExportService {
  /**
   * Escapa campos no formato CSV RFC 4180
   * @param {string|number|null} value
   */
  escapeCsvField(value) {
    if (value === null || value === undefined) {
      return '""';
    }
    const stringValue = String(value);
    // Se contiver vírgula, ponto e vírgula, aspas ou quebras de linha, envolve em aspas e duplica aspas internas
    if (stringValue.includes('"') || stringValue.includes(';') || stringValue.includes('\n') || stringValue.includes('\r')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
  }

  /**
   * Formata valores numéricos para padrão monetário brasileiro (ex: "1250,50")
   * @param {number|string} amount
   */
  formatCurrencyBr(amount) {
    const num = parseFloat(amount || 0);
    return num.toFixed(2).replace('.', ',');
  }

  /**
   * Formata data para formato brasileiro DD/MM/YYYY
   * @param {Date|string|null} dateVal
   */
  formatDateBr(dateVal) {
    if (!dateVal) return '';
    const dateStr = dateVal instanceof Date ? dateVal.toISOString().split('T')[0] : String(dateVal).split('T')[0];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  /**
   * Gera o conteúdo CSV completo em memória com base nos filtros aplicados (RN09)
   *
   * @param {string} userId
   * @param {Object} filters - { month, year, search, category_id }
   * @returns {Promise<{ filename: string, csvContent: string }>}
   */
  async generateTransactionsCsv(userId, filters = {}) {
    const transactions = await transactionRepository.findAll(userId, filters);

    // Cabeçalhos das colunas em português conforme especificação
    const headers = [
      'Data de Vencimento',
      'Descrição',
      'Tipo',
      'Categoria',
      'Forma de Pagamento',
      'Valor (R$)',
      'Status',
      'Data de Pagamento'
    ];

    const rows = [headers.map((h) => this.escapeCsvField(h)).join(';')];

    transactions.forEach((tx) => {
      const row = [
        this.escapeCsvField(this.formatDateBr(tx.due_date)),
        this.escapeCsvField(tx.description),
        this.escapeCsvField(tx.type),
        this.escapeCsvField(tx.category_name),
        this.escapeCsvField(tx.payment_method_name),
        this.escapeCsvField(this.formatCurrencyBr(tx.amount)),
        this.escapeCsvField(tx.status),
        this.escapeCsvField(this.formatDateBr(tx.payment_date))
      ];
      rows.push(row.join(';'));
    });

    // Adiciona BOM UTF-8 (\uFEFF) para garantir abertura correta no Excel e caracteres acentuados
    const csvContent = '\uFEFF' + rows.join('\r\n');

    // Nome do arquivo: extrato_YYYY_MM.csv ou extrato_geral.csv
    let filename = 'extrato.csv';
    if (filters.year && filters.month) {
      const paddedMonth = String(filters.month).padStart(2, '0');
      filename = `extrato_${filters.year}_${paddedMonth}.csv`;
    } else if (filters.year) {
      filename = `extrato_${filters.year}.csv`;
    }

    return {
      filename,
      csvContent
    };
  }
}

module.exports = new CsvExportService();
