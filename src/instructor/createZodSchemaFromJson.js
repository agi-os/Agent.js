import { z } from 'zod'

/**
 * Create a Zod schema from a JSON string.
 * @param {string} json - JSON string representing a schema.
 * @returns {z.ZodObject} - Zod schema object.
 */
const createZodSchemaFromJson = json => {
  const schemaObj = JSON.parse(json)
  const zodSchemaObj = {}

  for (const key in schemaObj) {
    const { type, constraints, description } = schemaObj[key]
    let zodSchema

    switch (type) {
      case 'number':
        zodSchema = z.number()
        if (constraints.min !== undefined)
          zodSchema = zodSchema.min(constraints.min)
        if (constraints.max !== undefined)
          zodSchema = zodSchema.max(constraints.max)
        break
      case 'string':
        zodSchema = z.string()
        break
      case 'enum':
        zodSchema = z.enum(constraints.values)
        break
      default:
        throw new Error(`Unsupported type: ${type}`)
    }

    if (description) {
      zodSchema = zodSchema.describe(description)
    }

    zodSchemaObj[key] = zodSchema
  }

  return z.object(zodSchemaObj)
}

export default createZodSchemaFromJson
