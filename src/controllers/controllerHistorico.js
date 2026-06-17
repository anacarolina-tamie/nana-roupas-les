const PedidoDAO = require('../models/pedido.dao');
const ItemPedidoDAO = require('../models/item-pedido.dao');
const SolicitacaoTrocaDAO = require('../models/SolicitacaoTroca.dao');
const CupomTrocaDAO = require('../models/CupomTroca.dao');
const pool = require('../database/connection');

/* ─────────────────────────────────────────
   HELPER — monta pedido completo com itens
   Declarada primeiro para poder ser usada
   pelos dois exports abaixo
   ───────────────────────────────────────── */
async function montarPedidoCompleto(pedido) {
  const itensDoPedido = await ItemPedidoDAO.listarPorPedido(pedido.id_pedido);
  const itens = [];

  for (const item of itensDoPedido) {
    const solicitacoes = await SolicitacaoTrocaDAO.buscarPorItemPedido(item.id_item_pedido);
    const qtdJaSolicitada = solicitacoes.reduce((acc, s) => acc + parseInt(s.qtde_item || 0), 0);
    const qtdRestante = item.qtde_item - qtdJaSolicitada;

    const solicitacoesComCupom = await Promise.all(
      solicitacoes.map(async (s) => {
        let cupom = null;
        if (s.status_troca === 'Aprovada') {
          cupom = await CupomTrocaDAO.buscarPorSolicitacao(s.id_sol_troca);
        }
        return { ...s, cupom };
      })
    );

    itens.push({
      id_item_pedido: item.id_item_pedido,
      nome_produto: item.nome_produto,
      url_imagem: item.url_imagem,
      preco: item.preco,
      qtde_item: item.qtde_item,
      qtd_restante: qtdRestante,
      qtd_solicitada: qtdJaSolicitada,
      tamanho: item.tamanho,
      nome_cor: item.nome_cor,
      tem_solicitacao: solicitacoes.length > 0,
      solicitacoes: solicitacoesComCupom,
      cupom: null,
    });
  }

  const itensComTroca = itens.filter(i => i.tem_solicitacao).length;
  const itensSemTroca = itens.filter(i => !i.tem_solicitacao || i.qtd_restante > 0).length;

  let status_troca_pedido = null;
  if (itensComTroca > 0 && itensSemTroca === 0) {
    status_troca_pedido = 'Solicitação de troca total';
  } else if (itensComTroca > 0) {
    status_troca_pedido = 'Solicitação de troca parcial';
  }

  return {
    id_pedido: pedido.id_pedido,
    status_pedido: pedido.status_pedido,
    status_troca_pedido,
    valor_total: pedido.valor_total,
    valor_produtos_calculado: pedido.valor_produtos_calculado,  // ← adicione esta linha
    frete: pedido.frete,
    desconto: pedido.desconto,
    criado_em: pedido.criado_em,
    itens,
    url_imagem_capa: itens[0]?.url_imagem || null,
  };
}

/* ─────────────────────────────────────────
   GET /historico
   Lista todos os pedidos do cliente
   ───────────────────────────────────────── */
exports.listarHistorico = async (req, res) => {
  try {
    const clienteId = req.session.usuario.id;
    const pedidos = await PedidoDAO.listarPorCliente(clienteId);

    if (!pedidos.length) {
      return res.render('historico', { pedidos: [], paginaAtiva: 'historico' });
    }

    const pedidosCompletos = [];
    for (const pedido of pedidos) {
      pedidosCompletos.push(await montarPedidoCompleto(pedido));
    }

    res.render('historico', { pedidos: pedidosCompletos, paginaAtiva: 'historico' });

  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    res.status(500).send('Erro ao carregar histórico.');
  }
};

/* ─────────────────────────────────────────
   GET /historico/:id_pedido
   Detalhe de um pedido específico
   ───────────────────────────────────────── */
