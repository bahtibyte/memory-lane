import dotenv from 'dotenv'; dotenv.config();
import pg from 'pg';

/**
 * Maintains a pool of connections to the database.
 */
export const rds = new pg.Pool({
  user: process.env.NODE_DB_USER,
  password: process.env.NODE_DB_PASSWORD,
  database: process.env.NODE_DB_DATABASE,
  host: process.env.NODE_DB_HOST,
  port: parseInt(process.env.NODE_DB_PORT),
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
