import { db } from '../config/supabase.js'

const METODOS = ['pix', 'cartao', 'dinheiro']

// [E4] POST /pedidos
// Body: { loja_id, metodo_pagamento, itens: [{ produto_id, quantidade }] }
export async function criarPedido(req, res) {
  const { loja_id, metodo_pagamento, itens } = req.body

  if (!loja_id) {
    return res.status(400).json({ erro: 'Informe a loja do pedido (loja_id).' })
  }
  if (!METODOS.includes(metodo_pagamento)) {
    return res.status(400).json({ erro: `Forma de pagamento inválida. Use: ${METODOS.join(', ')}.` })
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'O pedido precisa ter ao menos um item.' })
  }
  const itemInvalido = itens.some(
    (i) => !i.produto_id || !Number.isInteger(i.quantidade) || i.quantidade <= 0
  )
  if (itemInvalido) {
    return res.status(400).json({ erro: 'Cada item precisa de produto_id e quantidade inteira maior que zero.' })
  }

  const supabase = db()
  let pedidoId = null

  try {
    // Os preços vêm do banco, nunca do cliente
    const ids = itens.map((i) => i.produto_id)
    const { data: produtos, error: erroProdutos } = await supabase
      .from('produtos')
      .select('id, preco, estoque, loja_id')
      .in('id', ids)
    if (erroProdutos) throw erroProdutos

    const porId = new Map(produtos.map((p) => [p.id, p]))
    for (const item of itens) {
      const produto = porId.get(item.produto_id)
      if (!produto) {
        return res.status(404).json({ erro: `Produto ${item.produto_id} não encontrado.` })
      }
      if (produto.loja_id !== loja_id) {
        return res.status(400).json({ erro: 'Todos os itens do pedido devem ser da mesma loja.' })
      }
      if (produto.estoque < item.quantidade) {
        return res.status(409).json({ erro: `Estoque insuficiente para o produto ${item.produto_id}.` })
      }
    }

    const total = itens.reduce(
      (soma, item) => soma + Number(porId.get(item.produto_id).preco) * item.quantidade,
      0
    )

    const { data: pedido, error: erroPedido } = await supabase
      .from('pedidos')
      .insert({ cliente_id: req.usuario.id, loja_id, total })
      .select('id, status, total, data_hora')
      .single()
    if (erroPedido) throw erroPedido
    pedidoId = pedido.id

    const { error: erroItens } = await supabase.from('itens_pedido').insert(
      itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: porId.get(item.produto_id).preco,
      }))
    )
    if (erroItens) throw erroItens

    const { error: erroPagamento } = await supabase
      .from('pagamentos')
      .insert({ pedido_id: pedido.id, metodo: metodo_pagamento, valor: total })
    if (erroPagamento) throw erroPagamento

    const { data: entrega, error: erroEntrega } = await supabase
      .from('entregas')
      .insert({ pedido_id: pedido.id })
      .select('id, status')
      .single()
    if (erroEntrega) throw erroEntrega

    return res.status(201).json({ ...pedido, entrega })
  } catch (e) {
    console.error(e)
    // Sem transação no supabase-js: desfaz o pedido parcial (cascade apaga o resto)
    if (pedidoId) await supabase.from('pedidos').delete().eq('id', pedidoId)
    return res.status(500).json({ erro: 'Erro ao criar pedido.' })
  }
}
