-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

-- DROP TYPE public."bandeira_cartao";

CREATE TYPE public."bandeira_cartao" AS ENUM (
	'mastercard',
	'visa',
	'elo',
	'americanExpress');

-- DROP SEQUENCE carrinho_id_carrinho_seq;

CREATE SEQUENCE carrinho_id_carrinho_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE cartoes_id_cartao_seq;

CREATE SEQUENCE cartoes_id_cartao_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE clientes_cliente_id_seq;

CREATE SEQUENCE clientes_cliente_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE cores_id_cor_seq;

CREATE SEQUENCE cores_id_cor_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE cupom_id_cupom_seq;

CREATE SEQUENCE cupom_id_cupom_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE cupons_promocionais_id_cupom_prom_seq;

CREATE SEQUENCE cupons_promocionais_id_cupom_prom_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE cupons_troca_id_cupom_troca_seq;

CREATE SEQUENCE cupons_troca_id_cupom_troca_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE enderecos_endereco_id_seq;

CREATE SEQUENCE enderecos_endereco_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE frete_regioes_id_seq;

CREATE SEQUENCE frete_regioes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE item_pedido_id_item_pedido_seq;

CREATE SEQUENCE item_pedido_id_item_pedido_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE itens_carrinho_id_item_seq;

CREATE SEQUENCE itens_carrinho_id_item_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE pedidos_id_pedido_seq;

CREATE SEQUENCE pedidos_id_pedido_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE produtos_id_produto_seq;

CREATE SEQUENCE produtos_id_produto_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE solicitacoes_troca_id_sol_troca_seq;

CREATE SEQUENCE solicitacoes_troca_id_sol_troca_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE transacoes_id_transacao_seq;

CREATE SEQUENCE transacoes_id_transacao_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE trocas_aprovadas_id_troca_apr_seq;

CREATE SEQUENCE trocas_aprovadas_id_troca_apr_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE variacoes_id_variacao_seq;

CREATE SEQUENCE variacoes_id_variacao_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public.clientes definition

-- Drop table

-- DROP TABLE clientes;

CREATE TABLE clientes (
	id_cliente int4 DEFAULT nextval('clientes_cliente_id_seq'::regclass) NOT NULL,
	nome_cliente varchar(100) NOT NULL,
	data_nasc date NOT NULL,
	cpf bpchar(11) NOT NULL,
	telefone bpchar(15) NOT NULL,
	genero varchar(20) NOT NULL,
	email varchar(100) NOT NULL,
	senha varchar(100) NOT NULL,
	CONSTRAINT clientes_cpf_key UNIQUE (cpf),
	CONSTRAINT clientes_email_key UNIQUE (email),
	CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente)
);


-- public.cores definition

-- Drop table

-- DROP TABLE cores;

CREATE TABLE cores (
	id_cor serial4 NOT NULL,
	nome_cor varchar(50) NOT NULL,
	CONSTRAINT cores_nome_cor_key UNIQUE (nome_cor),
	CONSTRAINT cores_pkey PRIMARY KEY (id_cor)
);


-- public.cupons_promocionais definition

-- Drop table

-- DROP TABLE cupons_promocionais;

CREATE TABLE cupons_promocionais (
	id_cupom_prom serial4 NOT NULL,
	nome_cupom_prom varchar(100) NULL,
	cod_cupom_prom varchar(100) NOT NULL,
	valor_cupom_prom numeric(10, 2) NOT NULL,
	CONSTRAINT cupons_promocionais_cod_cupom_prom_key UNIQUE (cod_cupom_prom),
	CONSTRAINT cupons_promocionais_pkey PRIMARY KEY (id_cupom_prom),
	CONSTRAINT cupons_promocionais_valor_cupom_prom_check CHECK ((valor_cupom_prom > (0)::numeric))
);


-- public.frete_regioes definition

-- Drop table

-- DROP TABLE frete_regioes;

CREATE TABLE frete_regioes (
	id serial4 NOT NULL,
	uf bpchar(2) NOT NULL,
	peso_min_g int4 NOT NULL,
	peso_max_g int4 NOT NULL,
	valor numeric NOT NULL,
	prazo_dias int4 NOT NULL,
	CONSTRAINT frete_regioes_pkey PRIMARY KEY (id)
);
ALTER TABLE public.frete_regioes ENABLE ROW LEVEL SECURITY;


-- public.produtos definition

-- Drop table

-- DROP TABLE produtos;

CREATE TABLE produtos (
	id_produto serial4 NOT NULL,
	nome_produto varchar(255) NOT NULL,
	categoria varchar(100) NULL,
	valor_produto numeric(10, 2) NOT NULL,
	materiais varchar(150) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	url_imagem varchar NULL,
	CONSTRAINT produtos_pkey PRIMARY KEY (id_produto)
);


-- public.carrinho definition

-- Drop table

-- DROP TABLE carrinho;

