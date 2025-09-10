import mysql from 'mysql2/promise';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// DB 1 (MySQL)
export async function connectDB() {
  const connection = await mysql.createConnection({
    host: process.env.NEXT_DB_HOST || 'localhost',
    port: Number(process.env.NEXT_DB_PORT) || 3306,
    user: process.env.NEXT_DB_USER || 'root',
    password: process.env.NEXT_DB_PASSWORD || 'root',
    database: process.env.NEXT_DB_NAME || 'dashboard-posfin',
  });

  return connection;
}

// DB 2 (PostgreSQL)
export async function connectDB2() {
  const client = new Client({
    host: process.env.NEXT_DB2_HOST || '8.215.77.122',
    port: Number(process.env.NEXT_DB2_PORT) || 5432,
    user: process.env.NEXT_DB2_USER || 'postgres',
    password: process.env.NEXT_DB2_PASSWORD || 'posfin@2024',
    database: process.env.NEXT_DB2_NAME || 'unigo_kuriragregatordb',
  });

  await client.connect();
  return client;
}

export async function connectDB3() {
  const client = new Client({
    host: process.env.NEXT_DB3_HOST || '8.215.77.122',
    port: Number(process.env.NEXT_DB3_PORT) || 5432,
    user: process.env.NEXT_DB3_USER || 'postgres',
    password: process.env.NEXT_DB3_PASSWORD || 'posfin@2024',
    database: process.env.NEXT_DB3_NAME || 'agen_mandiridb',
  });

  await client.connect();
  return client;
}

