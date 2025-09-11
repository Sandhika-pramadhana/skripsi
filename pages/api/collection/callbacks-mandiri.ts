import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB3 } from '@/features/core/lib/db'; 
import { PaginatedAPIResponseBackend, APIResponse, callbacks } from '@/types/def';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAPIResponseBackend<callbacks> | APIResponse<callbacks>>
) {
  authenticateToken(req as AuthenticatedRequest, res, async () => {
    let db: { query: Function; end: Function } | null = null; 

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

      // Get id
      if (id) {
        const searchId = typeof id === 'string' ? id.trim() : String(id);
        if (!searchId) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'Invalid Callback ID. ID cannot be empty.',
            data: null,
          });
        }

        const result = await db.query('SELECT * FROM callback_transactions WHERE id = $1', [searchId]);
        const rows: callbacks[] = result.rows;

        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'Callback not found.',
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'Success get callback by ID.',
          data: rows[0],
        });
      }

      //GET list pagination & search
      const validatedPage = Math.max(parseInt(page as string, 10) || 1, 1);
      const validatedPageSize = Math.min(Math.max(parseInt(page_size as string, 10) || 25, 1), 100);
      const offset = (validatedPage - 1) * validatedPageSize;

      const searchConditions: string[] = [];
      const searchParams: (string | number)[] = []; 

      if (term && typeof term === 'string' && term.trim()) {
        searchParams.push(`%${term.trim()}%`, `%${term.trim()}%`, `%${term.trim()}%`);
        searchConditions.push(
          '(order_id ILIKE $' + (searchParams.length - 2) + 
          ' OR type_name ILIKE $' + (searchParams.length - 1) + 
          ' OR status_name ILIKE $' + searchParams.length + ')'
        );
      }

      if (startDate && endDate) {
        searchParams.push(startDate as string, endDate as string);
        searchConditions.push(
          `DATE(order_date) BETWEEN $${searchParams.length - 1} AND $${searchParams.length}`
        );
      }

      const whereClause = searchConditions.length > 0 ? 'WHERE ' + searchConditions.join(' AND ') : '';

      // Handle limit parameter for client-side pagination
      let dataQuery: string;
      let limitClause = '';
      
      if (limit && typeof limit === 'string' && parseInt(limit, 10) > 0) {
        const limitValue = parseInt(limit, 10);
        limitClause = `LIMIT ${limitValue}`;
        
        dataQuery = `SELECT * FROM callback_transactions ${whereClause} ORDER BY order_date DESC ${limitClause}`;
      } else {
        searchParams.push(validatedPageSize, offset);
        dataQuery = `SELECT * FROM callback_transactions ${whereClause} ORDER BY order_date DESC LIMIT $${searchParams.length-1} OFFSET $${searchParams.length}`;
      }

      const countQuery = `SELECT COUNT(*) AS total_data FROM callback_transactions ${whereClause}`;
      const countResult = await db.query(countQuery, searchParams.slice(0, searchParams.length - (limit ? 0 : 2)));
      const total_data = parseInt(countResult.rows[0].total_data, 10) || 0;

      const dataParams = limit ? searchParams.slice(0, searchParams.length) : searchParams;
      const dataResult = await db.query(dataQuery, dataParams);
      const rows: callbacks[] = dataResult.rows;

      const total_page = Math.max(Math.ceil(total_data / validatedPageSize), 1);

      return res.status(200).json({
        status: true,
        code: '200',
        message: 'Success get callbacks mandiri.',
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

    } catch (error: unknown) { 
      console.error('Error in Callbacks Mandiri handler:', error);
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
