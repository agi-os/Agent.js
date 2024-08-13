import axios from 'axios'
const axiosInstance = axios.create()

import qs from 'qs'
import { promises as fsPromises } from 'fs'
import path from 'path'

import { getFromPg, insertIntoPg } from './pg.js'

import fetchData from './fetchData.js'

// Define the API URL for retrieving skip segments
const API_URL = 'https://sponsor.ajay.app/api/skipSegments'

const main = async job => {
  try {
    const {
      videoId,
      categories = [
        'sponsor',
        'intro',
        'outro',
        'interaction',
        'selfpromo',
        'music_offtopic',
        'preview',
        'filler',
      ],
      actionTypes = ['skip'],
    } = job.data

    // If no video ID is found, throw an error
    if (!videoId) {
      throw new Error('No video ID provided')
    }

    const pgGetRe = await getFromPg(videoId)
    console.log(pgGetRe)

    // If the data is already in the database, return it
    if (pgGetRe) {
      return { dbData: pgGetRe }
    }

    // Define the working directory
    const workingDir = `/tmp/agentjs/${videoId}`

    // Defines the output file path
    const outputFilePath = path.join(workingDir, 'spam.json')

    // Create the working directory if it doesn't exist
    await fsPromises.mkdir(workingDir, { recursive: true })

    // // If the output file already exists, return its path
    // try {
    //   await fsPromises.access(outputFilePath, fsPromises.constants.F_OK)
    //   return { path: outputFilePath }
    // } catch (error) {
    //   // File does not exist, continue with the rest of the function
    // }

    // Construct the API URL with the video hash and query parameters
    const url = `${API_URL}/?${qs.stringify({
      videoID: videoId,
      categories: JSON.stringify(categories),
      actionTypes: JSON.stringify(actionTypes),
    })}`

    // Make a GET request to the API URL with the video ID and categories as query parameters
    const responseData = await fetchData(url)

    // Clean up the unneeded data
    const cleanedSegments = responseData.map(segment => {
      return {
        category: segment.category,
        start: Math.floor(parseFloat(segment.segment[0])),
        end: Math.floor(parseFloat(segment.segment[1])),
      }
    })

    // Write the cleaned segments to the output file
    const writeFileRe = await fsPromises.writeFile(
      outputFilePath,
      JSON.stringify(cleanedSegments, null, 2)
    )

    console.log({ writeFileRe })

    const pgInsertRe = await insertIntoPg({
      videoId,
      categories,
      actionTypes,
      segments: cleanedSegments,
    })

    console.log({ pgInsertRe })

    const result = { path: outputFilePath, writeFileRe, pgInsertRe }
    console.log('Job result:', JSON.stringify(result))
    return result
  } catch (error) {
    console.error('Error in main function:', error)
    throw error
  }
}

export default main
