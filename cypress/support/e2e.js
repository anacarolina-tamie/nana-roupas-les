// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('uncaught:exception', (err) => {
  // Se for o erro do Toastify, ignora e não falha o teste
  if (err.message.includes('Toastify is not defined')) {
    return false
  }
  // Para qualquer outro erro interno da aplicação, o Cypress DEVE falhar o teste
  return true
})