// cypress/e2e/compra-e-troca-total.cy.js

describe('Compra com cartão, aprovação pelo admin e troca total', () => {

  it('fluxo completo', () => {

    // ── 1. LOGIN CLIENTE ────────────────────────────────────────────────────
    cy.login()

    // ── 2. ADICIONA PRODUTO 1: Calça Pantalona ──────────────────────────────
    cy.intercept('POST', '/carrinho/itens').as('addCarrinho1')
    cy.visit('/tela-inicial')
    cy.contains('Calça Pantalona').parents('.card-roupa').contains('Ver detalhes').click()
    cy.url().should('include', '/produtos/')
    cy.get('#grupo-tamanhos').contains('G').click()
    cy.get('#grupo-cores').contains('Marrom').click()
    cy.contains('Adicionar ao carrinho').click()
    cy.wait('@addCarrinho1').its('response.statusCode').should('eq', 201)

    // ── 3. ADICIONA PRODUTO 2: Regata ───────────────────────────────────────
    cy.intercept('POST', '/carrinho/itens').as('addCarrinho2')
    cy.visit('/tela-inicial')
    cy.contains('Regata com acabamento em tela vintage').parents('.card-roupa').contains('Ver detalhes').click()
    cy.url().should('include', '/produtos/')
    cy.get('#grupo-tamanhos').contains('P').click()
    cy.get('#grupo-cores').contains('Verde').click()
    cy.contains('Adicionar ao carrinho').click()
    cy.wait('@addCarrinho2').its('response.statusCode').should('eq', 201)

    // ── 4. CARRINHO: incrementa Regata para quantidade 2 ───────────────────
    cy.intercept('PUT', '/carrinho/itens/*').as('atualizarQtd')
    cy.visit('/carrinho')
    cy.contains('Regata com acabamento em tela vintage')
      .parents('.card-roupa')
      .find('.botao-quantidade')
      .last()
      .click()
    cy.wait('@atualizarQtd').its('response.statusCode').should('eq', 200)

    // ── 5. FINALIZA PEDIDO ──────────────────────────────────────────────────
    cy.intercept('GET', '/finalizar-pedido').as('paginaFinalizar')
    cy.contains('Ir para o pagamento').should('be.visible').as('btnPagamento')
    cy.get('@btnPagamento').click()
    cy.wait('@paginaFinalizar')
    cy.url().should('include', '/finalizar-pedido')

    cy.get('#addressList .address-item').should('have.length.at.least', 1)
    cy.get('#cardList .card-item').should('have.length.at.least', 1)
    cy.get('#addressList').contains('das Flores').click()
    cy.get('#cardList').contains('1111').click()

    cy.intercept('POST', '/finalizar-pedido').as('finalizarPedido')
    cy.get('#btnPay').should('not.be.disabled').click()
    cy.wait('@finalizarPedido').its('response.statusCode').should('eq', 201)

    // ── 6. CAPTURA ID DO PEDIDO ─────────────────────────────────────────────
    cy.url().should('include', '/historico')
    cy.get('#listaPedidos .pedido-row').first().click()
    cy.url().should('match', /\/historico\/\d+/).then((url) => {
      const pedidoId = parseInt(url.match(/\/historico\/(\d+)/)[1])
      cy.wrap(pedidoId).as('pedidoId')
    })

    // ── 7. LOGOUT CLIENTE ───────────────────────────────────────────────────
    cy.logout()

    // ── 8. LOGIN ADMIN ──────────────────────────────────────────────────────
    cy.loginAdmin()

    // ── 9. ADMIN: navega para Pedidos e busca o pedido ──────────────────────
    cy.get('@pedidoId').then((pedidoId) => {

      cy.visit('/lista-pedidos')
      cy.get('#input-pesquisar').type(String(pedidoId))
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).should('be.visible')

      // ── 10. APROVAR ────────────────────────────────────────────────────────
      cy.intercept('POST', `/pedidos/${pedidoId}/aprovar`).as('aprovar')
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).find('.btn-aprovar').click()
      cy.get('#modalTitulo').should('be.visible')
      cy.get('#btnModalConfirmar').click()
      cy.wait('@aprovar').its('response.statusCode').should('eq', 200)
      cy.reload()

      // ── 11. DESPACHAR ──────────────────────────────────────────────────────
      cy.intercept('POST', `/pedidos/${pedidoId}/despachar`).as('despachar')
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).find('.btn-despachar').click()
      cy.get('#modalTitulo').should('be.visible')
      cy.get('#btnModalConfirmar').click()
      cy.wait('@despachar').its('response.statusCode').should('eq', 200)
      cy.reload()

      // ── 12. CONFIRMAR ENTREGA ──────────────────────────────────────────────
      cy.intercept('POST', `/pedidos/${pedidoId}/entregar`).as('entregar')
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).find('.btn-entregar').click()
      cy.get('#modalTitulo').should('be.visible')
      cy.get('#btnModalConfirmar').click()
      cy.wait('@entregar').its('response.statusCode').should('eq', 200)

      // ── 13. LOGOUT ADMIN ───────────────────────────────────────────────────
      cy.logoutAdmin()

      // ── 14. LOGIN CLIENTE ──────────────────────────────────────────────────
      cy.login()

      // ── 15. SOLICITA TROCA TOTAL ───────────────────────────────────────────
      cy.intercept('POST', '/historico/solicitar-troca-total').as('trocaTotal')

      cy.visit(`/historico/${pedidoId}`)

      cy.get('#btnTrocaCompleta').should('not.be.disabled').click()

      cy.get('.input-motivo-item').each(($input) => {
        cy.wrap($input).type('Produto com defeito de fabricação')
      })

      cy.get('#btnConfirmarTroca').click()

      cy.wait('@trocaTotal').then(({ request, response }) => {
        expect(request.body).to.have.property('id_pedido', pedidoId)
        expect(request.body.itens).to.be.an('array').and.have.length.greaterThan(0)
        expect(response.statusCode).to.eq(201)
      })

      cy.url().should('include', `/historico/${pedidoId}`)
      cy.get('.pedido-badge[class*="status-troca"]').should('exist')

      // ── 16. LOGOUT CLIENTE ─────────────────────────────────────────────────
      cy.logout()

      // ── 17. LOGIN ADMIN ────────────────────────────────────────────────────
      cy.loginAdmin()

      // ── 18. ADMIN: processa a solicitação de troca ─────────────────────────
      cy.visit('/solicitacoes-troca')
      cy.url().should('include', '/solicitacoes-troca')

      cy.get('.linha-troca').first().then(($linha) => {
        const idTroca = $linha.attr('data-id')

        // Aprovar
        cy.intercept('POST', `/solicitacoes-troca/${idTroca}/aprovar`).as('aprovarTroca')
        cy.get(`.linha-troca[data-id="${idTroca}"]`).find('.btn-aprovar').click()
        cy.get('#modalTitulo').should('be.visible')
        cy.get('#btnModalConfirmar').click()
        cy.wait('@aprovarTroca').its('response.statusCode').should('eq', 200)
        cy.reload()

        // Recebido
        cy.intercept('POST', `/solicitacoes-troca/${idTroca}/recebida`).as('recebidaTroca')
        cy.get(`.linha-troca[data-id="${idTroca}"]`).find('.btn-receber').click()
        cy.get('#modalTitulo').should('be.visible')
        cy.get('#btnModalConfirmar').click()
        cy.wait('@recebidaTroca').its('response.statusCode').should('eq', 200)
        cy.reload()

        // Estoque
        cy.intercept('POST', `/solicitacoes-troca/${idTroca}/devolver-estoque`).as('estoqueTroca')
        cy.get(`.linha-troca[data-id="${idTroca}"]`).find('.btn-estoque').click()
        cy.get('#modalTitulo').should('be.visible')
        cy.get('#btnModalConfirmar').click()
        cy.wait('@estoqueTroca').its('response.statusCode').should('eq', 200)
      })

      // ── 19. LOGOUT ADMIN ───────────────────────────────────────────────────
      cy.logoutAdmin()

      // ── 20. LOGIN CLIENTE ──────────────────────────────────────────────────
      cy.login()

      // ── 21. ACESSA CONFIGURAÇÕES ───────────────────────────────────────────
      cy.visit('/configuracoes')
      cy.url().should('include', '/configuracoes')
    })

  })
})