import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Determines the processor file for a given queue. If a processor file is not provided,
 * it constructs the file path by joining the directory name, the 'processor' directory,
 * the queue name, and the 'index.js' file. If the 'index.js' file does not exist, it
 * constructs the file path without the 'index.js' extension. If a processor file is provided,
 * it returns the provided file path as is.
 *
 * @param {string} queueName The name of the queue
 * @param {string} [processorFile] The path to the processor file (optional)
 * @returns {string} The path to the processor file
 */
const getProcessorFile = (queueName, processorFile) => {
  // If a processor file is not provided
  if (!processorFile) {
    // Construct the file path for the 'index.js' file in the processor directory for the given queue
    const indexFilePath = path.join(
      __dirname,
      'processor',
      queueName,
      'index.js'
    )
    // If the 'index.js' file exists, return the file path
    if (fs.existsSync(indexFilePath)) {
      return indexFilePath
    } else {
      // If the 'index.js' file does not exist, construct the file path without the 'index.js' extension
      return path.join(__dirname, 'processor', queueName + '.js')
    }
  }
  // If a processor file is provided, return the provided file path as is
  return processorFile
}

export default getProcessorFile
