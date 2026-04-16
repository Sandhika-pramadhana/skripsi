import mysql, { Pool } from "mysql2/promise";

/** Singleton MySQL Connection Pool */
let pool: Pool | null = null;

export function connectDB(): Pool {
  if (!pool) {
    const isDev = process.env.NODE_ENV === "development";

    pool = mysql.createPool({
      host: process.env.NEXT_DB_HOST,
      port: Number(process.env.NEXT_DB_PORT),
      user: process.env.NEXT_DB_USER,
      password: process.env.NEXT_DB_PASSWORD,
      database: process.env.NEXT_DB_NAME,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      ssl: isDev
        ? undefined
        : {
            rejectUnauthorized: false,
          },
    });

    console.log(
      isDev
        ? "✅ Database Connected (LOCAL)"
        : "✅ Database Connected (PRODUCTION)"
    );
  }

  return pool;
}