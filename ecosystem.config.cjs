module.exports = {
  apps: [
    {
      name: 'main', // Main server running on port 4444
      script: './src/index.js',
    },

    {
      name: 'bullmq', // Dashboard for BullMQ running on port 3000
      script: './bullmqDashboard.cjs',
    },

    {
      name: 'worker', // Worker for BullMQ
      script: './workers/index.js', // Path to worker entry point
      instances: 'max', // Use all cpus
      exec_mode: 'cluster', // Run in cluster mode for parallel processing
    },
  ],
}
