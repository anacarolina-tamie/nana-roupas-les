const favoritosDao = require('../models/favoritos.dao');

const favoritosController = {

    async toggle(req, res) {
        try {
            const cliente_id = req.session.usuario.id; // ✅ correto
            const { produto_id } = req.body;

            const ids = await favoritosDao.buscarIdsFavoritos(cliente_id);
            const jaFavorito = ids.includes(Number(produto_id));

            if (jaFavorito) {
                await favoritosDao.remover(cliente_id, produto_id);
                return res.json({ favoritado: false });
            } else {
                await favoritosDao.adicionar(cliente_id, produto_id);
                return res.json({ favoritado: true });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ erro: 'Erro ao atualizar favorito' });
        }
    },

    async listar(req, res) {
        try {
            const cliente_id = req.session.usuario.id; // ✅ correto
            const produtos = await favoritosDao.listarPorCliente(cliente_id);
            res.render('favoritos', { produtos });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao carregar favoritos');
        }
    }
};

module.exports = favoritosController;