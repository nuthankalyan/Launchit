import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({
  connectionString: config.database.uri,
  ssl: {
    rejectUnauthorized: false
  }
});

export const connectDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to CockroachDB');
    
    // Create tables if they don't exist
    await createTables();
    
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(30) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        avatar VARCHAR(500),
        is_email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);

    // Create launch_pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS launch_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        tagline VARCHAR(500),
        html_content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'generated',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index for faster queries on launch pages
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_launch_pages_user_id ON launch_pages(user_id)
    `);

    console.log('Database tables created/verified successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};
