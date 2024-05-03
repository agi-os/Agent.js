import path from 'path'
import generateToolSchema from './generateToolSchema.js'
import extractJSDocFromFile from './extractJSDocFromFile.js'
import { tools } from './index.js'

/**
 * Generates schemas for all tools
 * @returns {object[]} - An array of tool schemas
 */
const generateToolSchemas = () => {
  const toolSchemas = []

  // Loop through tools and extract JSDoc
  for (const toolName in tools) {
    // Get the full file path relative to the current file
    const __dirname = path.dirname(new URL(import.meta.url).pathname)
    const filePath = path.join(__dirname, `${toolName}.js`)

    // Extract JSDoc from the file
    const jsdocData = extractJSDocFromFile(filePath)

    // convert jsdocData to the tool schema
    const toolSchema = generateToolSchema({
      functionName: toolName,
      functionDescription: jsdocData[0].description,
      propertyName: jsdocData[0].tags[0].name,
      propertyType: jsdocData[0].tags[0].type.name,
      propertyDescription: jsdocData[0].tags[0].description,
    })

    toolSchemas.push(toolSchema)
  }

  return toolSchemas
}

export default generateToolSchemas
