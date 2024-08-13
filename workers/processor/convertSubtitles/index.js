import { promises as fsPromises } from 'fs'
import path from 'path'
import converter from './converter.js'
import { getFromPg } from './pg.js'

/**
 * Main function to process a job.
 *
 * This function takes a job object as input, which should contain a `data` property
 * with a `videoId` property. It then checks for the existence of the subtitle file
 * for the given videoId. If the file exists, it returns the file path. If not, it
 * uses yt-dlp to download the subtitle file and then returns the file path.
 *
 * @param {Object} job - The job object containing the videoId.
 * @returns {Object} An object containing a `cached` boolean and a `filePath` string.
 * @throws {Error} Throws an error if videoId is not provided, if there's an error
 * executing the command, or if the subtitle file is not found.
 */
const main = async job => {
  try {
    const { videoId } = job.data

    // Sanity check for videoId
    if (!videoId) {
      throw new Error('videoId is required')
    }

    // Define the working directory
    const workingDir = `/tmp/agentjs/${videoId}`

    // Read the files
    const files = await fsPromises.readdir(workingDir)

    // Try to find the subtitle file
    const subtitleFile = files.find(file => file.endsWith('.json3'))

    // If no subtitle file is found, throw an error
    if (!subtitleFile) {
      throw new Error('Subtitle file not found')
    }

    // Construct the file path of the subtitle file
    const filePath = path.join(workingDir, subtitleFile)

    // Load the JSON file
    const jsonData = JSON.parse(await fsPromises.readFile(filePath, 'utf8'))

    // Convert the JSON data to a subtitle format
    const subtitleData = converter(jsonData)

    let removedSpam = false

    // If we have spam ranges, use them to remove the spam from the subtitle data

    // Fetch spam ranges from database
    const pgGetRe = await getFromPg(videoId)
    console.log({ pgGetRe })

    // If the data is already in the database, return it
    if (pgGetRe) {
      const spamData = pgGetRe

      // Replace the time ranges containing spam with blank strings
      for (const spam of spamData) {
        // Expand the time slot by 1 second before the spam timestamp to skip lead in
        const start = Math.max(0, spam.start - 1)
        const end = spam.end

        // Iterate over the subtitle data, each index is the seconds offset from start
        for (let i = start; i <= end; i++) {
          // If the index exists in the subtitle data, replace it with a blank string
          if (subtitleData[i]) {
            subtitleData[i] = ''
          }
        }
      }

      // Set the removedSpam flag to true
      removedSpam = true
    }

    // Save the subtitle data to a JSON output file
    const outputFilePath = path.join(workingDir, 'array.json')
    await fsPromises.writeFile(
      outputFilePath,
      JSON.stringify(subtitleData, null, 2)
    )

    // Return the file path of the subtitle file
    return { path: outputFilePath, removedSpam }
  } catch (error) {
    console.error('Error executing command:', error)
    throw error
  }
}

export default main
