import { faker } from '@faker-js/faker';
import { gerarCPF } from '../support/cpf-helper'; // Supondo que você tenha uma função local

const emailAleatorio = faker.internet.email();
const cpfValido = gerarCPF(); // Gera um CPF novo toda vez

describe('Cadastro de cliente', () => {
  it('preenche o formulário e salva', () => {
    cy.visit('http://localhost:3000/cadastrar-cliente')

    // =========================
    // DADOS PESSOAIS
    // =========================
    cy.get('input[name="nomeCliente"]').type('Ana Carolina Teste')
    cy.get('select[name="genero"]').select('Feminino')
    cy.get('input[name="dataNasc"]').type('2000-05-15')
    cy.get('input[name="cpf"]').type(cpfValido);
    cy.get('input[name="telefone"]').type('(11) 91234-5678')
    cy.get('input[name="email"]').type(emailAleatorio);
    cy.get('input[name="senha"]').type('Senha@123')
    cy.get('input[name="confirmarSenha"]').type('Senha@123')

    // =========================
    // ENDEREÇO DE COBRANÇA
    // =========================
    cy.get('input[name="cobranca[tpResidencia]"]').type('Apartamento')
    cy.get('input[name="cobranca[cep]"]').type('01310-100')
    cy.get('input[name="cobranca[tpLogradouro]"]').type('Avenida')
    cy.get('input[name="cobranca[logradouro]"]').type('Paulista')
    cy.get('input[name="cobranca[pais]"]').type('Brasil')
    cy.get('input[name="cobranca[estado]"]').type('SP')
    cy.get('input[name="cobranca[cidade]"]').type('São Paulo')
    cy.get('input[name="cobranca[bairro]"]').type('Bela Vista')
    cy.get('input[name="cobranca[numero]"]').type('1000')
    cy.get('input[name="cobranca[complemento]"]').type('Apto 42')
    cy.get('input[name="cobranca[nomeEndereco]"]').type('Meu apartamento')

    // =========================
    // ENDEREÇO DE ENTREGA (índice começa em 1)
    // =========================
    cy.contains('button', '+ adicionar endereço').click()

    cy.get('input[name="enderecos[1][tp_residencia]"]').type('Casa')
    cy.get('input[name="enderecos[1][cep]"]').type('01310-100')
    cy.get('input[name="enderecos[1][tp_logradouro]"]').type('Rua')
    cy.get('input[name="enderecos[1][logradouro]"]').type('das Flores')
    cy.get('input[name="enderecos[1][pais]"]').type('Brasil')
    cy.get('input[name="enderecos[1][estado]"]').type('SP')
    cy.get('input[name="enderecos[1][cidade]"]').type('São Paulo')
    cy.get('input[name="enderecos[1][bairro]"]').type('Centro')
    cy.get('input[name="enderecos[1][numero]"]').type('42')
    cy.get('input[name="enderecos[1][complemento]"]').type('Casa 1')
    cy.get('input[name="enderecos[1][nome_endereco]"]').type('Casa da mamãe')

    cy.contains('button', '+ adicionar endereço').click()

    cy.get('input[name="enderecos[2][tp_residencia]"]').type('Apartamento')
    cy.get('input[name="enderecos[2][cep]"]').type('20040-020')
    cy.get('input[name="enderecos[2][tp_logradouro]"]').type('Avenida')
    cy.get('input[name="enderecos[2][logradouro]"]').type('Atlântica')
    cy.get('input[name="enderecos[2][pais]"]').type('Brasil')
    cy.get('input[name="enderecos[2][estado]"]').type('RJ')
    cy.get('input[name="enderecos[2][cidade]"]').type('Rio de Janeiro')
    cy.get('input[name="enderecos[2][bairro]"]').type('Copacabana')
    cy.get('input[name="enderecos[2][numero]"]').type('1200')
    cy.get('input[name="enderecos[2][complemento]"]').type('Ap 502')
    cy.get('input[name="enderecos[2][nome_endereco]"]').type('Apartamento na praia')

    // Versão 3
    cy.contains('button', '+ adicionar endereço').click()

    cy.get('input[name="enderecos[3][tp_residencia]"]').type('Chácara')
    cy.get('input[name="enderecos[3][cep]"]').type('13087-560')
    cy.get('input[name="enderecos[3][tp_logradouro]"]').type('Estrada')
    cy.get('input[name="enderecos[3][logradouro]"]').type('do Sol')
    cy.get('input[name="enderecos[3][pais]"]').type('Brasil')
    cy.get('input[name="enderecos[3][estado]"]').type('SP')
    cy.get('input[name="enderecos[3][cidade]"]').type('Campinas')
    cy.get('input[name="enderecos[3][bairro]"]').type('Barão Geraldo')
    cy.get('input[name="enderecos[3][numero]"]').type('Km 15')
    cy.get('input[name="enderecos[3][complemento]"]').type('Sítio Esperança')
    cy.get('input[name="enderecos[3][nome_endereco]"]').type('Chácara da família')


    // =========================
    // CARTÃO (índice começa em 1)
    // =========================
    cy.contains('button', '+ adicionar cartão').click()

    cy.get('input[name="cartoes[1][numero_cartao]"]').type('4111 1111 1111 1111')
    cy.get('input[name="cartoes[1][nome_impresso]"]').type('ANA C TESTE')
    cy.get('select[name="cartoes[1][bandeira]"]').select('visa')
    cy.get('input[name="cartoes[1][cvv]"]').type('123')


    cy.contains('button', '+ adicionar cartão').click()

    cy.get('input[name="cartoes[2][numero_cartao]"]').type('5385 0011 3057 3357')
    cy.get('input[name="cartoes[2][nome_impresso]"]').type('JOÃO P SILVA')
    cy.get('select[name="cartoes[2][bandeira]"]').select('mastercard')
    cy.get('input[name="cartoes[2][cvv]"]').type('456')
    cy.get('input[name="cartao_preferencial"][value="2"]').check()

    // Cartão 3
    cy.contains('button', '+ adicionar cartão').click()

    cy.get('input[name="cartoes[3][numero_cartao]"]').type('5304 9539 2335 7265')
    cy.get('input[name="cartoes[3][nome_impresso]"]').type('MARIA L SOUZA')
    cy.get('select[name="cartoes[3][bandeira]"]').select('elo')
    cy.get('input[name="cartoes[3][cvv]"]').type('789')


    // =========================
    // SUBMIT
    // =========================
    cy.get('button[type="submit"]').click()

    // verifica redirecionamento para login após sucesso
    cy.url().should('include', '/login')
  })
})