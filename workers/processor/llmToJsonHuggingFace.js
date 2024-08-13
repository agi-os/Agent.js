import { jsonrepair } from 'jsonrepair'
import getClient from './client/huggingFace.js'

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

    console.time('HF client')
    const client = await getClient()
    console.timeEnd('HF client')

    console.time('HF client.predict')

    const chatCompletion = await client.predict('/chat', {
      //   model: we don't specify one, just use whatever is baked in out of the box
      message:
        'rewrite provided DATA as JSON array of objects, each object has keys: ' +
        jsonArrayKeys +
        '\n\nDATA:\n' +
        inputText,
      system_message:
        'reply only with valid JSON array of objects, do not write any other text before, start reply with [',
      max_tokens: 1000,
      temperature: 0.1,
      top_p: 0.1,
    })
    console.timeEnd('HF client.predict')

    console.log('chatCompletion:', chatCompletion)

    const jsonResponse = chatCompletion?.data?.[0] || ''

    console.log({ jsonResponse })

    let repairedJson

    // Attempt to convert the response to valid JSON
    try {
      repairedJson = JSON.parse(jsonrepair(jsonResponse))
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
