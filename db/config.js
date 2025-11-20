const { Pool } = require('pg');

// Database configuration
// Use DATABASE_URL if available (for Render), otherwise use individual environment variables
const databaseUrl = process.env.DATABASE_URL;

let poolConfig;

if (databaseUrl) {
  // Parse DATABASE_URL for Render deployment
  const url = new URL(databaseUrl);
  poolConfig = {
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // Use individual environment variables for local development
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'household_workers',
    password: process.env.DB_PASSWORD || 'Jesuslove@12',
    port: process.env.DB_PORT || 5432,
  };
}

const pool = new Pool(poolConfig);

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully!');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};