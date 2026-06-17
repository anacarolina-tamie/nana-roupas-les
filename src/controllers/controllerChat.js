const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../database/connection');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listarProdutosCompletos() {
    const result = await db.query(`
        SELECT 
            p.id_produto,
            p.nome_produto,
            p.categoria,
            p.valor_produto,
            p.materiais,
            c.nome_cor,
            v.tamanho,
            v.estoque
        FROM produtos p
        JOIN variacoes v ON v.produto_id = p.id_produto
        JOIN cores c ON c.id_cor = v.cor_id
        WHERE v.estoque > 0
        ORDER BY p.nome_produto
    `);
    return result.rows;
}

async function buscarHistoricoCliente(clienteId) {
    if (!clienteId) return null;

    const result = await db.query(`
        SELECT 
            p.nome_produto,
            p.categoria,
            c.nome_cor,
            v.tamanho,
            pe.created_at
        FROM pedidos pe
        JOIN item_pedido ip ON ip.id_pedido = pe.id_pedido
        JOIN variacoes v ON v.id_variacao = ip.id_variacao
        JOIN produtos p ON p.id_produto = v.produto_id
        JOIN cores c ON c.id_cor = v.cor_id
        WHERE pe.id_cliente = $1
        ORDER BY pe.created_at DESC
    `, [clienteId]);

    return result.rows;
}

// Extrai JSON mesmo quando o modelo prefixa texto antes do bloco
function parseResposta(texto) {
    // 1) tenta parsear direto (caso ideal)
    try { return JSON.parse(texto.trim()); } catch {}

    // 2) remove possível bloco de código markdown (```json ... ```)
    const semMarkdown = texto.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
    try { return JSON.parse(semMarkdown); } catch {}

    // 3) extrai o primeiro objeto JSON {...} encontrado no texto
    const match = texto.match(/\{[\s\S]*\}/);
    if (match) {
        try { return JSON.parse(match[0]); } catch {}
    }

    throw new Error('JSON não encontrado na resposta');
}

async function chat(req, res) {
    try {
        const { mensagem, historico } = req.body;
        const clienteId = req.session?.usuario?.id || null;

        const rows = await listarProdutosCompletos();
        const compras = await buscarHistoricoCliente(clienteId);

        // Agrupa variações por produto
        const mapa = {};
        rows.forEach(r => {
            if (!mapa[r.nome_produto]) {
                mapa[r.nome_produto] = {
                    id: r.id_produto,
                    categoria: r.categoria,
                    valor: parseFloat(r.valor_produto).toFixed(2),
                    materiais: r.materiais,
                    variacoes: []
                };
            }
            mapa[r.nome_produto].variacoes.push(`${r.nome_cor} / ${r.tamanho}`);
        });

        const listaProdutos = Object.entries(mapa).map(([nome, info]) =>
            `- ID:${info.id} | ${nome} | R$ ${info.valor} | Categoria: ${info.categoria || 'N/A'} | Material: ${info.materiais || 'N/A'} | Disponível em: ${info.variacoes.join(', ')}`
        ).join('\n');

        // Monta contexto de compras
        let contextoCompras = '';
        if (compras && compras.length > 0) {
            const lista = compras.map(c =>
                `- ${c.nome_produto} (${c.categoria}) | Cor: ${c.nome_cor} | Tamanho: ${c.tamanho} | Data: ${new Date(c.created_at).toLocaleDateString('pt-BR')}`
            ).join('\n');
            contextoCompras = `\n\nHISTÓRICO DE COMPRAS DA CLIENTE:\n${lista}`;
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: `RESPONDA APENAS COM JSON VÁLIDO. ZERO texto fora do JSON. NENHUMA palavra de introdução, sem markdown, sem blocos de código. Se colocar qualquer texto fora do JSON a resposta será inválida.

Você é uma atendente da Nana Roupas, loja de roupas femininas online.

Formato obrigatório:
{
  "mensagem": "texto introdutório simpático",
  "produtos": [
    {
      "id": 123,
      "nome": "Nome Exato do Produto",
      "preco": "XX.XX",
      "variacoes": "Azul / P, Preto / M"
    }
  ]
}

${compras && compras.length > 0
    ? 'Essa cliente tem histórico de compras. Use isso para personalizar as recomendações: priorize categorias que ela já comprou, evite sugerir produtos idênticos aos recentes.'
    : 'Essa cliente não tem histórico de compras ainda. Faça recomendações gerais baseadas no que ela pedir.'
}

Para respostas que não envolvem recomendação de produtos (saudações, dúvidas gerais), retorne:
{ "mensagem": "sua resposta aqui", "produtos": [] }

Se não tiver produtos adequados, retorne:
{ "mensagem": "Infelizmente, não encontramos um produto ideal para você neste momento. Se quiser explorar outras alternativas, estou à disposição para ajudar a encontrar a melhor opção.", "produtos": [] }

NUNCA invente produtos. APENAS use produtos da lista abaixo.

LISTA DE PRODUTOS EM ESTOQUE:
${listaProdutos}${contextoCompras}`
        });

        const chatSession = model.startChat({
            history: (historico || []).map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }))
        });

        const result = await chatSession.sendMessage(mensagem);
        const texto = result.response.text();

        try {
            const json = parseResposta(texto);
            res.json({ tipo: 'produtos', ...json });
        } catch {
            res.json({ tipo: 'texto', resposta: texto });
        }
    } catch (err) {
        console.error(err);

        const mensagemErro = err?.message || '';
        const statusErro = err?.status || err?.code || '';

        let respostaUsuario = 'Erro ao processar mensagem.';

        if (statusErro === 429 || mensagemErro.includes('429')) {
            if (mensagemErro.toLowerCase().includes('daily')) {
                respostaUsuario = 'Nossa assistente virtual atingiu o limite diário de atendimentos. Tente novamente amanhã ou entre em contato pelo WhatsApp!';
            } else if (mensagemErro.toLowerCase().includes('per minute') || mensagemErro.toLowerCase().includes('rate')) {
                respostaUsuario = 'Muitas pessoas nos consultando ao mesmo tempo! Aguarde alguns segundos e tente novamente.';
            } else {
                respostaUsuario = 'Limite de atendimentos atingido. Tente novamente em breve!';
            }
        }

        res.status(500).json({ tipo: 'texto', resposta: respostaUsuario });
    }
}

module.exports = { chat };