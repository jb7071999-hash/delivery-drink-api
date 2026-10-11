import { db } from '../config/supabase.js'

// Status da entrega e o status correspondente do pedido
const FLUXO = {
  coletado: 'a_caminho',
  a_caminho: 'a_caminho',
  entregue: 'entregue',
}

// [E6] PATCH /entregas/:id/status   Body: { status }
export async function atualizarStatusEntrega(req, res) {
  const { id } = req.params
  const { status } = req.body

  if (!Object.keys(FLUXO).includes(status)) {
    return res.status(400).json({
      erro: `Status inválido. Use: ${Object.keys(FLUXO).join(', ')}.`,
    })
  }

  try {
    const supabase = db()

    const { data: entrega, error: erroBusca } = await supabase
      .from('entregas')
      .select('id, pedido_id, entregador_id, status')
      .eq('id', id)
      .maybeSingle()
    if (erroBusca) throw erroBusca

    if (!entrega) {
      return res.status(404).json({ erro: 'Entrega não encontrada.' })
    }
    if (entrega.entregador_id && entrega.entregador_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Esta entrega pertence a outro entregador.' })
    }
    if (entrega.status === 'entregue') {
      return res.status(409).json({ erro: 'Esta entrega já foi concluída.' })
    }

    const agora = new Date().toISOString()
    const atualizacao = {
      status,
      entregador_id: req.usuario.id,
      ...(entrega.status === 'aguardando' && { data_hora_inicio: agora }),
      ...(status === 'entregue' && { data_hora_fim: agora }),
    }

    const { data: atualizada, error: erroUpdate } = await supabase
      .from('entregas')
      .update(atualizacao)
      .eq('id', id)
      .select('id, pedido_id, status, data_hora_inicio, data_hora_fim')
      .single()
    if (erroUpdate) throw erroUpdate

    await supabase.from('pedidos').update({ status: FLUXO[status] }).eq('id', entrega.pedido_id)

    return res.json(atualizada)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro ao atualizar entrega.' })
  }
}
