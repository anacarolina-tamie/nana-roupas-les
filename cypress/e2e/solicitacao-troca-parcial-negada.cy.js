import { slowCypressDown } from 'cypress-slow-down'

slowCypressDown(500)


describe('Compra com cartão, aprovação pelo admin e troca parcial negada', () => {

  it('fluxo completo', () => {

    // ── 1. LOGIN CLIENTE ────────────────────────────────────────────────────
    cy.login3()

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
    cy.get('#addressList').contains('Partenon').click()
    cy.get('#cardList').contains('0186').click()

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

    // ── 9. ADMIN: aprova, despacha e confirma entrega ───────────────────────
    cy.get('@pedidoId').then((pedidoId) => {

      cy.visit('/lista-pedidos')
      cy.get('#input-pesquisar').type(String(pedidoId))
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).should('be.visible')

      // Aprovar
      cy.intercept('POST', `/pedidos/${pedidoId}/aprovar`).as('aprovar')
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).find('.btn-aprovar').click()
      cy.get('#modalTitulo').should('be.visible')
      cy.get('#btnModalConfirmar').click()
      cy.wait('@aprovar').its('response.statusCode').should('eq', 200)
      cy.reload()

      // Despachar
      cy.intercept('POST', `/pedidos/${pedidoId}/despachar`).as('despachar')
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).find('.btn-despachar').click()
      cy.get('#modalTitulo').should('be.visible')
      cy.get('#btnModalConfirmar').click()
      cy.wait('@despachar').its('response.statusCode').should('eq', 200)
      cy.reload()

      // Confirmar entrega
      cy.intercept('POST', `/pedidos/${pedidoId}/entregar`).as('entregar')
      cy.get(`.linha-pedido[data-id="${pedidoId}"]`).find('.btn-entregar').click()
      cy.get('#modalTitulo').should('be.visible')
      cy.get('#btnModalConfirmar').click()
      cy.wait('@entregar').its('response.statusCode').should('eq', 200)

      // ── 10. LOGOUT ADMIN ─────────────────────────────────────────────────
      cy.logoutAdmin()

      // ── 11. LOGIN CLIENTE ─────────────────────────────────────────────────
      cy.login3()

      // ── 12. SOLICITA TROCA PARCIAL (apenas 1 item) ───────────────────────

      cy.intercept('POST', '/historico/solicitar-troca-total').as('trocaTotal')

      cy.visit('/historico')
      cy.get('#listaPedidos .pedido-row').first().click()

      cy.intercept('POST', '/historico/solicitar-troca/*').as('trocaParcial')

      cy.get('.btn-trocar-item').first().click()

      cy.get('#input-quantidade').clear().type('1')
      cy.get('#input-motivo-unico').type('Produto com defeito de fabricação')

      cy.get('#btnConfirmarTroca').click()

      cy.wait('@trocaParcial').then(({ request, response }) => {
        expect(request.body).to.have.property('quantidade', 1)
        expect(request.body).to.have.property('motivo')
        expect(response.statusCode).to.eq(201)
      })

      cy.url().should('include', `/historico/${pedidoId}`)

      // ── 13. LOGOUT CLIENTE ────────────────────────────────────────────────
      cy.logout()

      // ── 14. LOGIN ADMIN ───────────────────────────────────────────────────
      cy.loginAdmin()

      // ── 15. ADMIN: nega a solicitação de troca ────────────────────────────
      cy.visit('/solicitacoes-troca')
      cy.url().should('include', '/solicitacoes-troca')

      cy.get('.linha-troca').first().then(($linha) => {
        const idTroca = $linha.attr('data-id')

        cy.intercept('POST', `/solicitacoes-troca/${idTroca}/negar`).as('negarTroca')
        cy.get(`.linha-troca[data-id="${idTroca}"]`).find('.btn-negar').click()
        cy.get('#modalTitulo').should('be.visible')
        cy.get('#btnModalConfirmar').click()
        cy.wait('@negarTroca').its('response.statusCode').should('eq', 200)
      })

      // ── 16. LOGOUT ADMIN ─────────────────────────────────────────────────
      cy.logoutAdmin()

      // ── 17. LOGIN CLIENTE ─────────────────────────────────────────────────
      cy.login3()

      // ── 18. ACESSA HISTÓRICO DO PEDIDO ───────────────────────────────────
      cy.visit(`/historico/${pedidoId}`)
    })
  })
})