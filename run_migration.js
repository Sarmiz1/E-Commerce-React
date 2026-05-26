import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const { Client } = pg;

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Error: Please provide a direct Postgres DATABASE_URL in your .env file to run this migration.');
    console.error('The Supabase Service Role Key cannot execute raw DDL queries (ALTER TABLE) via the JS client.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();

    const sqlFilePath = path.join(process.cwd(), 'cents_to_minor_migration.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Applying migration...');
    await client.query(sql);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
