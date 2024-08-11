import Groq from 'groq-sdk'
import { jsonrepair } from 'jsonrepair'
import { config } from 'dotenv'
const { parsed } = config({ path: '../../.env' })
import { LRUCache } from 'lru-cache'
const cache = new LRUCache({ max: 100 })

const systemPrompt = [
  '# reply ONLY in JSON format',
  '# segment transcript by topics',
  '# NEVER REPEAT SAME TOPIC',
  '# NEVER USE TIMESTAMPS NOT PRESENT IN THE TRANSCRIPT',
  '# KEEP ALL TOPICS UNIQUE',
  '# each topic title SHOULD BE as concise as possible',
  '# each topic segment duration SHOULD BE as long as possible',
  'NEVER ADD ANY text outside of JSON',
  'example:',
  '```json\n[{time:34,topic:"Introduction of A"},{time:622,topic:"Discussion on B"}]\n```',
]

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || parsed.GROQ_API_KEY,
})

console.log(process.env.GROQ_API_KEY, parsed.GROQ_API_KEY)

const ragTitleSegmentation = async props => {
  const { transcript } = props

  // Check if the result is already in the cache
  const cacheKey = JSON.stringify(transcript)
  const cachedResult = cache.get(cacheKey)
  if (cachedResult) {
    return cachedResult
  }

  const userPrompt = [
    'DO NOT USE ALL TIMESTAMPS; LIMIT YOUR REPLY TO BELOW 20 SEGMENTS',
    'SELECT MOST IMPORTANT TIMESTAMPS FIRST, THEN ADD a short title of the most important topic up to next timestamp',
    'reply with JSON segmentation of topics for this (integer timestamp in seconds prefixed) transcript:',
    transcript,
    // '# USE ONLY SECONDS OFFSET TIMESTAMPS PRESENT IN THE TRANSCRIPT, RETURN THEM UNCHANGED EXACTLY AS THEY APPEAR in INTEGER FORMAT for your segmentation topic placing points',
    // '# RESPOND WITH MAXIMUM OF 20 OBJECTS in JSON ARRAY',
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
    // model: 'mixtral-8x7b-32768',  // do not use, only 5000 per minute token limit
    model: 'llama-3.1-8b-instant', // max tokens per req 8000
    // model: 'llama-3.1-70b-versatile',
    temperature: 0.01,
    max_tokens: 8000,
    top_p: 1,
    stream: true,
    stop: null,
  })

  let result = ''

  for await (const chunk of chatCompletion) {
    // console.log(chunk.choices[0]?.delta?.content || '')
    // stream to console with no newlines
    process.stdout.write(chunk.choices[0]?.delta?.content || '')

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

  // Store the result in the cache
  cache.set(cacheKey, result)

  // Return the result
  return result
}

export default ragTitleSegmentation
