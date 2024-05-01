import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import cors from 'cors'

import instructor from './instructor/index.js'
import createZodSchemaFromJson from './instructor/createZodSchemaFromJson.js'

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

  socket.on('message', async ({ content, schemaId }, callback) => {
    try {
      // Get the schema from the map using the id
      const zodSchema = socket.schemas.get(schemaId)

      // Run the instructor with the content and schema
      const response = await instructor(content, zodSchema)

      // If a callback function is provided, send the response to the callback
      if (callback && typeof callback === 'function') {
        // trim metadata from response
        delete response._meta

        // send response to callback
        callback(response)
      }
    } catch (error) {
      console.error('error:', error)
      socket.emit('error', error)
    }
  })

  // Create a map to store schemas
  socket.schemas = new Map()

  socket.on('schema', async schema => {
    const zodSchema = createZodSchemaFromJson(schema)
    // Generate a unique id for the schema
    const schemaId = Date.now().toString()
    // Store the schema in the map with the id as the key
    socket.schemas.set(schemaId, zodSchema)
    // Emit the schema id instead of the shape
    socket.emit('schema loaded', schemaId)
  })

  socket.on('get schema', async (schemaId, callback) => {
    // Get the schema from the map using the id
    const zodSchema = socket.schemas.get(schemaId)
    // If a callback function is provided, send the schema shape to the callback
    if (callback && typeof callback === 'function') {
      callback(zodSchema.shape)
    }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
