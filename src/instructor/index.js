import { config } from 'dotenv'
const { parsed } = config()

import Instructor from '@instructor-ai/instructor'
import Groq from 'groq-sdk'

import createZodSchemaFromJson from './createZodSchemaFromJson.js'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || parsed.GROQ_API_KEY,
})

const client = Instructor({
  client: groq,
  mode: 'TOOLS',
  debug: true,
})

const GenericSchema = createZodSchemaFromJson(
  '{"response": {"type": "string", "description": "Response"}}'
)

const run = async (content, schema = GenericSchema) => {
  const user = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a world class extractor. You always respond in JSON. Current date is ' +
          new Date().toISOString(),
      },
      {
        role: 'user',
        content,
      },
    ],
    //   model: 'llama3-8b-8192',
    model: 'llama3-70b-8192',
    temperature: 0.1,
    max_retries: 1,
    response_model: { schema, name: 'Schema' },
  })

  console.log(user)

  return user
}

export default run
