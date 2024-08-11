import createWorker from './createWorker.js'

// Create a list of workers that can process a queue of tasks.
export const workerList = [
  'nameGenerator',
  'downloadSubtitles',
  'convertSubtitles',
  'chunkSubtitles',
  'sponsorBlock',
]

// Create a worker for each item in the workers array.
for (const worker of workerList) {
  createWorker(worker)
}

// Do not crash on random 3rd party errors.
process.on('uncaughtException', e => console.error('uncaughtException', err))
