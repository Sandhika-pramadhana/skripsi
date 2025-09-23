import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB3 } from '@/features/core/lib/db';
import { PaginatedAPIResponseBackend, APIResponse, callback_registrations } from '@/types/def';
import { authenticateToken, AuthenticatedRequest } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    PaginatedAPIResponseBackend<callback_registrations> | APIResponse<callback_registrations>
  >
) {
  authenticateToken(req as AuthenticatedRequest, res, async () => {
    let db: any = null;

    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          status: false,
          code: '405',
          message: 'Method not allowed',
          data: null,
        });
      }

      db = await connectDB3();
      const { id, term, startDate, endDate, page, page_size, limit } = req.query;

      // ✅ GET by ID
      if (id) {
        const searchId = typeof id === 'string' ? id.trim() : String(id);
        if (!searchId) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'Invalid Registration ID. ID cannot be empty.',
            data: null,
          });
        }

        const result = await db.query('SELECT * FROM callback_registrations WHERE id = $1', [searchId]);
        const rows: callback_registrations[] = result.rows;

        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'Registration not found.',
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'Success get registration by ID.',
          data: rows[0],
        });
      }

      // ✅ GET list with pagination & search
      const validatedPage = Math.max(parseInt(page as string, 10) || 1, 1);
      const validatedPageSize = Math.min(Math.max(parseInt(page_size as string, 10) || 25, 1), 100);
      const offset = (validatedPage - 1) * validatedPageSize;

      let searchConditions: string[] = [];
      let searchParams: any[] = [];

      if (term && typeof term === 'string' && term.trim()) {
        searchParams.push(`%${term.trim()}%`, `%${term.trim()}%`);
        searchConditions.push('(username ILIKE $' + (searchParams.length - 1) + ' OR status_message ILIKE $' + searchParams.length + ')');
      }

      if (startDate && endDate) {
        searchParams.push(startDate, endDate);
        searchConditions.push(`DATE(created_at) BETWEEN $${searchParams.length - 1} AND $${searchParams.length}`);
      }

      const whereClause = searchConditions.length > 0 ? 'WHERE ' + searchConditions.join(' AND ') : '';

      // Handle limit parameter for client-side pagination
      let dataQuery: string;
      let limitClause = '';
      if (limit && typeof limit === 'string' && parseInt(limit, 10) > 0) {
        const limitValue = parseInt(limit, 10);
        limitClause = `LIMIT ${limitValue}`;
        dataQuery = `SELECT * FROM callback_registrations ${whereClause} ORDER BY created_at DESC ${limitClause}`;
      } else {
        searchParams.push(validatedPageSize, offset);
        dataQuery = `SELECT * FROM callback_registrations ${whereClause} ORDER BY created_at DESC LIMIT $${searchParams.length - 1} OFFSET $${searchParams.length}`;
      }

      // Total count query
      const countQuery = `SELECT COUNT(*) AS total_data FROM callback_registrations ${whereClause}`;
      const countResult = await db.query(countQuery, searchParams.slice(0, searchParams.length - (limit ? 0 : 2)));
      const total_data = parseInt(countResult.rows[0].total_data, 10) || 0;

      // Execute data query
      const dataParams = limit ? searchParams.slice(0, searchParams.length) : searchParams;
      const dataResult = await db.query(dataQuery, dataParams);
      const rows: callback_registrations[] = dataResult.rows;
      const total_page = Math.max(Math.ceil(total_data / validatedPageSize), 1);

      return res.status(200).json({
        status: true,
        code: '200',
        message: 'Success get registrations.',
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
      console.error('Error in callback Registrations handler:', error);
      return res.status(500).json({
        status: false,
        code: '500',
        message: 'Internal server error',
        data: null,
      });
    } finally {
      if (db) {
        await db.end();
      }
    }
  });
}
