import getOpenrouterClient from './client/openrouter.js'
import { jsonrepair } from 'jsonrepair'

/**
 * Ingests a string of data which needs to be converted to an array of JSON objects.
 * @param {Object} job - The job object containing the data to be processed.
 * @param {Object} job.data - The data object containing the input text and JSON array keys.
 * @param {string} job.data.inputText - The text to be converted to JSON.
 * @param {string} job.data.jsonArrayKeys - Description of keys for each JSON object in the array.
 * @returns {Object|Array} The repaired JSON object or an array of JSON objects.
 * @throws {Error} Throws an error if there is an issue with the main function.
 */

const main = async job => {
  try {
    const { inputText, jsonArrayKeys } = job.data

    const openrouter = await getOpenrouterClient()

    console.time('chatCompletion')

    const chatCompletion = await openrouter.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'reply only with valid JSON, do not write any other text before',
        },
        {
          role: 'user',
          content: inputText,
        },
        {
          role: 'assistant',
          content: [
            'Sure I can rewrite your text as JSON array of objects where each has keys: ',
            jsonArrayKeys + '. Here is the JSON: ```json\n[',
          ].join(''),
        },
      ],
      // model: 'microsoft/phi-3-mini-128k-instruct:free',
      // model: 'mistralai/mistral-7b-instruct:free',
      // model: 'google/gemma-2-9b-it:free',
      model: 'qwen/qwen-2-7b-instruct:free',
      temperature: 0,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
      stop: ['```', ']'],
    })

    console.timeEnd('chatCompletion')

    const jsonResponse = chatCompletion.choices[0]?.message?.content || ''

    const jsonResponseWithBrackets = '[' + jsonResponse + ']'

    console.log('jsonResponseWithBrackets:', jsonResponseWithBrackets)

    let repairedJson

    try {
      repairedJson = JSON.parse(jsonrepair(jsonResponseWithBrackets))
    } catch (err) {
      repairedJson = { failed: true, raw: jsonResponse, error: err.message }
    }

    return repairedJson
  } catch (error) {
    console.error('Error in main:', error)
    throw error
  }
}

export default main
