const pool = require('../database/connection');
const EnderecoDAO = require('../models/endereco.dao');
const CartaoDAO = require('../models/cartao.dao');
const CarrinhoDAO = require('../models/carrinho.dao');
const PedidoDAO = require('../models/pedido.dao');
const ItemPedidoDAO = require('../models/item-pedido.dao');
const TransacaoDAO = require('../models/transacao.dao');
const VariacaoDAO = require('../models/variacao-produto.dao');
const CupomPromocionalDAO = require('../models/CupomPromocional.dao');
const CupomTrocaDAO = require('../models/CupomTroca.dao');
const CupomDAO = require('../models/Cupom.dao');
const crypto = require('crypto');

function gerarCodigoCupomTroco() {
  return 'TROCO-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

exports.finalizarPedido = async (req, res) => {
  try {
    const clienteId = req.session.usuario.id;
    const enderecos = await EnderecoDAO.buscarPorCliente(clienteId);
    const cartoes = await CartaoDAO.listarPorCliente(clienteId);
    res.render('finalizar-pedido', { enderecos, cartoes, clienteId });
  } catch (error) {
    console.error('Erro ao carregar tela de pagamento:', error);
    res.status(500).send('Erro ao carregar tela de pagamento.');
  }
};

exports.validarCupomRoute = async (req, res) => {
  try {
    const clienteId = req.session.usuario.id;
    const { codigo } = req.body;

    if (!codigo || !codigo.trim()) {
      return res.status(400).json({ valido: false, mensagem: 'Informe o código do cupom.' });
    }

    const codigoNormalizado = codigo.trim().toUpperCase();

    // 1. Cupom promocional
    const cupomProm = await CupomPromocionalDAO.buscarPorCodigo(codigoNormalizado);
    if (cupomProm) {
      return res.json({
        valido: true,
        tipo: 'promocional',
        id: cupomProm.id_cupom_prom,
        codigo: cupomProm.cod_cupom_prom,
        valor: parseFloat(cupomProm.valor_cupom_prom),
        nome: cupomProm.nome_cupom_prom || codigoNormalizado,
      });
    }

    // 2. Cupom de troca (tabela: cupom_troca)
    const cupomTroca = await CupomTrocaDAO.buscarPorCodigo(codigoNormalizado);
    if (cupomTroca) {
      if (cupomTroca.usado)
        return res.status(400).json({ valido: false, mensagem: 'Este cupom já foi utilizado.' });
      if (cupomTroca.cliente_id !== clienteId)
        return res.status(403).json({ valido: false, mensagem: 'Este cupom não pertence à sua conta.' });
      if (cupomTroca.data_validade && new Date(cupomTroca.data_validade) < new Date())
        return res.status(400).json({ valido: false, mensagem: 'Este cupom está expirado.' });
      return res.json({
        valido: true,
        tipo: 'troca',
        id: cupomTroca.id_cupom,
        codigo: cupomTroca.codigo,
        valor: parseFloat(cupomTroca.valor),
        nome: 'Cupom de troca',
      });
    }

    // 3. Cupom (tabela: cupom)
    const cupom = await CupomDAO.buscarPorCodigo(codigoNormalizado);
    if (cupom) {
      if (cupom.usado)
        return res.status(400).json({ valido: false, mensagem: 'Este cupom já foi utilizado.' });
      if (cupom.cliente_id !== clienteId)
        return res.status(403).json({ valido: false, mensagem: 'Este cupom não pertence à sua conta.' });
      if (cupom.data_validade && new Date(cupom.data_validade) < new Date())
        return res.status(400).json({ valido: false, mensagem: 'Este cupom está expirado.' });
      return res.json({
        valido: true,
        tipo: 'troco',
        id: cupom.id_cupom,
        codigo: cupom.codigo,
        valor: parseFloat(cupom.valor),
        nome: 'Cupom',
      });
    }

    return res.status(404).json({ valido: false, mensagem: 'Cupom não encontrado ou inválido.' });

  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return res.status(500).json({ valido: false, mensagem: 'Erro ao validar cupom. Tente novamente.' });
  }
};

exports.processarPedido = async (req, res) => {
  const client = await pool.connect();

  try {
    const clienteId = req.session.usuario.id;
    const {
      id_endereco,
      frete: freteRecebido,
      id_cartao,
      id_cartao_2,
      valor_cartao_1,
      valor_cartao_2,
      origem,
      produtosDireto,
      cupom,
    } = req.body;

    // ── Validações básicas ──────────────────────────────────────
    if (!id_endereco)
      return res.status(400).json({ mensagem: 'Endereço de entrega obrigatório.' });
    if (!id_cartao)
      return res.status(400).json({ mensagem: 'Cartão de pagamento obrigatório.' });

    // Validação de 2 cartões
    const doisCartoes = !!id_cartao_2;
    if (doisCartoes) {
      const v1 = parseFloat(valor_cartao_1);
      const v2 = parseFloat(valor_cartao_2);
      if (isNaN(v1) || isNaN(v2) || v1 <= 0 || v2 <= 0) {
        return res.status(400).json({ mensagem: 'Valores inválidos para os dois cartões.' });
      }
      if (String(id_cartao) === String(id_cartao_2)) {
        return res.status(400).json({ mensagem: 'Os dois cartões devem ser diferentes.' });
      }
    }

    await client.query('BEGIN');

    // ── 1. Buscar itens ──────────────────────────────────────────
    let itensBrutos = [];

    if (origem === 'direto' && produtosDireto) {
      itensBrutos = [{
        id_variacao: produtosDireto.id_variacao,
        quantidade: produtosDireto.quantidade,
        preco_unitario: produtosDireto.preco_unitario,
      }];
    } else {
      const carrinho = await CarrinhoDAO.buscarOuCriar(clienteId);
      itensBrutos = await CarrinhoDAO.listarItens(carrinho.id_carrinho);
      if (!itensBrutos.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ mensagem: 'Seu carrinho está vazio.' });
      }
    }

    // ── 2. Calcular valores ──────────────────────────────────────
    const frete = parseFloat(freteRecebido) || 20; // fallback 20 se vier undefined
    const subtotal = itensBrutos.reduce(
      (acc, item) => acc + parseFloat(item.preco_unitario) * item.quantidade, 0
    );
    const totalBruto = subtotal + frete;

    // ── 3. Validar e aplicar cupom ───────────────────────────────
    let desconto = 0;
    let cupomTrocoGerado = null;
    let id_cupom_usado = null;

    if (cupom && cupom.id && cupom.valor > 0) {
      const valorCupom = parseFloat(cupom.valor);

      if (cupom.tipo === 'promocional') {
        const cupomBanco = await CupomPromocionalDAO.buscarPorCodigo(cupom.codigo.toUpperCase());
        if (!cupomBanco) {
          await client.query('ROLLBACK');
          return res.status(400).json({ mensagem: 'Cupom inválido ou expirado.' });
        }
        desconto = Math.min(valorCupom, totalBruto);
      }

      if (cupom.tipo === 'troca' || cupom.tipo === 'troco') {
        let cupomBanco = null;

        if (cupom.tipo === 'troco') {
          cupomBanco = await CupomDAO.buscarPorCodigo(cupom.codigo.toUpperCase());
        } else {
          cupomBanco = await CupomTrocaDAO.buscarPorCodigo(cupom.codigo.toUpperCase());
        }

        console.log('cupomBanco:', cupomBanco); // ← adiciona isso
        console.log('id_cupom_usado será:', cupomBanco?.id_cupom); // ← e isso

        if (!cupomBanco || cupomBanco.usado) {
          await client.query('ROLLBACK');
          return res.status(400).json({ mensagem: 'Cupom inválido ou já utilizado.' });
        }
        if (cupomBanco.cliente_id !== clienteId) {
          await client.query('ROLLBACK');
          return res.status(403).json({ mensagem: 'Este cupom não pertence à sua conta.' });
        }
        if (cupomBanco.data_validade && new Date(cupomBanco.data_validade) < new Date()) {
          await client.query('ROLLBACK');
          return res.status(400).json({ mensagem: 'Este cupom está expirado.' });
        }

        desconto = Math.min(valorCupom, totalBruto);
        id_cupom_usado = cupomBanco.id_cupom;
        id_cupom_origem_troca = cupom.tipo === 'troca'; // true = cupons_troca, false = cupom
      }
      // Troco: cupom > total
      if (valorCupom > totalBruto) {
        const valorTroco = parseFloat((valorCupom - totalBruto).toFixed(2));
        const codigoTroco = gerarCodigoCupomTroco();
        cupomTrocoGerado = await CupomDAO.criar({
          cliente_id: clienteId,
          pedido_id: null,
          codigo: codigoTroco,
          valor: valorTroco,
          data_validade: null,
        }, client);
      }
    }

    // ── 4. Validar valores dos cartões contra o total real ───────
    const totalReal = parseFloat((totalBruto - desconto).toFixed(2));

    if (doisCartoes) {
      const v1 = parseFloat(parseFloat(valor_cartao_1).toFixed(2));
      const v2 = parseFloat(parseFloat(valor_cartao_2).toFixed(2));
      const soma = parseFloat((v1 + v2).toFixed(2));

      if (Math.abs(soma - totalReal) > 0.01) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensagem: `A soma dos cartões (${soma}) não bate com o total do pedido (${totalReal}).`,
        });
      }

      // RN0034 + RN0035: mínimo de R$10 por cartão, EXCETO quando há cupom aplicado
      const temCupom = cupom && cupom.id && cupom.valor > 0;
      if (!temCupom) {
        if (v1 < 10 || v2 < 10) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            mensagem: 'O valor mínimo por cartão é R$ 10,00 (RN0034).',
          });
        }
      }
      // Com cupom (RN0035): sem mínimo por cartão, mas cada valor ainda deve ser > 0
      else {
        if (v1 <= 0 || v2 <= 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            mensagem: 'O valor em cada cartão deve ser maior que zero.',
          });
        }
      }
    }

    // ── 5. Criar o pedido ────────────────────────────────────────
    const pedido = await PedidoDAO.criar({
      status_pedido: 'Em processamento',
      frete,
      desconto,
      valor_produtos: subtotal,
      valor_total: totalBruto,
      id_cliente: clienteId,
      id_endereco,
    }, client);

    // ── 6. Criar itens do pedido + atualizar estoque ─────────────
    for (const item of itensBrutos) {
      await ItemPedidoDAO.criar({
        qtde_item: item.quantidade,
        id_variacao: item.id_variacao,
        id_pedido: pedido.id_pedido,
      }, client);
      await VariacaoDAO.atualizarEstoque(item.id_variacao, -item.quantidade, client);
    }

    // ── 7. Criar a transação (1 ou 2 cartões) ───────────────────
    await TransacaoDAO.criar({
      status_transacao: 'Em processamento',
      id_pedido: pedido.id_pedido,
      id_cartao_1: id_cartao,
      id_cartao_2: doisCartoes ? id_cartao_2 : null,
      valor_cartao_1: doisCartoes ? parseFloat(valor_cartao_1) : null,
      valor_cartao_2: doisCartoes ? parseFloat(valor_cartao_2) : null,
      id_cupom_troca: id_cupom_usado,
    }, client);

    // ── 8. Marcar cupom como usado ───────────────────────────────
    if (id_cupom_usado) {
      if (cupom.tipo === 'troca') {
        await CupomTrocaDAO.marcarComoUsado(id_cupom_usado, client);
      } else {
        await CupomDAO.marcarComoUsado(id_cupom_usado, client);
      }
    }

    // ── 9. Limpar carrinho ───────────────────────────────────────
    if (origem !== 'direto') {
      const carrinho = await CarrinhoDAO.buscarOuCriar(clienteId);
      await CarrinhoDAO.limpar(carrinho.id_carrinho);
    }

    await client.query('COMMIT');

    const resposta = {
      mensagem: 'Pedido realizado com sucesso!',
      pedidoId: pedido.id_pedido,
    };

    if (cupomTrocoGerado) {
      resposta.cupomTroco = {
        codigo: cupomTrocoGerado.codigo,
        valor: parseFloat(cupomTrocoGerado.valor),
      };
    }

    return res.status(201).json(resposta);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao processar pedido:', error);
    return res.status(500).json({ mensagem: 'Erro ao processar pedido. Tente novamente.' });
  } finally {
    client.release();
  }
};