import instructor from '../instructor/index.js'
import createZodSchemaFromJson from '../instructor/createZodSchemaFromJson.js'

/**
 * Handle message events
 * @param {Socket} socket - The socket to handle messages for
 * @returns {Function} - A function that will handle message events for the socket
 * @example
 * socket.on('message', handleMessage(socket))
 */
const handleMessage =
  socket =>
  async ({ content, schemaId, schemaJson }, callback) => {
    // initialize to an empty schema
    let zodSchema = null

    try {
      if (schemaJson) {
        // Create a Zod schema from the provided JSON schema
        zodSchema = createZodSchemaFromJson(schemaJson)
      } else {
        // Use the predefined schema from the schema map via the schema ID
        zodSchema = socket.schemas.get(schemaId)
      }

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
  }

export default handleMessage
