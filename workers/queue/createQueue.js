import { Queue } from 'bullmq'
import connection from '../redisConnection.js'

/**
 * Creates a new queue instance with the provided name and the default Redis connection.
 *
 * @param {string} name The name of the queue to be created
 * @returns {object} The newly created queue instance
 */

const createQueue = name => new Queue(name, { connection })

export default createQueue
