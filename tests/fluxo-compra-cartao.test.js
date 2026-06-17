const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/database/connection');

jest.setTimeout(15000);

describe('Fluxo de Compra de Ponta a Ponta', () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);

    // Login — verifica se realmente autenticou
    const resLogin = await agent
      .post('/login')
      .send({ email: 'Gordon.Mraz@gmail.com', senha: 'Senha@123' });

    // O seu controller redireciona para /tela-inicial quando login OK
    // Se não redirecionar, o teste vai falhar aqui com mensagem clara
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

  // ─────────────────────────────────────────────
  //  TESTE 1 — Fluxo completo (sem cupom)
  // ─────────────────────────────────────────────
  it('deve adicionar dois itens, ajustar quantidade e finalizar pedido', async () => {

    // Garante carrinho limpo antes de começar
    await agent.delete('/carrinho');

    // 1. Adicionar Regata P (id_variacao: 1, R$ 53,00)
    const resAdd1 = await agent
      .post('/carrinho/itens')
      .send({ id_variacao: 1, quantidade: 2 });

    expect(resAdd1.status).toBe(201);
    expect(resAdd1.body).toHaveProperty('item');

    // 2. Adicionar Calça G (id_variacao: 12, R$ 104,90)
    const resAdd2 = await agent
      .post('/carrinho/itens')
      .send({ id_variacao: 12, quantidade: 1 });

    expect(resAdd2.status).toBe(201);
    const idItemCalca = resAdd2.body.item.id_item;

    // 4. Atualizar quantidade da Calça para 2 via PUT
    const resUpdate = await agent
      .put(`/carrinho/itens/${idItemCalca}`)
      .send({ quantidade: 2 });

    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body).toHaveProperty('item');

    // 5. Verificar estado do carrinho antes de finalizar
    const resCarrinho = await agent.get('/carrinho');
    expect(resCarrinho.status).toBe(200);
    expect(resCarrinho.body.itens.length).toBeGreaterThanOrEqual(2);

    // subtotal esperado: (53 * 2) + (104,90 * 2) = 315,80
    const totalEsperado = (53 * 2) + (104.90 * 2);
    expect(parseFloat(resCarrinho.body.total)).toBeCloseTo(totalEsperado, 1);

    // 6. Finalizar pedido (sem cupom)
    const resFinalizar = await agent
      .post('/finalizar-pedido')
      .send({
        id_endereco: 198,
        id_cartao: 72,
        origem:      'carrinho',
      });

    expect(resFinalizar.status).toBe(201);
    expect(resFinalizar.body).toHaveProperty('pedidoId');

    // 7. Verificar se aparece no histórico
    const resPedidoId = resFinalizar.body.pedidoId;

    const resHistorico = await agent.get(`/historico/${resPedidoId}`);
    // Pode redirecionar para a view (302) ou retornar JSON (200)
    expect([200, 302]).toContain(resHistorico.status);
  });

});