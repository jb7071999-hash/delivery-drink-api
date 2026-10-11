import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../config/supabase.js'

const PERFIS = ['cliente', 'loja', 'entregador']

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// [E1] POST /auth/cadastro
export async function cadastrar(req, res) {
  const { nome, email, senha, perfil = 'cliente', telefone } = req.body

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' })
  }
  if (!PERFIS.includes(perfil)) {
    return res.status(400).json({ erro: `Perfil inválido. Use: ${PERFIS.join(', ')}.` })
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter ao menos 6 caracteres.' })
  }

  try {
    const senha_hash = await bcrypt.hash(senha, 10)
    const { data, error } = await db()
      .from('usuarios')
      .insert({ nome, email: email.toLowerCase(), senha_hash, perfil, telefone })
      .select('id, nome, email, perfil')
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ erro: 'Já existe um usuário com esse e-mail.' })
      }
      throw error
    }

    return res.status(201).json({ usuario: data, token: gerarToken(data) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' })
  }
}

// [E1] POST /auth/login
export async function login(req, res) {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' })
  }

  try {
    const { data: usuario, error } = await db()
      .from('usuarios')
      .select('id, nome, email, perfil, senha_hash')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (error) throw error

    const senhaCorreta = usuario && await bcrypt.compare(senha, usuario.senha_hash)
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' })
    }

    const { senha_hash, ...publico } = usuario
    return res.json({ usuario: publico, token: gerarToken(usuario) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ erro: 'Erro ao fazer login.' })
  }
}
