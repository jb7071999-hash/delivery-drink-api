# 🍹 Delivery Drink — API

API REST do **Delivery Drink**, plataforma de delivery de bebidas que conecta clientes, lojas parceiras e entregadores.

**Projeto Integrador II** · UAPITSI19 · Turma TLAGOASF (2025.2)

Front-end do projeto: https://github.com/jb7071999-hash/propjeto_uapi

---

## 🛠️ Tecnologias back-end

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 18+ |
| Framework web | Express 4 |
| Banco de dados | Supabase (PostgreSQL) |
| Acesso ao banco | `@supabase/supabase-js` |
| Autenticação | JWT (`jsonwebtoken`) + senhas com hash `bcryptjs` |
| Outros | `cors`, `dotenv` |

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite o .env com a URL e a service key do seu projeto Supabase

# 3. Criar as tabelas
# Copie o conteúdo de database/schema.sql e execute no SQL Editor do Supabase

# 4. Iniciar a API
npm run dev
```

A API sobe em **http://localhost:3333**. Teste com `GET /health`.

## 📡 Endpoints

| Método | Rota | Acesso | Descrição | Épico |
|---|---|---|---|---|
| POST | `/auth/cadastro` | Público | Cria conta (cliente, loja ou entregador) e retorna token | E1 |
| POST | `/auth/login` | Público | Autentica e retorna token JWT | E1 |
| GET | `/categorias` | Público | Lista categorias | E2 |
| GET | `/produtos?busca=&categoria=` | Público | Lista produtos com busca e filtro | E2 |
| POST | `/pedidos` | Cliente | Cria pedido com itens e pagamento | E4 |
| PATCH | `/entregas/:id/status` | Entregador | Atualiza status (coletado, a_caminho, entregue) | E6 |

Rotas protegidas exigem o header `Authorization: Bearer <token>`.

### Exemplo — criar pedido

```json
POST /pedidos
{
  "loja_id": "uuid-da-loja",
  "metodo_pagamento": "pix",
  "itens": [
    { "produto_id": "uuid-do-produto", "quantidade": 3 }
  ]
}
```

Os preços são sempre lidos do banco — o cliente não envia valores.

## 🗄️ Modelo de dados

Definido em [`database/schema.sql`](database/schema.sql), baseado no diagrama de classes da Entrega 1:
`usuarios`, `enderecos`, `categorias`, `produtos`, `pedidos`, `itens_pedido`, `pagamentos` e `entregas`.

## 📁 Estrutura

```
database/schema.sql        # tabelas (E1, E2, E4, E6)
src/
├── config/supabase.js     # cliente do Supabase
├── middleware/auth.js     # JWT e controle por perfil
├── controllers/           # regras de cada endpoint
├── routes/index.js        # definição das rotas
├── app.js
└── server.js
```

## 👥 Equipe

- Maria dos Remédios Oliveira Santos
- Francisco das Chagas de Sousa
- Francisco de Assis Brito Rocha Junior
- Joceli do Nascimento Rodrigues
- Salomão Wenderson Medeiros Jucá
