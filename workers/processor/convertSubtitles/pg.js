import getClient from '../pgClient.js'

export const getFromPg = async videoId => {
  try {
    // Get the PostgreSQL client
    const client = getClient()

    // Connect to the PostgreSQL database
    await client.connect()

    // Modify the SQL query to select the 'segments' field from the JSON data
    const query = `SELECT data->'segments' as segments FROM public.test WHERE "videoId" = $1`

    // Execute SQL query with the videoId as a parameter to prevent SQL injection
    const result = await client.query(query, [videoId])
    console.log('Query result:', result.rows)

    await client.end()

    // If there are no rows, or rows[0].segments is null, return null
    if (result.rows.length === 0 || !result.rows[0].segments) {
      return null
    }

    return result.rows[0].segments
  } catch (err) {
    console.error('Error connecting or querying PostgreSQL database', err)
    return err
  }
}
