import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import cors from 'cors'

import handleMessage from './handlers/handleMessage.js'
import handleLLM from './handlers/handleLLM.js'
import {
  getSchema,
  loadSchema,
  getToolSchemas,
} from './handlers/handleSchema.js'
import handleAction from './handlers/handleAction.js'

import toolCaller from './instructor/toolCaller.js'

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
  console.log('initial transport', socket.conn.transport.name) // prints "polling"
  socket.conn.once('upgrade', () => {
    console.log('upgraded transport', socket.conn.transport.name) // prints "websocket"
  })

  // For connection debugging
  // socket.conn.on('packet', console.log)
  // socket.conn.on('packetCreate', console.log)
  // socket.conn.on('drain', console.log)
  // socket.conn.on('close', console.log)

  socket.prependAny((event, ...args) => {
    console.log('↙️ ', event, args)
  })

  // Reply to test with timestamp
  socket.on('test', (...args) => {
    // If last of args is callback, call it back
    if (typeof args[args.length - 1] === 'function') {
      args[args.length - 1](new Date().getTime())
    } else {
      console.log('test with no callback received', args)
    }
  })

  // Handle message events
  socket.on('message', handleMessage(socket))

  // Handle LLM events
  socket.on('llm', handleLLM(socket))

  // Handle tool events
  socket.on('tool', toolCaller(socket))

  // Create a map to store schemas
  socket.schemas = new Map()

  // Handle schema events
  socket.on('schema', loadSchema(socket))
  socket.on('get schema', getSchema(socket))
  socket.on('tool schemas', getToolSchemas(socket))

  // Handle action events
  socket.on('action', handleAction(socket))

  // Handle disconnect events
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

// Start the server
server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
