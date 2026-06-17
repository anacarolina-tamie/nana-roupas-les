/*exports.exibirDashboard = async (req, res) => {
    try {
        console.log('exibirDashboard chamado'); 
        res.render('dashboard', { paginaAtiva: 'dashboard' }); // <- era 'tela-dashboard'
    } catch (erro) {            
        console.error(erro);
        res.status(500).send("Erro ao carregar o dashboard");
    }
};*/
const DashboardDAO = require('../models/Dashboard.dao');

// ----------------------------------------------------------------
// Utilitário: gera array de {mes: 'YYYY-MM', label: 'Mon/YY'}
// para os últimos `n` meses (incluindo o atual)
// ----------------------------------------------------------------
function gerarLabels(n) {
  const resultado = [];
  const agora = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const label = `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    resultado.push({ mes, label });
  }
  return resultado;
}

function gerarLabelsPorData(inicio, fim) {
  const resultado = [];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const d = new Date(inicio + 'T00:00:00');
  const fimDate = new Date(fim + 'T00:00:00');

  while (d <= fimDate) {
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    resultado.push({ mes, label });
    d.setMonth(d.getMonth() + 1);
  }
  return resultado;
}

// ----------------------------------------------------------------
// GET /dashboard  →  renderiza a view EJS
// ----------------------------------------------------------------
exports.renderDashboard = async function (req, res) {
  try {
    const produtos = await DashboardDAO.listarProdutos();
    res.render('dashboard', { produtos, paginaAtiva: 'dashboard' });
  } catch (err) {
    console.error('[DashboardController] Erro ao carregar página:', err);
    res.status(500).send('Erro ao carregar dashboard.');
  }
};

// ----------------------------------------------------------------
// GET /api/dashboard/vendas
// Query params:
//   produto=<id_produto>  (opcional)
//   periodo=<3|6|12>      (opcional, default 6)
//
// Resposta JSON:
// {
//   labels:  ["Jan/25", "Fev/25", ...],
//   geral:   [42, 78, ...],
//   produto: [10, 25, ...] | null
// }
// ----------------------------------------------------------------
exports.getVendas = async function (req, res) {
  try {
    const idProduto = req.query.produto ? Number(req.query.produto) : null;
    const inicio = req.query.inicio || null;
    const fim = req.query.fim || null;
    const periodo = req.query.periodo ? Number(req.query.periodo) : 6;

    // Valida período fixo
    if (!inicio && !fim && ![3, 6, 12].includes(periodo)) {
      return res.status(400).json({ erro: 'Período inválido. Use 3, 6 ou 12.' });
    }

    const labelsCompletos = inicio && fim
      ? gerarLabelsPorData(inicio, fim)
      : gerarLabels(periodo);

    const dadosGeral = await DashboardDAO.vendasPorMes(null, periodo, inicio, fim);
    const mapGeral = Object.fromEntries(dadosGeral.map(r => [r.mes, r.total_unidades]));
    const serieGeral = labelsCompletos.map(l => mapGeral[l.mes] ?? 0);

    const dadosFaturado = await DashboardDAO.totalFaturadoPorMes(periodo, inicio, fim);
    const mapFaturado = Object.fromEntries(dadosFaturado.map(r => [r.mes, r.total_faturado]));
    const serieFaturado = labelsCompletos.map(l => mapFaturado[l.mes] ?? 0);

    let serieProduto = null;
    if (idProduto) {
      const dadosProduto = await DashboardDAO.vendasPorMes(idProduto, periodo, inicio, fim);
      const mapProduto = Object.fromEntries(dadosProduto.map(r => [r.mes, r.total_unidades]));
      serieProduto = labelsCompletos.map(l => mapProduto[l.mes] ?? 0);
    }

    return res.json({
      labels: labelsCompletos.map(l => l.label),
      geral: serieGeral,
      produto: serieProduto,
      faturado: serieFaturado,
    });
  } catch (err) {
    console.error('[DashboardController] Erro ao buscar vendas:', err);
    return res.status(500).json({ erro: 'Erro interno ao buscar dados de vendas.' });
  }
};