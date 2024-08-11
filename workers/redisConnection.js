import { config } from 'dotenv'
config() // Load environment variables from .env file

// Redis connection options
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
}

export default connection
