import { Pool, PoolClient, type PoolConfig } from 'pg'
import type { ConnectionOptions } from 'tls'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error(
    'Missing DATABASE_URL. For local dev, run "npm run setup:env" inside web/ to create .env.local (or set DATABASE_URL manually).'
  )
}

const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)
const poolConfig: PoolConfig = {
  connectionString,
  max: 10,
  ssl: isLocal ? undefined : ({ rejectUnauthorized: false } as ConnectionOptions),
}

export const pgPool = new Pool(poolConfig as PoolConfig)

export async function withClient<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pgPool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
