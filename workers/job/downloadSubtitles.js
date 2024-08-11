import addToQueue from '../queue/addToQueue.js'

const main = async videoId => {
  // Sanity check
  if (!videoId) {
    throw new Error('videoId is required')
  }

  // Prepare the job payload
  const payload = {
    videoId,
    useCache: true,
  }

  // Add job to queue
  return addToQueue('downloadSubtitles', payload)
}

export default main
