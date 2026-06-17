import { gerarCartao } from '../support/cartao-helper'
Cypress.on('uncaught:exception', () => false)

describe('Fluxo de compra com novo endereço e cartão', () => {
  beforeEach(() => {
    cy.login2()
  })

  it('Adiciona dois produtos e no ato da compra adiciona um novo endereço e cartão e finaliza pedido', () => {

    const cartao = gerarCartao()

    // ── 1. PRODUTO 1: Calça Pantalona ───────────────────────────────────────
    cy.intercept('POST', '/carrinho/itens').as('addCarrinho1')
    cy.visit('/tela-inicial')
    cy.contains('Calça Pantalona').parents('.card-roupa').contains('Ver detalhes').click()
    cy.url().should('include', '/produtos/')
    cy.get('#grupo-tamanhos').contains('G').click()
    cy.get('#grupo-cores').contains('Marrom').click()
    cy.contains('Adicionar ao carrinho').click()
    cy.wait('@addCarrinho1').its('response.statusCode').should('eq', 201)

    // ── 2. PRODUTO 2: Regata ────────────────────────────────────────────────
    cy.intercept('POST', '/carrinho/itens').as('addCarrinho2')
    cy.visit('/tela-inicial')
    cy.contains('Regata com acabamento em tela vintage').parents('.card-roupa').contains('Ver detalhes').click()
    cy.url().should('include', '/produtos/')
    cy.get('#grupo-tamanhos').contains('P').click()
    cy.get('#grupo-cores').contains('Verde').click()
    cy.contains('Adicionar ao carrinho').click()
    cy.wait('@addCarrinho2').its('response.statusCode').should('eq', 201)

    // ── 3. CARRINHO: incrementa Regata para quantidade 2 ───────────────────
    cy.intercept('PUT', '/carrinho/itens/*').as('atualizarQtd')
    cy.visit('/carrinho')
    cy.contains('Regata com acabamento em tela vintage')
      .parents('.card-roupa')
      .find('.botao-quantidade')
      .last()
      .click()
    cy.wait('@atualizarQtd').its('response.statusCode').should('eq', 200)

    cy.contains('Calça Pantalona')
      .parents('.card-roupa')
      .find('.valor-quantidade')
      .invoke('text').invoke('trim').should('eq', '1')

    cy.contains('Regata com acabamento em tela vintage')
      .parents('.card-roupa')
      .find('.valor-quantidade')
      .invoke('text').invoke('trim').should('eq', '2')

    cy.contains('R$ 210,90').should('be.visible')

    // ── 4. NAVEGA PARA FINALIZAR PEDIDO ────────────────────────────────────
    cy.intercept('GET', '/finalizar-pedido').as('paginaFinalizar')
    cy.contains('Ir para o pagamento').should('be.visible').click()
    cy.wait('@paginaFinalizar')
    cy.url().should('include', '/finalizar-pedido')

    // ── 5. ADICIONA ENDEREÇO NA TELA DE FINALIZAR ──────────────────────────
    // ── 5. ADICIONA ENDEREÇO NA TELA DE FINALIZAR ──────────────────────────
    cy.contains('+ Adicionar outro endereço').click()
    cy.get('input[name="cobranca[tpResidencia]"]').type('Casa')
    cy.get('input[name="cobranca[cep]"]').type('01310-100')
    cy.get('input[name="cobranca[tpLogradouro]"]').type('Avenida')
    cy.get('input[name="cobranca[logradouro]"]').type('Paulista')
    cy.get('input[name="cobranca[pais]"]').type('Brasil')
    cy.get('input[name="cobranca[estado]"]').type('SP')
    cy.get('input[name="cobranca[cidade]"]').type('São Paulo')
    cy.get('input[name="cobranca[bairro]"]').type('Bela Vista')
    cy.get('input[name="cobranca[numero]"]').type('1000')
    cy.get('input[name="cobranca[nomeEndereco]"]').type('Endereço Cypress')

    cy.intercept('POST', '**/enderecos').as('salvarEndereco') // ← antes do click
    cy.contains('Salvar endereço').click()
    cy.wait('@salvarEndereco').its('response.statusCode').should('eq', 201)

    // ── 6. ADICIONA CARTÃO NA TELA DE FINALIZAR ────────────────────────────
    cy.contains('+ Adicionar cartão').click()
    cy.get('input[name="cartao[numero_cartao]"]').type(cartao.numero)
    cy.get('input[name="cartao[nome_impresso]"]').type(cartao.nome)
    cy.get('select[name="cartao[bandeira]"]').select(cartao.bandeira)
    cy.get('input[name="cartao[codigo_seguranca]"]').type(cartao.cvv)

    cy.intercept('POST', '**/clientes/*/cartoes').as('salvarCartao')
    cy.contains('Salvar cartão').click()
    cy.wait('@salvarCartao').its('response.statusCode').should('eq', 201)

    // ── 7. SELECIONA ENDEREÇO E CARTÃO RECÉM-CRIADOS ───────────────────────
    cy.get('#addressList .address-item').should('have.length.at.least', 1)
    cy.get('#cardList .card-item').should('have.length.at.least', 1)

    cy.get('#addressList').contains('Endereço Cypress').click()
    cy.get('#cardList').contains(cartao.numero.slice(-4)).click()

    // ── 8. VALIDA RESUMO E FINALIZA ─────────────────────────────────────────
    cy.get('#sumSubtotal').should('have.text', 'R$ 210,90')
    cy.get('#sumFrete').should('have.text', 'R$ 15,50 · 2 dias úteis')
    cy.get('#sumDesconto').should('have.text', '—')
    cy.get('#sumTotal').should('have.text', 'R$ 226,40')

    cy.intercept('POST', '/finalizar-pedido').as('finalizarPedido')
    cy.get('#btnPay').should('not.be.disabled').click()
    cy.wait('@finalizarPedido').its('response.statusCode').should('eq', 201)

    // ── 9. HISTÓRICO: valida pedido e detalhes ──────────────────────────────
    cy.url().should('include', '/historico')
    cy.get('#listaPedidos')
      .find('.pedido-row')
      .first()
      .should('contain', 'R$ 226,40')
      .click()
    cy.url().should('match', /\/historico\/\d+/)

    cy.contains('Calça Pantalona').should('be.visible')
    cy.contains('Regata com acabamento em tela vintage').should('be.visible')
    cy.contains('R$ 226,40').should('be.visible')
  })
})