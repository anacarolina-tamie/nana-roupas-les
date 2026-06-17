Cypress.Commands.add('login', () => {
  cy.fixture('usuario').then((usuario) => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.session(
      [usuario.email, usuario.senha],
      () => {
        cy.visit('/login')
        cy.get('input[name="email"]').type(usuario.email)
        cy.get('input[name="senha"]').type(usuario.senha)
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/tela-inicial')
      },
      {
        validate() {
          cy.visit('/tela-inicial')
          cy.url().should('include', '/tela-inicial')
        },
        cacheAcrossSpecs: false,
      }
    )
  })
})

Cypress.Commands.add('loginAdmin', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.session(
    'admin',
    () => {
      cy.visit('/login')
      cy.get('input[name="email"]').type('nana@gmail.com')
      cy.get('input[name="senha"]').type('12345678')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/lista-clientes')
    },
    {
      validate() {
        cy.visit('/lista-clientes')
        cy.url().should('include', '/lista-clientes')
      },
      cacheAcrossSpecs: false,
    }
  )
})

Cypress.Commands.add('logout', () => {
  cy.visit('/configuracoes')
  cy.contains('Sair da conta').click()
  cy.get('#btn-confirmar-exclusao').click()
  cy.url().should('include', '/login')
})

// ⚠️ cy.on() deve ser registrado ANTES do clique que dispara o confirm()
Cypress.Commands.add('logoutAdmin', () => {
  cy.window().then((win) => {
    cy.stub(win, 'confirm').returns(true)
  })
  cy.contains('Sair da conta').click()
  cy.url().should('include', '/login')
})


Cypress.Commands.add('login2', () => {
  cy.fixture('usuario2').then((usuario) => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.session(
      [usuario.email, usuario.senha],
      () => {
        cy.visit('/login')
        cy.get('input[name="email"]').type(usuario.email)
        cy.get('input[name="senha"]').type(usuario.senha)
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/tela-inicial')
      },
      {
        validate() {
          cy.visit('/tela-inicial')
          cy.url().should('include', '/tela-inicial')
        },
        cacheAcrossSpecs: false,
      }
    )
  })
})