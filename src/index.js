import express from 'express'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Server } from 'socket.io'
import cors from 'cors'

// Handlers
import handleLlmWithSchema from './handlers/handleLlmWithSchema.js'
import { getToolSchemas } from './handlers/handleSchema.js'
import handleAction from './handlers/handleAction.js'

const app = express()
app.use(cors())
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
})

const __dirname = dirname(fileURLToPath(import.meta.url))

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'))
})

io.on('connection', async socket => {
  console.log('New client connected:', socket.id)

  // Socket Event Handlers
  socket.on('llmSchema', handleLlmWithSchema(socket))

  socket.on('action', handleAction(socket))
  socket.on('toolSchemas', getToolSchemas(socket))

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 4444
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
