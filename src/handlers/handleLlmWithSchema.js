import instructor from '../instructor/index.js'
import { yamlToZod } from './zodAjvYamlConvert.js'

import {
  system as createYamlSchemaSystemPrompt,
  yaml as createYamlSchemaYaml,
} from '../prompts/createYamlSchema.js'

/**
 * Handle message events
 * @param {Socket} socket - The socket to handle messages for
 * @returns {Function} - A function that will handle message events for the socket
 * @example
 * socket.on('message', handleMessage(socket))
 */
const handleLlmWithSchema =
  socket =>
  async ({ content, schema, temperature, system, preset }, callback) => {
    console.log('✨ handling call with schema', {
      content,
      schema,
      temperature,
      system,
      preset,
    })

    // If we have a reference available, use the reference name to initialize the custom values
    if (preset === 'createYamlSchema') {
      system = createYamlSchemaSystemPrompt
      schema = createYamlSchemaYaml
      console.log('using custom system ref', {
        preset,
        system,
        schema,
      })
    }

    // initialize to an empty schema
    let zodSchema = null

    try {
      if (schema) {
        // Create a Zod schema from the provided JSON schema
        zodSchema = yamlToZod(schema)
      } else {
        callback('no schema provided')
      }
      
      console.log(JSON.stringify(zodSchema.shape, null, 2))

      // Run the instructor with the content and schema
      const response = await instructor({
        system,
        temperature,
        content,
        zodSchema,
      })

      console.log(JSON.stringify(response))

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
  }

export default handleLlmWithSchema
