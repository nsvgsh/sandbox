import { Pool, PoolClient } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error(
    'Missing DATABASE_URL. For local dev, run "npm run setup:env" inside web/ to create .env.local (or set DATABASE_URL manually).'
  )
}
export const pgPool = new Pool({ connectionString, max: 10 })

export async function withClient<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pgPool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
