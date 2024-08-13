import createWorker from './createWorker.js'
import workerList from './workerList.js'

// Create a worker for each item in the workers array.
for (const worker of workerList) {
  createWorker(worker)
}

// Do not crash on random 3rd party errors.
process.on('uncaughtException', e => console.error('uncaughtException', err))
