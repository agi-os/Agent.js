import z from 'zod'
import yaml from 'js-yaml'

/**
 * Converts a Zod schema to an Ajv schema.
 *
 * @param {object} zodSchema - The Zod schema to convert to Ajv.
 * @returns {object} The converted Ajv schema.
 * @throws {Error} If the Zod schema type is not supported.
 */
const zodToAjv = zodSchema => {
  const zodType = zodSchema.constructor.name

  switch (zodType) {
    case 'ZodString':
      return {
        type: 'string',
        minLength: zodSchema._def.minLength?.value,
        maxLength: zodSchema._def.maxLength?.value,
        pattern: zodSchema._def.regex?.source,
      }
    case 'ZodNumber':
      return {
        type: 'number',
        minimum: zodSchema._def.min?.value,
        maximum: zodSchema._def.max?.value,
        exclusiveMinimum: zodSchema._def.gt?.value,
        exclusiveMaximum: zodSchema._def.lt?.value,
        multipleOf: zodSchema._def.multipleOf?.value,
      }
    case 'ZodBoolean':
      return { type: 'boolean' }
    case 'ZodEnum':
      return {
        type: 'string', // Or 'number' if enum values are numbers
        enum: zodSchema._def.values,
      }
    case 'ZodArray':
      return {
        type: 'array',
        items: zodToAjv(zodSchema._def.items),
        minItems: zodSchema._def.minItems?.value,
        maxItems: zodSchema._def.maxItems?.value,
      }
    case 'ZodObject': {
      const properties = {}
      for (const key in zodSchema._def.shape) {
        properties[key] = zodToAjv(zodSchema._def.shape[key])
      }
      return {
        type: 'object',
        properties,
        required: Object.keys(zodSchema._def.shape).filter(
          key => !zodSchema._def.shape[key].isOptional()
        ),
        additionalProperties: zodSchema._def.unknownKeys !== 'strip',
      }
    }
    default:
      throw new Error(`Unsupported Zod type: ${zodType}`)
  }
}

/**
 * Converts an Ajv schema to a Zod schema.
 *
 * @param {object} ajvSchema - The Ajv schema to convert to Zod.
 * @returns {object} The converted Zod schema.
 * @throws {Error} If the Ajv schema type is not supported.
 * @example
 * // Example Ajv schema (as a plain JavaScript object)
const ajvUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3 },
    age: { type: 'number', minimum: 18 },
    isAdmin: { type: 'boolean' },
  },
  required: ['name', 'age'],
}

// Convert Ajv to Zod
const zodUserSchema = ajvToZod(ajvUserSchema)
console.log('Zod Schema:', zodUserSchema)

// You can now use the 'zodUserSchema' for validation
const data = { name: 'Alice', age: 25, isAdmin: true }
const result = zodUserSchema.safeParse(data)
console.log('Validation Result:', result)
 */
const ajvToZod = ajvSchema => {
  let zodNumber = z.number()

  switch (ajvSchema.type) {
    case 'string':
      let zodString = z.string()
      if (ajvSchema.minLength) zodString = zodString.min(ajvSchema.minLength)
      if (ajvSchema.maxLength) zodString = zodString.max(ajvSchema.maxLength)
      if (ajvSchema.pattern)
        zodString = zodString.regex(new RegExp(ajvSchema.pattern))
      return zodString

    case 'integer':
      if (ajvSchema.minimum) zodNumber = zodNumber.min(ajvSchema.minimum)
      if (ajvSchema.maximum) zodNumber = zodNumber.max(ajvSchema.maximum)
      if (ajvSchema.exclusiveMinimum)
        zodNumber = zodNumber.gt(ajvSchema.exclusiveMinimum)
      if (ajvSchema.exclusiveMaximum)
        zodNumber = zodNumber.lt(ajvSchema.exclusiveMaximum)
      if (ajvSchema.multipleOf)
        zodNumber = zodNumber.multipleOf(ajvSchema.multipleOf)
      return zodNumber

    case 'number':
      if (ajvSchema.minimum) zodNumber = zodNumber.min(ajvSchema.minimum)
      if (ajvSchema.maximum) zodNumber = zodNumber.max(ajvSchema.maximum)
      if (ajvSchema.exclusiveMinimum)
        zodNumber = zodNumber.gt(ajvSchema.exclusiveMinimum)
      if (ajvSchema.exclusiveMaximum)
        zodNumber = zodNumber.lt(ajvSchema.exclusiveMaximum)
      if (ajvSchema.multipleOf)
        zodNumber = zodNumber.multipleOf(ajvSchema.multipleOf)
      return zodNumber

    case 'boolean':
      return z.boolean()

    case 'array':
      return z
        .array(ajvToZod(ajvSchema.items))
        .min(ajvSchema.minItems || 0)
        .max(ajvSchema.maxItems || undefined)
    case 'object': {
      // Allow any _meta object
      const shape = { _meta: z.any() }

      for (const key in ajvSchema.properties) {
        shape[key] = z.any() //  Use z.any() to allow any shape
        if (!ajvSchema.required?.includes(key)) {
          shape[key] = shape[key].optional()
        }
      }

      return z.object(shape).strict(!ajvSchema.additionalProperties)
    }
    default:
      throw new Error(`Unsupported Ajv type: ${ajvSchema.type}`)
  }
}

/**
 * Parses a YAML string into a JSON object and returns it for Ajv schema conversion.
 *
 * @param {string} yamlString - The YAML string to parse into JSON.
 * @returns {object} The parsed JSON object for Ajv schema conversion.
 * @throws {Error} If the YAML string is invalid or cannot be parsed into a JSON object.
 * @example
const yamlSchema = `
type: object
properties:
  name:
    type: string
    minLength: 3
  age:
    type: integer
    minimum: 18
required:
  - name
  - age
`

// Convert YAML to Ajv schema
const ajvSchema = yamlToAjv(yamlSchema)

// Now you can use 'ajvSchema' with Ajv
const ajv = new Ajv()
const validate = ajv.compile(ajvSchema)

const validData = { name: 'Alice', age: 25 }
const invalidData = { name: 'Bo', age: 12 }

console.log('Valid Data:', validate(validData)) // true
console.log('Invalid Data:', validate(invalidData)) // false (and Ajv errors)

// ---  You can further integrate this with your Zod conversion ---
const zodSchema = ajvToZod(ajvSchema)
// ... use zodSchema for validation with Zod ...
 */
export const yamlToAjv = yamlString => {
  try {
    // Inject boilerplate annoyances automatically

    // Prepend type: object newline if not present

    const jsonObject = yaml.load(yamlString) // Parse YAML to JSON
    if (typeof jsonObject !== 'object' || jsonObject === null) {
      throw new Error('Invalid YAML: must represent a JSON object')
    }
    return jsonObject // Return the parsed JSON for Ajv
  } catch (error) {
    throw new Error(`YAML parsing error: ${error.message}`)
  }
}

/**
 * Converts a YAML string to a Zod schema.
 *
 * @param {string} yamlString - The YAML string representing the schema.
 * @returns {object} - The Zod schema object.
 * @throws {Error} - If there are errors parsing the YAML or converting to Zod.
 */
export const yamlToZod = yamlString => {
  try {
    const jsonObject = yaml.load(yamlString)
    if (typeof jsonObject !== 'object' || jsonObject === null) {
      throw new Error('Invalid YAML: Must represent a JSON object.')
    }
    return ajvToZod(jsonObject)
  } catch (error) {
    throw new Error(`YAML parsing error: ${error.message}`)
  }
}
