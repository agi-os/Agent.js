/**
 * Generates a schema for LLM tool use
 * @param {object} props - The properties for the tool schema
 * @param {string} props.functionName - The name of the function
 * @param {string} props.functionDescription - The description of the function
 * @param {string} props.propertyName - The name of the property
 * @param {string} props.propertyType - The type of the property
 * @param {string} props.propertyDescription - The description of the property
 */

const generateToolSchema = ({
  functionName,
  functionDescription,
  propertyName,
  propertyType,
  propertyDescription,
}) => {
  return {
    type: 'function',
    function: {
      name: functionName,
      description: functionDescription,
      parameters: {
        type: 'object',
        properties: {
          [propertyName]: {
            type: propertyType,
            description: propertyDescription,
          },
        },
        required: [propertyName],
      },
    },
  }
}

export default generateToolSchema
