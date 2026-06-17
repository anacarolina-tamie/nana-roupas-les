const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/database/connection');

jest.setTimeout(15000);

describe('Fluxo de Compra de Ponta a Ponta', () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);

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
    await agent.delete('/carrinho').catch(() => {});
    await pool.end();
  });

  it('deve adicionar dois itens, ajustar quantidade e finalizar pedido com cupom', async () => {

    await agent.delete('/carrinho');

    // 1. Adicionar Regata (id_variacao: 1, quantidade: 2 → R$ 106,00)
    const resAdd1 = await agent
      .post('/carrinho/itens')
      .send({ id_variacao: 1, quantidade: 2 });

    expect(resAdd1.status).toBe(201);
    expect(resAdd1.body).toHaveProperty('item');

    // 2. Adicionar Calça G (id_variacao: 12, quantidade: 1 → R$ 104,90)
    const resAdd2 = await agent
      .post('/carrinho/itens')
      .send({ id_variacao: 12, quantidade: 1 });

    expect(resAdd2.status).toBe(201);
    const idItemCalca = resAdd2.body.item.id_item;

    // 3. Atualizar Calça para quantidade 2
    const resUpdate = await agent
      .put(`/carrinho/itens/${idItemCalca}`)
      .send({ quantidade: 2 });

    expect(resUpdate.status).toBe(200);

    // 4. Verificar carrinho
    const resCarrinho = await agent.get('/carrinho');
    expect(resCarrinho.status).toBe(200);
    expect(resCarrinho.body.itens.length).toBeGreaterThanOrEqual(2);

    // subtotal: (53 * 2) + (104,90 * 2) = 315,80
    const totalEsperado = (53 * 2) + (104.90 * 2);
    expect(parseFloat(resCarrinho.body.total)).toBeCloseTo(totalEsperado, 1);

    // 5. Validar o cupom antes de usar
    const resValidarCupom = await agent
      .post('/cupons/validar')
      .send({ codigo: 'NANA1' });

    expect(resValidarCupom.status).toBe(200);
    expect(resValidarCupom.body.valido).toBe(true);
    expect(resValidarCupom.body.valor).toBe(10);

    const cupom = resValidarCupom.body;

    // 6. Finalizar pedido com cupom
    // total esperado: 315,80 + 20,00 (frete) - 10,00 (cupom) = 325,80
    const resFinalizar = await agent
      .post('/finalizar-pedido')
      .send({
        id_endereco: 198,
        id_cartao:   72,
        origem:      'carrinho',
        cupom: {
          id:     cupom.id,
          codigo: cupom.codigo,
          valor:  cupom.valor,
          tipo:   cupom.tipo,
        },
      });

    expect(resFinalizar.status).toBe(201);
    expect(resFinalizar.body).toHaveProperty('pedidoId');

    // 7. Verificar histórico
    const resPedidoId = resFinalizar.body.pedidoId;
    const resHistorico = await agent.get(`/historico/${resPedidoId}`);
    expect([200, 302]).toContain(resHistorico.status);
  });

});