import { yamlToZod } from '../utils/schemaConversions.js'
import { client } from '../llm/index.js'
import { createYamlSchemaPrompt } from '../prompts/createYamlSchema.js'

/**
 * Handles LLM requests that involve schema interaction.
 *
 * @param {Socket} socket - The socket.io socket instance.
 * @returns {Function} - An asynchronous function to handle incoming schema-based LLM requests.
 */
const handleLlmWithSchema =
  socket =>
  async ({ content, schema, temperature, system, preset }, callback) => {
    console.log('✨ Handling LLM call with schema', {
      content,
      schema,
      temperature,
      system,
      preset,
    })

    try {
      // Schema Presets
      if (preset === 'createYamlSchema') {
        ;({ system, schema } = createYamlSchemaPrompt)
        console.log('Using custom system prompt:', { preset, system, schema })
      }

      // LLM Interaction (no schema validation if no schema)
      const response = await client.call({
        system,
        temperature,
        content,
        zodSchema: schema ? yamlToZod(schema) : null, // Pass schema conditionally
        modelName: 'llama3-70b-8192',
      })

      console.log('LLM Response:', JSON.stringify(response))

      // Callback Handling
      if (typeof callback === 'function') {
        callback(response) // Send the full response, let the client decide what to trim
      }
    } catch (error) {
      console.error('LLM Schema Error:', error)
      socket.emit('error', error.message)
    }
  }

export default handleLlmWithSchema