exports.detalharPedido = async (req, res) => {
  try {
    const clienteId = req.session.usuario.id;
    const idPedido = parseInt(req.params.id_pedido);

    if (isNaN(idPedido)) return res.redirect('/historico');

    const pedido = await PedidoDAO.buscarPorId(idPedido);

    // Segurança: pedido deve existir e pertencer ao cliente logado
    if (!pedido || pedido.id_cliente !== clienteId) {
      return res.redirect('/historico');
    }

    const pedidoCompleto = await montarPedidoCompleto(pedido);

    res.render('detalhes-pedido', { pedido: pedidoCompleto, paginaAtiva: 'historico' });

  } catch (error) {
    console.error('Erro ao carregar detalhe do pedido:', error);
    res.status(500).send('Erro ao carregar detalhe do pedido.');
  }
};

/* ─────────────────────────────────────────
   POST /historico/solicitar-troca/:id_item_pedido
   ───────────────────────────────────────── */
exports.solicitarTroca = async (req, res) => {
  try {
    const { id_item_pedido } = req.params;
    const { quantidade, motivo } = req.body;
    const id_cliente = req.session?.usuario?.id;

    if (!motivo?.trim()) {
      return res.status(400).json({ mensagem: 'Informe o motivo da troca.' });
    }
    if (!quantidade || quantidade < 1) {
      return res.status(400).json({ mensagem: 'Informe uma quantidade válida.' });
    }

    // Busca o item para validar a quantidade e pegar o id_pedido
    const item = await ItemPedidoDAO.buscarPorId(id_item_pedido);
    if (!item) {
      return res.status(404).json({ mensagem: 'Item não encontrado.' });
    }

    // Segurança: item deve pertencer ao cliente logado
    const pedido = await PedidoDAO.buscarPorId(item.id_pedido);
    if (!pedido || pedido.id_cliente !== id_cliente) {
      return res.status(403).json({ mensagem: 'Acesso negado.' });
    }

    // Soma quantidade já solicitada para este item
    const qtdJaSolicitada = await SolicitacaoTrocaDAO.somarQuantidadePorItem(id_item_pedido);
    const qtdDisponivel = item.qtde_item - qtdJaSolicitada;

    if (quantidade > qtdDisponivel) {
      return res.status(400).json({
        mensagem: `Quantidade inválida. Você ainda pode solicitar troca de ${qtdDisponivel} unidade(s).`
      });
    }

    await SolicitacaoTrocaDAO.criar(id_item_pedido, item.id_pedido, quantidade, motivo.trim());
    return res.status(201).json({ mensagem: 'Solicitação de troca enviada com sucesso!' });

  } catch (error) {
    console.error('Erro ao solicitar troca:', error);
    return res.status(500).json({ mensagem: 'Erro ao solicitar troca. Tente novamente.' });
  }
};

exports.solicitarTrocaTotal = async (req, res) => {
  const id_cliente = req.session?.usuario?.id;
  const { id_pedido, itens } = req.body;

  if (!id_cliente) {
    return res.status(401).json({ mensagem: 'Não autenticado.' });
  }
  if (!id_pedido || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ mensagem: 'Dados inválidos.' });
  }
  if (itens.some(i => !i.motivo?.trim())) {
    return res.status(400).json({ mensagem: 'Informe o motivo para todos os itens.' });
  }

  try {
    const pedido = await PedidoDAO.buscarPorId(id_pedido);
    if (!pedido || pedido.id_cliente !== id_cliente) {
      return res.status(403).json({ mensagem: 'Acesso negado.' });
    }

    const solicitacoes = await SolicitacaoTrocaDAO.criarTrocaTotal(id_pedido, itens);
    return res.status(201).json({ mensagem: 'Troca solicitada com sucesso.', solicitacoes });
  } catch (err) {
    console.error('Erro ao solicitar troca total:', err);
    return res.status(500).json({ mensagem: 'Erro interno.' });
  }
};