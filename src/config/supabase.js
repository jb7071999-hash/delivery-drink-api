import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

// Se as variáveis não estiverem definidas, a API sobe mesmo assim
// (útil para testar rotas de validação), mas qualquer acesso ao banco falha.
export const supabase = url && key
  ? createClient(url, key)
  : null

export function db() {
  if (!supabase) {
    throw new Error('Supabase não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_KEY no .env')
  }
  return supabase
}
