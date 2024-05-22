import { groq } from '../instructor/index.js'
import createZodSchemaFromJson from './createZodSchemaFromJson.js'

/**
 * Handle direct events
 * @param {Socket} socket - The socket to handle messages for
 * @returns {Function} - A function that will handle message events for the socket
 * @example
 * socket.on('message', handleLLM(socket))
 */
const handleLLM =
  socket =>
  async ({ content }, callback) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: JSON.stringify(content),
          },
        ],
        model: 'llama3-70b-8192',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null,
      })

      // If a callback function is provided, send the response to the callback
      if (callback && typeof callback === 'function') {
        // trim metadata from response
        delete response._meta

        // send response to callback
        callback(response.choices[0].message.content)
      }
    } catch (error) {
      console.error('error:', error)
      socket.emit('error', error)
    }
  }

export default handleLLM
