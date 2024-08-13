// Import required modules and libraries
const { createBullBoard } = require('@bull-board/api') // Import createBullBoard function from @bull-board/api
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter') // Import BullMQAdapter class from @bull-board/api/bullMQAdapter
const { FastifyAdapter } = require('@bull-board/fastify') // Import FastifyAdapter class from @bull-board/fastify
const fastify = require('fastify') // Import fastify library

// Define an asynchronous function to run the application
const run = async () => {
  // Create a new fastify instance
  const app = fastify()

  // Create a new FastifyAdapter instance
  const serverAdapter = new FastifyAdapter()

  // Import the workerList from the workers dir
  const workerList = (await import('./workers/workerList.js')).default

  // Import the default export from the workers/queue/getQueue.js file
  const getQueue = (await import('./workers/queue/getQueue.js')).default

  // Create a new BullMQAdapter instance for each worker in the workerList and store them in the queues array
  const queues = workerList.map(worker => new BullMQAdapter(getQueue(worker)))

  // Create a new Bull Board instance with the queues and serverAdapter
  createBullBoard({ queues, serverAdapter })

  // Set the base path for the serverAdapter to '/'
  serverAdapter.setBasePath('/')

  // Register the serverAdapter plugin with the fastify instance and set the prefix to '/'
  app.register(serverAdapter.registerPlugin(), { prefix: '/' })

  // // A route to add a new job to the exampleBullMq queue
  // app.get('/add', (req, reply) => {
  //   const opts = req.query.opts || {};

  //   // If the delay query parameter is present, convert it to a number and multiply by 1000 to get the delay in milliseconds
  //   if (opts.delay) {
  //     opts.delay = +opts.delay * 1000; // delay must be a number
  //   }

  //   // Add a new job to the exampleBullMq queue with the title from the query parameter and the options object
  //   exampleBullMq.add('Add', { title: req.query.title }, opts);

  //   // Send a response to the client indicating that the job was added successfully
  //   reply.send({
  //     ok: true,
  //   });
  // });

  // Start the fastify instance listening on port 3000
  await app.listen({ port: 3000 })

  // Log a message to the console indicating that the BullMQ UI is available at http://localhost:3000
  console.log('For BullMQ UI, open http://localhost:3000')
}

// Call the run function and handle any errors that occur
run().catch(e => {
  console.error(e)
  process.exit(1)
})

// Handle any uncaught exceptions that occur and log them to the console
process.on('uncaughtException', err => console.error('uncaughtException', err))