CREATE TABLE carrinho (
	id_carrinho serial4 NOT NULL,
	id_cliente int4 NOT NULL,
	criado_em timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	atualizado_em timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT carrinho_id_cliente_key UNIQUE (id_cliente),
	CONSTRAINT carrinho_pkey PRIMARY KEY (id_carrinho),
	CONSTRAINT fk_carrinho_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);


-- public.cartoes definition

-- Drop table

-- DROP TABLE cartoes;

CREATE TABLE cartoes (
	id_cartao serial4 NOT NULL,
	id_cliente int4 NOT NULL,
	numero_cartao bpchar(4) NOT NULL,
	nome_impresso varchar(100) NOT NULL,
	bandeira public."bandeira_cartao" NOT NULL,
	cvv bpchar(3) NOT NULL,
	preferencial bool DEFAULT false NULL,
	CONSTRAINT cartoes_pkey PRIMARY KEY (id_cartao),
	CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);
CREATE UNIQUE INDEX unico_preferencial_por_cliente ON public.cartoes USING btree (id_cliente) WHERE (preferencial = true);


-- public.enderecos definition

-- Drop table

-- DROP TABLE enderecos;

CREATE TABLE enderecos (
	id_endereco int4 DEFAULT nextval('enderecos_endereco_id_seq'::regclass) NOT NULL,
	tp_endereco varchar(100) NOT NULL,
	tp_residencia varchar(100) NOT NULL,
	cep bpchar(8) NOT NULL,
	tp_logradouro varchar(100) NOT NULL,
	logradouro varchar(100) NOT NULL,
	pais varchar(100) NOT NULL,
	cidade varchar(100) NOT NULL,
	bairro varchar(100) NOT NULL,
	numero varchar(20) NOT NULL,
	complemento varchar(100) NULL,
	nome_endereco varchar(100) NOT NULL,
	id_cliente int4 NOT NULL,
	estado varchar NULL,
	CONSTRAINT enderecos_pkey PRIMARY KEY (id_endereco),
	CONSTRAINT enderecos_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);


-- public.favoritos definition

-- Drop table

-- DROP TABLE favoritos;

CREATE TABLE favoritos (
	cliente_id int4 NOT NULL,
	produto_id int4 NOT NULL,
	CONSTRAINT favoritos_pkey PRIMARY KEY (cliente_id, produto_id),
	CONSTRAINT favoritos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
	CONSTRAINT favoritos_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES produtos(id_produto) ON DELETE CASCADE
);


-- public.pedidos definition

-- Drop table

-- DROP TABLE pedidos;

CREATE TABLE pedidos (
	id_pedido serial4 NOT NULL,
	status_pedido varchar(50) DEFAULT 'Em processamento'::character varying NOT NULL,
	frete numeric(10, 2) NOT NULL,
	desconto numeric(10, 2) NULL,
	valor_total numeric(10, 2) NOT NULL,
	id_cliente int4 NOT NULL,
	id_endereco int4 NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	valor_produtos numeric(10, 2) DEFAULT 0 NOT NULL,
	CONSTRAINT pedidos_frete_check CHECK ((frete > (0)::numeric)),
	CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido),
	CONSTRAINT pedidos_valor_total_check CHECK ((valor_total > (0)::numeric)),
	CONSTRAINT pedidos_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
	CONSTRAINT pedidos_id_endereco_fkey FOREIGN KEY (id_endereco) REFERENCES enderecos(id_endereco)
);


-- public.transacoes definition

-- Drop table

-- DROP TABLE transacoes;

CREATE TABLE transacoes (
	id_transacao serial4 NOT NULL,
	status_transacao varchar(50) DEFAULT 'Em processamento'::character varying NOT NULL,
	id_pedido int4 NOT NULL,
	id_cartao_1 int4 NOT NULL,
	id_cartao_2 int4 NULL,
	id_cupom_troca int4 NULL,
	CONSTRAINT transacoes_pkey PRIMARY KEY (id_transacao),
	CONSTRAINT transacoes_id_cartao_1_fkey FOREIGN KEY (id_cartao_1) REFERENCES cartoes(id_cartao),
	CONSTRAINT transacoes_id_cartao_2_fkey FOREIGN KEY (id_cartao_2) REFERENCES cartoes(id_cartao),
	CONSTRAINT transacoes_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);


-- public.variacoes definition

-- Drop table

-- DROP TABLE variacoes;

CREATE TABLE variacoes (
	id_variacao serial4 NOT NULL,
	produto_id int4 NOT NULL,
	cor_id int4 NOT NULL,
	tamanho varchar(5) NOT NULL,
	comprimento numeric(5, 2) NULL,
	largura numeric(5, 2) NULL,
	peso_gramas int4 NULL,
	estoque int4 DEFAULT 0 NULL,
	url_imagem varchar NULL,
	CONSTRAINT variacoes_pkey PRIMARY KEY (id_variacao),
	CONSTRAINT variacoes_cor_id_fkey FOREIGN KEY (cor_id) REFERENCES cores(id_cor),
	CONSTRAINT variacoes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES produtos(id_produto) ON DELETE CASCADE
);


-- public.cupom definition

-- Drop table

