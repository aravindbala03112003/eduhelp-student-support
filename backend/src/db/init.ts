import fs from 'fs';
import path from 'path';
import { pool } from '../config/db.js';

async function initDB() {
  console.log('Connecting to PostgreSQL and applying schema...');
  const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schemaSql);
    console.log('Database schema successfully initialized with tables and indexes!');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDB();
