import { Worker } from 'bullmq'
import workerConfig from './workerConfig.js'
import getQueue from './queue/getQueue.js'
import getProcessorFile from './getProcessorFile.js'

/**
 * Creates a new worker instance for the given queue name and processor file.
 *
 * @param {string} queueName The name of the queue
 * @param {string} processorFile The path to the processor file
 * @returns {object} The worker instance
 */
const createWorkerInstance = (queueName, processorFile) =>
  new Worker(queueName, processorFile, workerConfig)

// Event handler functions
const onActiveHandler = job =>
  console.log('[Worker] active', {
    queue: job.queue.name,
    jobId: job.id,
    data: job.data,
  })

const onProgressHandler = (job, progress) =>
  console.log('[Worker] progress', {
    queue: job.queue.name,
    jobId: job.id,
    progress,
  })

const onCompletedHandler = job =>
  console.log('[Worker] completed', {
    queue: job.queue.name,
    jobId: job.id,
    returnValue: job.returnvalue,
  })

const onFailedHandler = (job, err) =>
  console.error('[Worker] failed', {
    queue: job.queue.name,
    jobId: job.id,
    err,
  })

/**
 * Creates a new worker instance for the given queue and processor file.
 * The worker is configured with the provided configuration and is set up
 * with event handlers for 'active', 'progress', 'completed', and 'failed' events.
 *
 * @param {string|object} queue The name of the queue or the queue instance itself
 * @param {string} [processorFile] The path to the processor file (optional)
 * @returns {object} The worker instance
 */
const createWorker = (queue, processorFile) => {
  const queueInstance = getQueue(queue)
  const processorFilePath = getProcessorFile(queueInstance.name, processorFile)
  const worker = createWorkerInstance(queueInstance.name, processorFilePath)

  worker.on('active', onActiveHandler)
  worker.on('progress', onProgressHandler)
  worker.on('completed', onCompletedHandler)
  worker.on('failed', onFailedHandler)

  return worker
}

export default createWorker
