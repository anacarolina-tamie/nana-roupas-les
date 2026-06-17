const EnderecoDAO = require('../models/endereco.dao');
const Endereco = require('../models/Endereco');
const validarEndereco = require('../validators/enderecoValidator');

exports.criarEndereco = async (req, res) => {
    try {
        const id_cliente = req.params.id;

        let {
            tp_residencia,
            cep,
            tp_logradouro,
            logradouro,
            pais,
            estado,
            cidade,
            bairro,
            numero,
            complemento,
            nome_endereco
        } = req.body;

        // 🔹 define automaticamente
        const tp_endereco = "Entrega";

        // 🔹 normalizações básicas
        cep = cep?.replace("-", "").trim();
        estado = estado?.toUpperCase().trim();

        const endereco = {
            tp_endereco,
            tp_residencia,
            cep,
            tp_logradouro,
            logradouro,
            pais,
            estado,
            cidade,
            bairro,
            numero,
            complemento,
            nome_endereco,
            id_cliente
        };

        // 🔥 validação
        const erros = await validarEndereco(endereco);

        if (erros.length > 0) {
            return res.status(400).json({ erros });
        }

        const enderecoCriado = await EnderecoDAO.criar(endereco);

        res.status(201).json(enderecoCriado);

    } catch (erro) {
        console.error("ERRO COMPLETO:", erro);
        res.status(500).json({ erro: "Erro ao cadastrar endereço" });
    }
};



exports.buscarEndereco = async (req, res) => {
    try {
        const id = req.params.id;

        const endereco = await EnderecoDAO.buscarPorId(id);

        res.json(endereco);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar endereço" });
    }
};


exports.atualizarEndereco = async (req, res) => {
    try {
        const id = req.params.id;

        let {
            tp_residencia,
            cep,
            tp_logradouro,
            logradouro,
            pais,
            estado,
            cidade,
            bairro,
            numero,
            complemento,
            nome_endereco
        } = req.body;

        // 🔹 normalização (igual ao criar)
        cep = cep?.replace("-", "").trim();
        estado = estado?.toUpperCase().trim();

        const endereco = {
            tp_residencia,
            cep,
            tp_logradouro,
            logradouro,
            pais,
            estado,
            cidade,
            bairro,
            numero,
            complemento,
            nome_endereco
        };

        // 🔥 validação
        const erros = await validarEndereco(endereco);

        if (erros.length > 0) {
            return res.status(400).json({ erros });
        }

        const enderecoAtualizado = await EnderecoDAO.atualizar(id, endereco);

        res.json(enderecoAtualizado);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao atualizar endereço" });
    }
};


exports.excluirEndereco = async (req, res) => {
    try {
        const id = req.params.id;
        const idCliente = req.session.usuario.id;

        console.log('idCliente:', idCliente);
        const enderecos = await EnderecoDAO.buscarPorCliente(idCliente);
        console.log('total enderecos:', enderecos.length);

        if (enderecos.length <= 2) {
            return res.status(400).json({ erro: 'É necessário ter pelo menos um endereço cadastrado.' });
        }

        const deletados = await EnderecoDAO.deletar(id);
        if (deletados === 0) {
            return res.status(404).json({ erro: "Endereço não encontrado" });
        }

        res.json({ mensagem: "Endereço excluído com sucesso" });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao excluir endereço" });
    }
};


exports.buscarEnderecosCliente = async (req, res) => {
    try {
        const clienteId = req.params.id;

        const enderecos = await EnderecoDAO.buscarPorCliente(clienteId);

        res.json(enderecos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar endereços" });
    }
};


exports.listarEnderecos = async (req, res) => {
    try {

        const clienteId = req.params.id;

        const enderecos = await EnderecoDAO.buscarPorCliente(clienteId);

        res.render('lista-enderecos', { enderecos });

    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao buscar endereços");
    }
};

exports.atualizarEndereco = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.body);
        const { cobranca } = req.body;


        await EnderecoDAO.atualizar(id, {
            tp_residencia: cobranca.tpResidencia,
            cep: cobranca.cep.replace(/\D/g, ''),
            tp_logradouro: cobranca.tpLogradouro,
            logradouro: cobranca.logradouro,
            pais: cobranca.pais,
            estado: cobranca.estado,
            cidade: cobranca.cidade,
            bairro: cobranca.bairro,
            numero: cobranca.numero,
            complemento: cobranca.complemento,
            nome_endereco: cobranca.nomeEndereco,
        });

        res.redirect('/configuracoes');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar endereço');
    }
};





