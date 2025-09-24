import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB4 } from '@/features/core/lib/db'; 
import { PaginatedAPIResponseBackend, APIResponse, LogApis } from '@/types/def';
import { authenticateToken, AuthenticatedRequest } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAPIResponseBackend<LogApis> | APIResponse<LogApis>>
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

      db = await connectDB4();
      const { id, term, startDate, endDate, page, page_size } = req.query;

      //GET ID
      if (id) {
        const searchId = typeof id === 'string' ? id.trim() : String(id);
        if (!searchId) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'Invalid Log API ID. ID cannot be empty.',
            data: null,
          });
        }

        const result = await db.query('SELECT * FROM log_apis WHERE id = $1', [searchId]);
        const rows: LogApis[] = result.rows;

        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'Log API not found.',
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'Success get log API by ID.',
          data: rows[0],
        });
      }

      //GET list pagination & search
      const validatedPage = Math.max(parseInt(page as string, 10) || 1, 1);
      const validatedPageSize = Math.min(Math.max(parseInt(page_size as string, 10) || 25, 1), 100);
      const offset = (validatedPage - 1) * validatedPageSize;

      let searchConditions: string[] = [];
      let searchParams: any[] = [];

      if (term && typeof term === 'string' && term.trim()) {
        searchParams.push(`%${term.trim()}%`, `%${term.trim()}%`, `%${term.trim()}%`);
        searchConditions.push('(process_name ILIKE $' + (searchParams.length - 2) + 
                              ' OR third_party_name ILIKE $' + (searchParams.length - 1) + 
                              ' OR description ILIKE $' + searchParams.length + ')');
      }

      if (startDate && endDate) {
        searchParams.push(startDate, endDate);
        searchConditions.push(`DATE(request_date) BETWEEN $${searchParams.length - 1} AND $${searchParams.length}`);
      }

      const whereClause = searchConditions.length > 0 ? 'WHERE ' + searchConditions.join(' AND ') : '';

      // total count
      const countQuery = `SELECT COUNT(*) AS total_data FROM log_apis ${whereClause}`;
      const countResult = await db.query(countQuery, searchParams);
      const total_data = parseInt(countResult.rows[0].total_data, 10) || 0;

      // paginated data
      searchParams.push(validatedPageSize, offset); // last two params
      const dataQuery = `SELECT * FROM log_apis ${whereClause} ORDER BY request_date ASC LIMIT $${searchParams.length-1} OFFSET $${searchParams.length}`;
      const dataResult = await db.query(dataQuery, searchParams);
      const rows: LogApis[] = dataResult.rows;

      const total_page = Math.max(Math.ceil(total_data / validatedPageSize), 1);

      return res.status(200).json({
        status: true,
        code: '200',
        message: 'Success get log APIs.',
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
      console.error('Error in Log APIs handler:', error);
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
