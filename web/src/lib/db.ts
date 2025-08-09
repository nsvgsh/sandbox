import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!
export const pgPool = new Pool({ connectionString, max: 10 })

export async function withClient<T>(fn: (c: any) => Promise<T>): Promise<T> {
  const client = await pgPool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
