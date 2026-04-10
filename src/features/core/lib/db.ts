import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();


/** MYSQL */
export async function connectDB() {
  return mysql.createPool({
    host: process.env.NEXT_DB_HOST || '127.0.0.1',
    port: Number(process.env.NEXT_DB_PORT) || 3306,
    user: process.env.NEXT_DB_USER || 'root',
    password: process.env.NEXT_DB_PASSWORD || '',
    database: process.env.NEXT_DB_NAME || 'skripsi',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  });
}

