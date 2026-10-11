import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }))

export default app
