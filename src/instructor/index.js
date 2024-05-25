import { config } from 'dotenv'
const { parsed } = config()

import Instructor from '@instructor-ai/instructor'
import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || parsed.GROQ_API_KEY,
})

export const client = Instructor({
  client: groq,
  mode: 'TOOLS',
  debug: true,
})

const instructor = async ({
  system = null,
  content,
  temperature = 1,
  max_retries = 0,
  zodSchema,
  model = 'llama3-70b-8192',
}) => {
  try {
    let messages = []

    if (system) {
      messages.push({
        role: 'system',
        content: system,
      })
    }

    messages.push({
      role: 'user',
      content,
    })

    const response = await client.chat.completions.create({
      messages,
      model,
      temperature,
      max_retries,
      response_model: {
        schema: zodSchema,
        name: 'Schema',
      },
    })

    return response
  } catch (error) {
    console.error(error)
    return { error: error.message }
  }
}

export default instructor
