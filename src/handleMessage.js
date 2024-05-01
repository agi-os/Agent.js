import instructor from './instructor/index.js'

/**
 * Handle message events
 * @param {Socket} socket - The socket to handle messages for
 * @returns {Function} - A function that will handle message events for the socket
 * @example
 * socket.on('message', handleMessage(socket))
 */
const handleMessage =
  socket =>
  async ({ content, schemaId }, callback) => {
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
  }

export default handleMessage
