import dotenv from 'dotenv'
dotenv.config()

const isRemoteDb =
  process.env.DATABASE_URL &&
  !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)

const config = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ...(isRemoteDb ? { ssl: { rejectUnauthorized: false } } : {}),
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
}

export default config
