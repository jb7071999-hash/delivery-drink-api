import jwt from 'jsonwebtoken'

// Exige token JWT válido (header Authorization: Bearer <token>)
export function autenticar(req, res, next) {
  const header = req.headers.authorization || ''
  const [tipo, token] = header.split(' ')

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token de autenticação ausente.' })
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' })
  }
}

// Restringe a rota a determinados perfis (cliente, loja, entregador)
export function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      return res.status(403).json({ erro: 'Seu perfil não tem permissão para esta ação.' })
    }
    next()
  }
}
