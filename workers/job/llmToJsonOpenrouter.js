import addToQueue from '../queue/addToQueue.js'

const main = async ({ inputText, jsonArrayKeys }) => {
  // Sanity check
  if (!inputText) {
    throw new Error('inputText to be transformed is required')
  }

  if (!jsonArrayKeys) {
    throw new Error('jsonArrayKeys description is required')
  }

  // Prepare the job payload
  const payload = {
    inputText,
    jsonArrayKeys,
  }

  // Add job to queue
  return addToQueue('llmToJsonOpenrouter', payload)
}

export default main
