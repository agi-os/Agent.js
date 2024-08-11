import { convert } from '../../node_modules/ragtitles/src/index.js'
import { execSync } from 'child_process'
import fs from 'fs'
import { LRUCache } from 'lru-cache'
const cache = new LRUCache({ max: 100 })

/**
 * Retrieves subtitles suitable for RAG use
 * @param {Object} props - The properties of the call
 * @param {string} props.url - YouTube url of the video
 * @returns {string} The search results
 */
const ragTitles = async props => {
  const { url } = props

  // Extract the video ID from the YouTube link
  const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/)?.[1]

  // If no video ID is found, return an empty array
  if (!videoId) {
    console.warn('Invalid YouTube link.')
    return []
  }

  // Check if the result is already in the cache
  const cachedResult = cache.get(videoId)
  if (cachedResult) {
    return cachedResult
  }

  // Download the actual words said in the video
  const command = `yt-dlp --write-auto-subs --sub-format "vtt" --skip-download https://www.youtube.com/watch?v=${videoId}`

  // Run the command to download the subtitles
  execSync(command, { stdio: 'pipe' })

  // Find the downloaded transcript file
  let transcriptFiles = fs
    .readdirSync('./')
    .filter(file => file.endsWith('.en.vtt'))

  // Check if any transcript files were found
  if (transcriptFiles.length === 0) {
    // Try to download the fake-subs as fallback for videos where reality is censored
    const command = `yt-dlp --write-subs --sub-lang "en.*" --sub-format "vtt" --skip-download https://www.youtube.com/watch?v=${videoId}`

    execSync(command, { stdio: 'pipe' })

    // Find the downloaded transcript file
    transcriptFiles = fs.readdirSync('./').filter(file => file.endsWith('.vtt'))
  }

  // Check if any transcript files were found
  if (transcriptFiles.length === 0) {
    console.warn('No transcript files found.')
    // TODO: add whisper to brute force transcribe the mp3 ourselves
    return []
  }

  // Use the first found transcript file
  const fileName = transcriptFiles[0]

  // check if the file name is provided
  if (!fileName) {
    console.warn(
      'Please provide a file name or YouTube link as the first parameter.'
    )
    return []
  }

  try {
    // read the file content
    const fileContent = fs.readFileSync(fileName, 'utf8')

    // convert the file to ragtitles
    const result = await convert(fileContent, url)

    // Delete the transcript file
    fs.unlinkSync(fileName)

    // Store the result in the cache
    cache.set(videoId, result)

    // Return the extracted data
    return result
  } catch (err) {
    console.warn(`Error reading file: ${err.message}`)
    return []
  }
}

export default ragTitles
