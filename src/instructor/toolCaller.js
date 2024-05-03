import { config } from 'dotenv'
const { parsed } = config({ path: '../../.env' })

import Instructor from '@instructor-ai/instructor'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || parsed.GROQ_API_KEY,
})

export const client = Instructor({ client: groq, mode: 'TOOLS', debug: true })

import { z } from 'zod'

const FunctionSchema = z.object({
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
})

/**
 * Call the LLM safely with handling for errors and timeouts.
 * @param {object} params - The parameters for the LLM call.
 * @param {object[]} params.tools - The tools to use in the LLM call.
 * @param {string} params.content - The content to send to the LLM.
 * @returns {object} - The response from the LLM or an error object.
 */
const callLlmSafely = async ({ tools, content }) => {
  try {
    // Create the LLM caller config object
    const toolCaller = {
      messages: [{ role: 'user', content }],
      tools,
      tool_choice: 'auto',
      model: 'llama3-70b-8192',
      temperature: 0,
      // max_retries: 0,
      // response_model: { schema: FunctionSchema, name: 'FunctionSchema' },
    }

    console.log(JSON.stringify(toolCaller, null, 2))

    // Call the LLM
    const responsePromise = client.chat.completions.create(toolCaller)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 1500)
    )

    const response = await Promise.race([responsePromise, timeoutPromise])

    // Return the response
    return response
  } catch (error) {
    console.error(error)
    return { error: error.message }
  }
}

const run =
  socket =>
  async ({ tools, content }, callback) => {
    const response = await callLlmSafely({ tools, content })

    console.log(JSON.stringify(response, null, 2))

    // if we have a callback function, call it with the response
    if (typeof callback === 'function') callback(response)

    return response
  }

export default run
