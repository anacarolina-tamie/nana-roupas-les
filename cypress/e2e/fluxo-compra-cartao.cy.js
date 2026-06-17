describe('Fluxo de compra com cartão', () => {
  beforeEach(() => {
    cy.login()
  })

  it('Adicionar dois produtos ao carrinho e finalizar pagamento', () => {

    // ── PRODUTO 1: Calça Pantalona ──
    // ── PRODUTO 1: Calça Pantalona ──
    cy.intercept('POST', '/carrinho/itens').as('addCarrinho1')
    cy.visit('/tela-inicial')
    cy.contains('Calça Pantalona').parents('.card-roupa').contains('Ver detalhes').click()
    cy.url().should('include', '/produtos/')
    cy.get('#grupo-tamanhos').contains('G').click()
    cy.get('#grupo-cores').contains('Marrom').click()
    cy.contains('Adicionar ao carrinho').click()
    cy.wait('@addCarrinho1').its('response.statusCode').should('eq', 201)

    // ── PRODUTO 2: Regata com acabamento em tela vintage ──
    cy.intercept('POST', '/carrinho/itens').as('addCarrinho2')
    cy.visit('/tela-inicial')
    cy.contains('Regata com acabamento em tela vintage').parents('.card-roupa').contains('Ver detalhes').click()
    cy.url().should('include', '/produtos/')
    cy.get('#grupo-tamanhos').contains('P').click()
    cy.get('#grupo-cores').contains('Verde').click()
    cy.contains('Adicionar ao carrinho').click()
    cy.wait('@addCarrinho2').its('response.statusCode').should('eq', 201)


    // ── CARRINHO: incrementar Regata para quantidade 2 ──
    cy.intercept('PUT', '/carrinho/itens/*').as('atualizarQtd')
    cy.visit('/carrinho')




    cy.contains('Regata com acabamento em tela vintage')
      .parents('.card-roupa')
      .find('.botao-quantidade')
      .last()
      .click()
    cy.wait('@atualizarQtd').its('response.statusCode').should('eq', 200)

    // Valida quantidades


    cy.contains('Calça Pantalona')
      .parents('.card-roupa')
      .find('.valor-quantidade')
      .invoke('text')
      .invoke('trim')
      .should('eq', '1')

    cy.contains('Regata com acabamento em tela vintage')
      .parents('.card-roupa')
      .find('.valor-quantidade')
      .invoke('text')
      .invoke('trim')
      .should('eq', '2')

    // Valida subtotal: 104,90 + (53,00 × 2) = 210,90
    cy.contains('R$ 210,90').should('be.visible')

    // ── IR PARA PAGAMENTO ──
    // sessionStorage é setado por irParaPagamento() antes do redirect
    cy.intercept('GET', '/finalizar-pedido').as('paginaFinalizar')
    cy.contains('Ir para o pagamento').should('be.visible').click()
    cy.wait('@paginaFinalizar')
    cy.url().should('include', '/finalizar-pedido')




    // Aguarda endereços e cartões carregarem (skeletons saírem)
    cy.get('#addressList .address-item').should('have.length.at.least', 1)
    cy.get('#cardList .card-item').should('have.length.at.least', 1)

    // ── ENDEREÇO E CARTÃO ──
    cy.get('#addressList').contains('das Flores').click()
    cy.get('#cardList').contains('1111').click()

    // ── RESUMO DO PAGAMENTO ──
    // subtotal vem do sessionStorage setado pelo carrinho
    cy.get('#sumSubtotal').should('have.text', 'R$ 210,90')
    cy.get('#sumFrete').should('have.text', 'R$ 15,50 · 2 dias úteis')
    cy.get('#sumDesconto').should('have.text', '—')
    cy.get('#sumTotal').should('have.text', 'R$ 226,40')

    // ── FINALIZAR ──
    cy.intercept('POST', '/finalizar-pedido').as('finalizarPedido')
    cy.get('#btnPay').should('not.be.disabled').click()
    cy.wait('@finalizarPedido').its('response.statusCode').should('eq', 201)

    // ── HISTÓRICO ──
cy.url().should('include', '/historico')
cy.get('#listaPedidos')
  .find('.pedido-row')
  .first()
  .click()
cy.url().should('match', /\/historico\/\d+/)

    // Valida detalhe do pedido
    cy.contains('Calça Pantalona').should('be.visible')
    cy.contains('Regata com acabamento em tela vintage').should('be.visible')
    cy.contains('R$ 226,40').should('be.visible')
  })
})