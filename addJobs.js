import downloadSubtitles from './workers/job/downloadSubtitles.js'
import generateName from './workers/job/generateName.js'
// import addToQueue from './workers/queue/addToQueue.js'
import convertSubtitles from './workers/job/convertSubtitles.js'
import chunkSubtitles from './workers/job/chunkSubtitles.js'
import sponsorBlock from './workers/job/sponsorBlock.js'

async function addJobs() {
  // Use first parameter from command line 'bun addJobs.js <youtube-url>'
  const url = process.argv[2]

  // Extract video id part of url
  const videoId = url.split('v=')[1]
  if (!videoId) {
    console.error('Invalid YouTube URL')
    return
  }

  // Block spam
  await sponsorBlock(videoId)

  // Wait for 3 seconds to allow for 3rd party spam list download
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Add job to queue
  await downloadSubtitles(videoId)

  // Add job to queue
  await convertSubtitles(videoId)

  // Chunk subs to different amounts of segments
  for (const divisor of [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44,
    48, 52, 56, 60, 64, 72, 80, 96,
  ]) {
    await chunkSubtitles(videoId, divisor)
  }

  // Add job to queue
  await generateName({ type: 'dog' })
}

await addJobs()

// quit process
process.exit(0)
