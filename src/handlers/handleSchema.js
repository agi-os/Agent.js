import createZodSchemaFromJson from './createZodSchemaFromJson.js'
import generateToolSchemas from '../tools/generateToolSchemas.js'

/**
 * Returns all available tool schemas via the callback
 * @param {Socket} socket - The socket requesting the schemas
 * @returns {object[]} - An array of tool schemas
 * @example
 * socket.on('get schemas', getToolSchemas(socket))
 */
export const getToolSchemas = socket => async callback => {
  // Get all available tool schemas
  const toolSchemas = generateToolSchemas()

  // If a callback function is provided, send the tool schemas to the callback
  if (callback && typeof callback === 'function') {
    callback(toolSchemas)
  }
}

/**
 * Get a schema from the socket's schema map
 * @param {Socket} socket - The socket to get the schema from
 * @returns {Function} - A function that will get a schema from the socket's schema map
 * @example
 * socket.on('get schema', getSchema(socket))
 */
export const getSchema = socket => async (schemaId, callback) => {
  // Get the schema from the map using the id
  const zodSchema = socket.schemas.get(schemaId)

  // If a callback function is provided, send the schema shape to the callback
  if (callback && typeof callback === 'function') {
    callback(zodSchema.shape)
  }
}

/**
 * Load a schema into the socket's schema map
 * @param {Socket} socket - The socket to load the schema into
 * @returns {Function} - A function that will load a schema into the socket's schema map
 * @example
 * socket.on('schema', loadSchema(socket))
 */
export const loadSchema = socket => async (schema, callback) => {
  try {
    const zodSchema = createZodSchemaFromJson(schema)

    // Generate a unique id for the schema
    const schemaId = Date.now().toString()

    // Store the schema in the map with the id as the key
    socket.schemas.set(schemaId, zodSchema)

    // Emit the schema id instead of the shape
    socket.emit('schema loaded', { schemaId, schemaJson: schema })

    // If a callback function is provided, send the schema id to the callback
    if (callback && typeof callback === 'function') {
      callback(schemaId)
    }
  } catch (error) {
    console.error('error:', error)
    if (callback && typeof callback === 'function') {
      callback(error)
    }
  }
}
