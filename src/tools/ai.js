import { client } from '../instructor/index.js'

/**
 * Creates a chat completion using chat API.
 * @param {object} params - The parameters for the chat completion.
 * @param {string} params.query - The query to send to the chat completion.
 * @param {string} params.systemMessage - The system message to send to the chat completion.
 * @param {object} params.schema - The schema for the response.
 * @param {string} [params.model='llama3-70b-8192'] - The model to use for the chat completion.
 * @param {number} [params.temperature=0.01] - The temperature for the chat completion.
 * @param {number} [params.maxRetries=0] - The maximum number of retries for the chat completion.
 * @returns {Promise<object>} - A promise that resolves to the generated chat completion response.
 */
const createChatCompletion = async ({
  query,
  systemMessage,
  schema,
  model = 'llama3-70b-8192',
  temperature = 0.01,
  maxRetries = 0,
}) => {
  const response = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: query,
      },
    ],
    model,
    temperature,
    max_retries: maxRetries,
    response_model: { schema, name: 'ResponseSchema' },
  })

  return response
}

export default createChatCompletion
