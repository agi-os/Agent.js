import Groq from 'groq-sdk'
import { jsonrepair } from 'jsonrepair'

import { config } from 'dotenv'
const { parsed } = config({ path: '../../.env' })

const systemPrompt = [
  '# reply ONLY in JSON format',
  '# segment transcript by topics',
  '# NEVER REPEAT SAME TOPIC in sequence',
  '# each topic title should be as concise as possible',
  'NEVER ADD ANY text outside of JSON',
  'example:',
  '```json\n[{time:0,topic:"one"},{time:20,topic:"two"}]\n```',
  'topics are segments of the content by topics, time is second offset from 0 start',
  'NEVER repeat the same topic',
]

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || parsed.GROQ_API_KEY,
})

const ragTitleSegmentation = async props => {
  const { transcript } = props

  const userPrompt = [
    'reply with JSON segmentation of topics by second offsets for this transcript:',
    transcript,
  ]

  console.log({ userPrompt })

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemPrompt.join('\n\n'),
      },
      {
        role: 'user',
        content: userPrompt.join('\n\n'),
      },
    ],
    model: 'llama-3.1-70b-versatile',
    temperature: 0.01,
    max_tokens: 8000,
    top_p: 1,
    stream: true,
    stop: null,
  })

  let result = ''

  for await (const chunk of chatCompletion) {
    console.log(chunk.choices[0]?.delta?.content || '')

    result += chunk.choices[0]?.delta?.content || ''
  }

  // Trim the markdown json wrapper
  result = result.replace(/```json\n/, '').replace(/\n```$/, '')

  // Try to JSON parse, else return a string
  try {
    result = jsonrepair(result)
    result = JSON.parse(result)
  } catch (_) {
    // ignore
  }

  return result
}

export default ragTitleSegmentation
