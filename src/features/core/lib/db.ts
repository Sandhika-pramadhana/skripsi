import { Client } from 'pg';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/** POSTGRES */
export async function connectDB() {
  const client = new Client({
    host: process.env.NEXT_DB_HOST || 'localhost',
    port: Number(process.env.NEXT_DB_PORT) || 5432,
    user: process.env.NEXT_DB_USER || 'postgres',
    password: process.env.NEXT_DB_PASSWORD || 'admin123',
    database: process.env.NEXT_DB_NAME || 'mydatabase',
  });

  await client.connect();
  return client;
}

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

export async function connectDB4() {
  const client = new Client({
    host: process.env.NEXT_DB4_HOST || '117.102.70.147',
    port: Number(process.env.NEXT_DB4_PORT) || 9932,
    user: process.env.NEXT_DB4_USER || 'postgres',
    password: process.env.NEXT_DB4_PASSWORD || 'posfin@2024',
    database: process.env.NEXT_DB4_NAME || 'unigo_kuriragregatordb',
  });

  await client.connect();
  return client;
}

export async function connectDB5() {
  const client = new Client({
    host: process.env.NEXT_DB5_HOST || '117.102.70.147',
    port: Number(process.env.NEXT_DB5_PORT) || 9932,
    user: process.env.NEXT_DB5_USER || 'postgres',
    password: process.env.NEXT_DB5_PASSWORD || 'posfin@2024',
    database: process.env.NEXT_DB5_NAME || 'agen_mandiridb',
  });

  await client.connect();
  return client;
}

/** MYSQL */

export async function connectDB6() {
  const connection = await mysql.createConnection({
    host: process.env.NEXT_DB6_HOST || '117.102.70.148',
    port: Number(process.env.NEXT_DB6_PORT) || 3306,
    user: process.env.NEXT_DB6_USER || 'root',
    password: process.env.NEXT_DB6_PASSWORD || 'jamuJu',
    database: process.env.NEXT_DB6_NAME || 'sapfico',
  });

  return connection;
}

export async function connectDB7() {
  const connection = await mysql.createConnection({
    host: process.env.NEXT_DB7_HOST || '147.139.203.249',
    port: Number(process.env.NEXT_DB7_PORT) || 3306,
    user: process.env.NEXT_DB7_USER || 'tribuana',
    password: process.env.NEXT_DB7_PASSWORD || 'kuc1ngg4r0ng',
    database: process.env.NEXT_DB7_NAME || 'posfin_ppob',
  });

  return connection;
}

export async function connectDB8() {
  const connection = await mysql.createConnection({
    host: process.env.NEXT_DB8_HOST || '117.102.70.148',
    port: Number(process.env.NEXT_DB8_PORT) || 3306,
    user: process.env.NEXT_DB8_USER || 'dss',
    password: process.env.NEXT_DB8_PASSWORD || 'jamuJu',
    database: process.env.NEXT_DB8_NAME || 'agen_posfin',
  });

  return connection;
}