-- DROP TABLE cupom;

CREATE TABLE cupom (
	id_cupom serial4 NOT NULL,
	cliente_id int4 NOT NULL,
	pedido_id int4 NULL,
	codigo varchar(60) NOT NULL,
	valor numeric(10, 2) NOT NULL,
	usado bool DEFAULT false NOT NULL,
	data_validade timestamp NULL,
	criado_em timestamp DEFAULT now() NOT NULL,
	CONSTRAINT cupom_codigo_key UNIQUE (codigo),
	CONSTRAINT cupom_pkey PRIMARY KEY (id_cupom),
	CONSTRAINT cupom_valor_check CHECK ((valor > (0)::numeric)),
	CONSTRAINT cupom_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente),
	CONSTRAINT cupom_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id_pedido)
);


-- public.item_pedido definition

-- Drop table

-- DROP TABLE item_pedido;

CREATE TABLE item_pedido (
	id_item_pedido serial4 NOT NULL,
	qtde_item int4 NOT NULL,
	id_pedido int4 NULL,
	id_variacao int4 NOT NULL,
	status_troca varchar(30) DEFAULT NULL::character varying NULL,
	CONSTRAINT item_pedido_pkey PRIMARY KEY (id_item_pedido),
	CONSTRAINT item_pedido_qtde_item_check CHECK ((qtde_item > 0)),
	CONSTRAINT fk_item_pedido_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
	CONSTRAINT item_pedido_id_variacao_fkey FOREIGN KEY (id_variacao) REFERENCES variacoes(id_variacao)
);


-- public.itens_carrinho definition

-- Drop table

-- DROP TABLE itens_carrinho;

CREATE TABLE itens_carrinho (
	id_item serial4 NOT NULL,
	id_carrinho int4 NOT NULL,
	id_variacao int4 NOT NULL,
	quantidade int4 DEFAULT 1 NOT NULL,
	preco_unitario numeric(10, 2) NOT NULL,
	CONSTRAINT itens_carrinho_pkey PRIMARY KEY (id_item),
	CONSTRAINT itens_carrinho_quantidade_check CHECK ((quantidade > 0)),
	CONSTRAINT uq_carrinho_variacao UNIQUE (id_carrinho, id_variacao),
	CONSTRAINT fk_item_carrinho FOREIGN KEY (id_carrinho) REFERENCES carrinho(id_carrinho) ON DELETE CASCADE,
	CONSTRAINT fk_item_variacao FOREIGN KEY (id_variacao) REFERENCES variacoes(id_variacao)
);


-- public.solicitacoes_troca definition

-- Drop table

-- DROP TABLE solicitacoes_troca;

CREATE TABLE solicitacoes_troca (
	id_sol_troca serial4 NOT NULL,
	status_troca varchar(20) DEFAULT 'Pendente'::character varying NOT NULL,
	id_item_pedido int4 NOT NULL,
	qtde_item numeric NULL,
	motivo_troca varchar NULL,
	id_pedido int4 NULL,
	CONSTRAINT solicitacoes_troca_pkey PRIMARY KEY (id_sol_troca),
	CONSTRAINT solicitacoes_troca_id_item_pedido_fkey FOREIGN KEY (id_item_pedido) REFERENCES item_pedido(id_item_pedido),
	CONSTRAINT solicitacoes_troca_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);


-- public.trocas_aprovadas definition

-- Drop table

-- DROP TABLE trocas_aprovadas;

CREATE TABLE trocas_aprovadas (
	id_troca_apr serial4 NOT NULL,
	status_rec bool DEFAULT false NULL,
	ret_est bool DEFAULT false NULL,
	id_sol_troca int4 NOT NULL,
	CONSTRAINT trocas_aprovadas_pkey PRIMARY KEY (id_troca_apr),
	CONSTRAINT trocas_aprovadas_id_sol_troca_fkey FOREIGN KEY (id_sol_troca) REFERENCES solicitacoes_troca(id_sol_troca)
);


-- public.cupons_troca definition

-- Drop table

-- DROP TABLE cupons_troca;

CREATE TABLE cupons_troca (
	id_cupom_troca serial4 NOT NULL,
	nome_cupom_troca varchar(100) NULL,
	cod_cupom_troca varchar(100) NOT NULL,
	valor_cupom_troca numeric(10, 2) NOT NULL,
	id_sol_troca int4 NULL,
	cliente_id int4 NULL,
	usado bool DEFAULT false NOT NULL,
	CONSTRAINT cupons_troca_cod_cupom_troca_key UNIQUE (cod_cupom_troca),
	CONSTRAINT cupons_troca_pkey PRIMARY KEY (id_cupom_troca),
	CONSTRAINT cupons_troca_valor_cupom_troca_check CHECK ((valor_cupom_troca > (0)::numeric)),
	CONSTRAINT cupons_troca_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente),
	CONSTRAINT cupons_troca_id_sol_troca_fkey FOREIGN KEY (id_sol_troca) REFERENCES solicitacoes_troca(id_sol_troca)
);