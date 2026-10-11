import { db } from '../config/supabase.js'

// [E2] GET /categorias
export async function listarCategorias(req, res) {
  try {
    const { data, error } = await db().from('categorias').select('id, nome').order('nome')
    if (error) throw error
    return res.json(data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro ao listar categorias.' })
  }
}

// [E2] GET /produtos?busca=gin&categoria=<id>
export async function listarProdutos(req, res) {
  const { busca, categoria } = req.query

  try {
    let consulta = db()
      .from('produtos')
      .select('id, nome, descricao, preco, estoque, categoria:categorias(id, nome), loja:usuarios(id, nome_fantasia)')
      .gt('estoque', 0)
      .order('nome')

    if (busca) consulta = consulta.ilike('nome', `%${busca}%`)
    if (categoria) consulta = consulta.eq('categoria_id', categoria)

    const { data, error } = await consulta
    if (error) throw error
    return res.json(data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro ao listar produtos.' })
  }
}
