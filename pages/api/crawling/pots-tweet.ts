import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import { PaginatedAPIResponseBackend, APIResponse } from '@/types/def';

type Tweet = {
  id: string;
  username: string | null;
  text: string;
  created_at: string;
  tweet_url: string | null;
};

let db: mysql.Pool | null = null;

function getDB() {
  if (!db) {
    db = mysql.createPool({
      host: process.env.DB_TWEET_HOST || 'localhost',
      user: process.env.DB_TWEET_USER || 'root',
      password: process.env.DB_TWEET_PASSWORD || 'root',
      database: process.env.DB_TWEET_NAME || 'sentiment_twitter',
    });
  }
  return db;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAPIResponseBackend<Tweet> | APIResponse<Tweet>>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        status: false,
        code: '405',
        message: 'Method not allowed',
        data: null,
      });
    }

    const pool = getDB();
    const { id, term, startDate, endDate, page, page_size, limit } = req.query;

    // GET by ID
    if (id) {
      const searchId = typeof id === 'string' ? id.trim() : String(id);
      if (!searchId) {
        return res.status(400).json({
          status: false,
          code: '400',
          message: 'Invalid Tweet ID. ID cannot be empty.',
          data: null,
        });
      }

      const [rows]: any = await pool.execute(
        'SELECT * FROM tweets WHERE id = ?',
        [searchId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          status: false,
          code: '404',
          message: 'Tweet not found.',
          data: null,
        });
      }

      return res.status(200).json({
        status: true,
        code: '200',
        message: 'Success get tweet by ID.',
        data: rows[0],
      });
    }

    // GET list with pagination & search
    const validatedPage = Math.max(parseInt(page as string, 10) || 1, 1);
    const validatedPageSize = Math.min(Math.max(parseInt(page_size as string, 10) || 25, 1), 100);
    const offset = (validatedPage - 1) * validatedPageSize;

    let searchConditions: string[] = [];
    let searchParams: any[] = [];

    if (term && typeof term === 'string' && term.trim()) {
      searchParams.push(`%${term.trim()}%`, `%${term.trim()}%`, `%${term.trim()}%`);
      searchConditions.push(`(username LIKE ? OR text LIKE ? OR tweet_url LIKE ?)`);
    }

    if (startDate && endDate) {
      searchParams.push(startDate, endDate);
      searchConditions.push(`DATE(created_at) BETWEEN ? AND ?`);
    }

    const whereClause =
      searchConditions.length > 0 ? 'WHERE ' + searchConditions.join(' AND ') : '';

    // Handle limit param
    let dataQuery: string;
    let dataParams: any[];

    if (limit && typeof limit === 'string' && parseInt(limit, 10) > 0) {
      const limitValue = parseInt(limit, 10);
      dataQuery = `SELECT * FROM tweets ${whereClause} ORDER BY created_at DESC LIMIT ?`;
      dataParams = [...searchParams, limitValue];
    } else {
      dataQuery = `SELECT * FROM tweets ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      dataParams = [...searchParams, validatedPageSize, offset];
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as total_data FROM tweets ${whereClause}`;
    const [countResult]: any = await pool.execute(countQuery, searchParams);
    const total_data = parseInt(countResult[0].total_data, 10) || 0;

    // Data query
    const [rows]: any = await pool.execute(dataQuery, dataParams);
    const total_page = Math.max(Math.ceil(total_data / validatedPageSize), 1);

    return res.status(200).json({
      status: true,
      code: '200',
      message: 'Success get tweets.',
      data: {
        items: rows,
        pagination: {
          page: validatedPage,
          page_size: validatedPageSize,
          total_page,
          total_data,
          current_page: rows.length > 0 ? validatedPage : 0,
          current_data: rows.length,
        },
      },
    });

  } catch (error: any) {
    console.error('Error in Tweets handler:', error);
    return res.status(500).json({
      status: false,
      code: '500',
      message: 'Internal server error',
      data: null,
    });
  }
}