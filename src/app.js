const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


/*const masterRoutes = require('./routes/master.routes');
app.use('/', masterRoutes);*/


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessão — precisa vir antes das rotas!
app.use(session({
  secret: 'chave-secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hora
}));

const dashboardRoutes = require('./routes/dashboard.routes');
const navegacaoRoutes = require('./routes/navegacao.routes');
const clienteRoutes = require('./routes/cliente.routes');
const clienteCartaoRoutes = require('./routes/clienteCartao.routes');
const cartaoRoutes = require('./routes/cartao.routes');
const enderecoRoutes = require('./routes/endereco.routes');
const clienteEnderecoRoutes = require('./routes/clienteEndereco.routes');
const compraRoutes = require('./routes/compra.routes');
const historicoRoutes = require('./routes/historico.routes');
const carrinhoRoutes = require('./routes/carrinho.routes');
const produtoRoutes = require('./routes/produto.routes');
const cuponsRoutes = require('./routes/cupom.routes');
const estoqueRoutes = require('./routes/estoque.routes');
const chatRoutes = require('./routes/chat.routes');
const freteRoutes = require('./routes/frete.routes');
const favoritosRoutes = require('./routes/favoritos.routes');


app.use((req, res, next) => {
  res.locals.paginaAtiva = '';
  next();
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/', navegacaoRoutes);
app.use('/clientes', clienteRoutes);
app.use('/enderecos', enderecoRoutes);
app.use('/clientes', clienteCartaoRoutes);
app.use('/cartoes', cartaoRoutes);
app.use('/clientes', clienteEnderecoRoutes);
app.use('/', compraRoutes); 
app.use('/', historicoRoutes); 
app.use('/', carrinhoRoutes);
app.use('/', produtoRoutes);
app.use('/cupons', cuponsRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/frete', freteRoutes);
app.use('/favoritos', favoritosRoutes);

module.exports = app;