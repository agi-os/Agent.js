import getQueue from '../queue/getQueue.js'
import { jobConfig } from '../queue/addToQueue.js'

const main = async (videoId, chunkCount) => {
  // Sanity check
  if (!videoId) {
    throw new Error('videoId is required')
  }
  if (!chunkCount || !Number.isInteger(chunkCount) || chunkCount <= 0) {
    throw new Error('chunkCount must be a positive integer')
  }

  // Prepare the job payload
  const payload = {
    videoId,
    chunkCount,
  }

  // Add job to queue
  return getQueue('chunkSubtitles').add(
    'chunkSubtitles.' + chunkCount,
    payload,
    jobConfig
  )
}

export default main
