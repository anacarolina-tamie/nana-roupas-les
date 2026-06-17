const ClienteDAO = require('../models/cliente.dao');

// Admin fixo
const ADMIN = {
    email: 'nana@gmail.com',
    senha: '12345678'
};

exports.loginPost = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'Preencha email e senha.' });
        }

        // 1. Verificar se é Admin
        if (email === ADMIN.email && senha === ADMIN.senha) {
            req.session.usuario = { tipo: 'admin', email };
            return res.json({ ok: true, redirect: '/lista-clientes' });
        }

        // 2. Buscar Cliente no Banco
        const cliente = await ClienteDAO.buscarPorEmail(email);

        // 3. Validar se cliente existe e a senha bate (comparação direta como você pediu)
        if (!cliente || cliente.senha !== senha) {
            return res.status(401).json({ erro: 'Email ou senha inválidos' });
        }

        // 4. Sucesso cliente - Salva na sessão
        req.session.usuario = { 
            tipo: 'cliente', 
            id: cliente.id_cliente, 
            nome: cliente.nome_cliente 
        };
        
        return res.json({ ok: true, redirect: '/tela-inicial' });

    } catch (erro) {
        console.error("Erro no login:", erro);
        // Se for uma requisição JSON (Postman), retorne JSON. Se for browser, renderize.
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ erro: 'Erro interno no servidor' });
        }
        res.status(500).render('login', { erro: 'Erro no servidor. Tente novamente.' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao encerrar sessão:', err);
            return res.status(500).json({ erro: 'Erro ao sair da conta' });
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};