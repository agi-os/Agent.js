import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import cors from 'cors'

import handleMessage from './handleMessage.js'
import { getSchema, loadSchema } from './handleSchema.js'

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

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'))
})

io.on('connection', async socket => {
  // Handle message events
  socket.on('message', handleMessage(socket))

  // Create a map to store schemas
  socket.schemas = new Map()

  // Handle schema events
  socket.on('schema', loadSchema(socket))
  socket.on('get schema', getSchema(socket))

  // Handle disconnect events
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

// Start the server
server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
