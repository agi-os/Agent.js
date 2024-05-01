import { z } from 'zod'
import createChatCompletion from './ai.js'

const ReflectionResponse = z
  .object({
    suggestions: z
      .array(z.string())
      .describe('Suggestions to improve the answer'),
    improvements: z.array(z.string()).describe('Improvements to the answer'),
  })
  .describe('The response from the reflection on the answer')

/**
 * Uses AI to reflect on the answer to optimize it
 * @param {string} answer The answer to reflect on
 * @returns {string} The reflected answer
 */
const reflection = async query => {
  const response = await createChatCompletion({
    query,
    systemMessage: 'Reflect on the provided answer to optimize it',
    schema: ReflectionResponse,
  })

  return response
}

export default reflection
