const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/database/connection');

jest.setTimeout(15000);

describe('Fluxo de Compra com Dois Cartões', () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);

    // Login
    const resLogin = await agent
      .post('/login')
      .send({ email: 'Gordon.Mraz@gmail.com', senha: 'Senha@123' });

    if (resLogin.status !== 200 && resLogin.status !== 302) {
      throw new Error(
        `Login falhou (status ${resLogin.status}): ` +
        JSON.stringify(resLogin.body)
      );
    }
  });

  afterAll(async () => {
    // Limpa o carrinho para não sujar outros testes
    await agent.delete('/carrinho').catch(() => {});
    await pool.end();
  });

  it('deve adicionar dois itens, ajustar quantidade e finalizar pedido com dois cartões', async () => {

    // Garante carrinho limpo antes de começar
    await agent.delete('/carrinho');

    //add Regata P (id_variacao: 1, R$ 53,00) — quantidade 2
    const resAdd1 = await agent
      .post('/carrinho/itens')
      .send({ id_variacao: 1, quantidade: 2 });

    expect(resAdd1.status).toBe(201);
    expect(resAdd1.body).toHaveProperty('item');

    //adicionar Calça G (id_variacao: 12, R$ 104,90) — quantidade 1
    const resAdd2 = await agent
      .post('/carrinho/itens')
      .send({ id_variacao: 12, quantidade: 1 });

    expect(resAdd2.status).toBe(201);
    const idItemCalca = resAdd2.body.item.id_item;

    //Atualizar quantidade da Calça para 2
    const resUpdate = await agent
      .put(`/carrinho/itens/${idItemCalca}`)
      .send({ quantidade: 2 });

    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body).toHaveProperty('item');

    //Verificar estado do carrinho antes de finalizar
    const resCarrinho = await agent.get('/carrinho');
    expect(resCarrinho.status).toBe(200);
    expect(resCarrinho.body.itens.length).toBeGreaterThanOrEqual(2);

    // subtotal: (53 * 2) + (104,90 * 2) = 315,80
    // total com frete: 315,80 + 20,00 = 335,80
    const subtotalEsperado = (53 * 2) + (104.90 * 2);
    const totalEsperado    = subtotalEsperado + 20;

    expect(parseFloat(resCarrinho.body.total)).toBeCloseTo(subtotalEsperado, 1);

    //Definir valores de cada cartão (soma deve bater com o total)
    // Cartão 1: R$ 150,00 | Cartão 2: R$ 185,80
    const valorCartao1 = 150.00;
    const valorCartao2 = parseFloat((totalEsperado - valorCartao1).toFixed(2));

    expect(valorCartao1 + valorCartao2).toBeCloseTo(totalEsperado, 1);

    //Finalizar pedido com 2 cartões
    const resFinalizar = await agent
      .post('/finalizar-pedido')
      .send({
        id_endereco:   198,
        id_cartao:     72,   
        id_cartao_2:   73,   
        valor_cartao_1: valorCartao1,
        valor_cartao_2: valorCartao2,
        origem:        'carrinho',
      });

    expect(resFinalizar.status).toBe(201);
    expect(resFinalizar.body).toHaveProperty('pedidoId');

    //Verificar se aparece no histórico
    const resPedidoId = resFinalizar.body.pedidoId;

    const resHistorico = await agent.get(`/historico/${resPedidoId}`);
    expect([200, 302]).toContain(resHistorico.status);
  });

});