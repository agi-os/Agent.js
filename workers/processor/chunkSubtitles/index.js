import fs from 'fs/promises'
import path from 'path'
import splitVideoTranscriptIntoChunks from './splitVideoTranscriptIntoChunks.js'
import processShortChunks from './processShortChunks.js'

/**
 * Ingests an array of second sized subtitle chunks, then splits them into strings of equal time duration.
 * @param {Object} job - The job object containing videoId and chunkCount.
 * @returns {Object} An object containing the chunked subtitles.
 */
const main = async job => {
  try {
    const { videoId, chunkCount } = job.data

    // Read the converted subtitles file
    const subtitlesPath = path.join('/tmp/agentjs', videoId, `array.json`)
    const subtitlesData = await fs.readFile(subtitlesPath, 'utf-8')
    const subtitles = JSON.parse(subtitlesData)

    // Split subtitles into chunks
    const chunks = splitVideoTranscriptIntoChunks(subtitles, chunkCount)

    // Process the short snippets and clean away empty chunks
    const processedChunks = processShortChunks(chunks)

    // Save chunked subtitles
    const chunkedSubtitlesPath = path.join(
      '/tmp/agentjs',
      videoId,
      `chunks.${chunkCount}.json`
    )

    // Write the chunked subtitles to a file
    await fs.writeFile(
      chunkedSubtitlesPath,
      JSON.stringify(processedChunks, null, 2)
    )

    return { path: chunkedSubtitlesPath, chunkCount }
  } catch (error) {
    console.error('Error in main:', error)
    throw error
  }
}

export default main
