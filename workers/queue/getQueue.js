import { Queue } from 'bullmq'
import createQueue from './createQueue.js'

/**
 * Retrieves a queue instance by its name. If the provided queue name is a string,
 * it creates a new queue instance using the createQueue function. Otherwise,
 * it returns the provided queue instance as is.
 *
 * @param {string|object} queueInput The name of the queue or the queue instance itself
 * @returns {Queue} The queue instance
 */
const getQueue = queueInput => {
  // Check if queueInput is a string
  if (typeof queueInput === 'string') {
    return createQueue(queueInput)
  }

  // Check if queueInput is an instance of Queue
  if (!(queueInput instanceof Queue)) {
    throw new Error('Invalid queue instance')
  }

  // Return the provided queue instance as is
  return queueInput
}

export default getQueue
