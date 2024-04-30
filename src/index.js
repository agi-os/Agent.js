import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'

import instructor from './instructor/index.js'
import createZodSchemaFromJson from './instructor/createZodSchemaFromJson.js'

const app = express()
const server = createServer(app)
const io = new Server(server)

const __dirname = dirname(fileURLToPath(import.meta.url))

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'))
})

io.on('connection', async socket => {
  socket.on('chat message', async msg => {
    console.log('message: ' + msg)

    try {
      const response = await instructor(msg, socket.schema)
      socket.emit('response', response)
    } catch (error) {
      console.error('error:', error)
      socket.emit('error', error)
    }
  })

  socket.on('schema', async schema => {
    socket.schema = createZodSchemaFromJson(schema)
    socket.emit('schema loaded', socket.schema.shape)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
