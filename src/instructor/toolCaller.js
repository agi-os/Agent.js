import { config } from 'dotenv'
const { parsed } = config({ path: '../../.env' })

import Instructor from '@instructor-ai/instructor'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || parsed.GROQ_API_KEY,
})

export const client = Instructor({ client: groq, mode: 'TOOLS', debug: true })

const getFunctionCallDescription = response => {
  if (response.choices && response.choices.length > 0) {
    const firstChoice = response.choices[0]
    if (
      firstChoice.message &&
      firstChoice.message.tool_calls &&
      firstChoice.message.tool_calls.length > 0
    ) {
      const firstToolCall = firstChoice.message.tool_calls[0]
      const functionName = firstToolCall.function.name
      let functionArguments = firstToolCall.function.arguments
      try {
        functionArguments = JSON.parse(functionArguments)
      } catch (error) {
        console.error('Error parsing function arguments:', error)
      }
      return {
        function: functionName,
        arguments: functionArguments,
      }
    }
  }
  return { error: 'No function call found in the response' }
}

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
      messages: [
        {
          role: 'system',
          content:
            'You are a tool selector, use the most appropriate tool for the job.',
        },
        { role: 'user', content },
      ],
      tools,
      tool_choice: 'auto',
      model: 'llama3-70b-8192',
      temperature: 0,
    }

    // Call the LLM
    const responsePromise = client.chat.completions.create(toolCaller)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 1500)
    )

    const response = getFunctionCallDescription(
      await Promise.race([responsePromise, timeoutPromise])
    )

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
