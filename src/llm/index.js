import { config } from 'dotenv'
const { parsed } = config()

import Instructor from '@instructor-ai/instructor'
import Groq from 'groq-sdk'

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY || parsed.GROQ_API_KEY,
})

export const client = {
  /**
   * Provides a consistent interface for making calls to the LLM.
   * Handles schema validation and response formatting.
   *
   * @param {object} params - The parameters for the LLM call.
   * @param {string} params.system - The system prompt for the LLM.
   * @param {string} params.content - The user's input content.
   * @param {number} [params.temperature=1] -  The temperature parameter for the LLM.
   * @param {object} [params.zodSchema=null] - The Zod schema for response validation.
   * @param {string} [params.modelName='llama3-70b-8192'] - The name of the LLM model to use.
   * @returns {Promise<object>} - The LLM's response, potentially validated against the schema.
   * @throws {Error} - If there's an error during the LLM call or schema validation.
   */
  call: async ({
    system,
    content,
    temperature = 1,
    zodSchema = null,
    modelName = 'llama3-70b-8192',
  }) => {
    try {
      const messages = []

      if (system) {
        messages.push({ role: 'system', content: system })
      }

      messages.push({
        role: 'user',
        content:
          typeof content === 'string' ? content : JSON.stringify(content),
      })

      const instructorClient = Instructor({
        client: groqClient,
        mode: 'JSON',
        debug: true,
      })

      const response = await instructorClient.chat.completions.create({
        messages,
        model: modelName,
        temperature,
        response_model: { schema: zodSchema, name: 'Schema' },
      })

      return response
    } catch (error) {
      console.error('LLM Call Error:', error)
      throw new Error(`Error during LLM interaction: ${error.message}`)
    }
  },
}
