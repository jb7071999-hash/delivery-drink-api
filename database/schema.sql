-- Delivery Drink — esquema do banco (Supabase / PostgreSQL)
-- Baseado no diagrama de classes da Entrega 1.
-- Execute no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

-- [E1] Usuários (Cliente, Loja e Entregador compartilham a tabela base)
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  telefone text,
  perfil text not null check (perfil in ('cliente', 'loja', 'entregador')),
  -- campos específicos de Loja
  nome_fantasia text,
  cnpj text,
  horario_abertura time,
  horario_fechamento time,
  -- campos específicos de Entregador
  veiculo text,
  placa text,
  disponivel boolean default false,
  criado_em timestamptz default now()
);

create table if not exists enderecos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  rua text not null,
  numero text not null,
  cidade text not null,
  cep text
);

-- [E2] Categorias e Produtos
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid references usuarios(id) on delete cascade,
  categoria_id uuid references categorias(id),
  nome text not null,
  descricao text,
  preco numeric(10,2) not null check (preco >= 0),
  estoque integer not null default 0 check (estoque >= 0)
);

-- [E4] Pedidos, itens e pagamentos
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references usuarios(id),
  loja_id uuid not null references usuarios(id),
  status text not null default 'confirmado'
    check (status in ('confirmado', 'em_preparo', 'pronto', 'a_caminho', 'entregue', 'recusado')),
  total numeric(10,2) not null,
  data_hora timestamptz default now()
);

create table if not exists itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_id uuid not null references produtos(id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null
);

create table if not exists pagamentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  metodo text not null check (metodo in ('pix', 'cartao', 'dinheiro')),
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'recusado')),
  valor numeric(10,2) not null
);

-- [E6] Entregas
create table if not exists entregas (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  entregador_id uuid references usuarios(id),
  status text not null default 'aguardando'
    check (status in ('aguardando', 'coletado', 'a_caminho', 'entregue')),
  data_hora_inicio timestamptz,
  data_hora_fim timestamptz
);

-- Dados iniciais
insert into categorias (nome) values
  ('Cervejas'), ('Vinhos'), ('Destilados'), ('Sem álcool')
on conflict (nome) do nothing;
