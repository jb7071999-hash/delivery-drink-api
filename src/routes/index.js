import { Router } from 'express'
import { autenticar, exigirPerfil } from '../middleware/auth.js'
import { cadastrar, login } from '../controllers/authController.js'
import { listarCategorias, listarProdutos } from '../controllers/produtoController.js'
import { criarPedido } from '../controllers/pedidoController.js'
import { atualizarStatusEntrega } from '../controllers/entregaController.js'

const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok' }))

// [E1] Autenticação / TELAS DE AUTENTICAÇÃO E LOGIN
router.post('/auth/cadastro', cadastrar)
router.post('/auth/login', login)

// [E2] Catálogo
router.get('/categorias', listarCategorias)
router.get('/produtos', listarProdutos)

// [E4] Pedidos (somente clientes)
router.post('/pedidos', autenticar, exigirPerfil('cliente'), criarPedido)

// [E6] Entregas (Tela de entrega somente para entregadores)
router.patch('/entregas/:id/status', autenticar, exigirPerfil('entregador'), atualizarStatusEntrega)

export default router
