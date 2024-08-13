import downloadSubtitles from './workers/job/downloadSubtitles.js'
import convertSubtitles from './workers/job/convertSubtitles.js'
import chunkSubtitles from './workers/job/chunkSubtitles.js'
import sponsorBlock from './workers/job/sponsorBlock.js'
import extractVideoId from './extractVideoId.js'

async function main(param) {
  const videoId = extractVideoId(param)

  if (!videoId) {
    console.error('Invalid YouTube URL')
    return
  }

  // Block spam
  await sponsorBlock(videoId)

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

  // await generateName({ type: 'dog' })
}

// Pass in the video id or url as the first argument
await main(process.argv[2])

// quit process
process.exit(0)
