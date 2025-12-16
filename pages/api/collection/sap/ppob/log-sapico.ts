import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB7 } from '@/features/core/lib/db';
import { PaginatedAPIResponseBackend, APIResponse, log_sapico } from '@/types/def';
import { authenticateToken, AuthenticatedRequest } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    PaginatedAPIResponseBackend<log_sapico> | APIResponse<log_sapico>
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

      db = await connectDB7();
      const { id, term, startDate, endDate, page, page_size, limit } = req.query;

      //  GET BY ID 
      if (id) {
        const searchId = typeof id === 'string' ? id.trim() : String(id);
        const [rows] = await db.query('SELECT * FROM log_sapico_deposit WHERE id = ?', [searchId]);

        if (!rows || rows.length === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'Log Sapico not found.',
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'Success get log sapico by ID.',
          data: rows[0],
        });
      }

  
      const validatedPage = Math.max(parseInt(page as string, 10) || 1, 1);
      const validatedPageSize = Math.min(
        Math.max(parseInt(page_size as string, 10) || 25, 1),
        100
      );
      const offset = (validatedPage - 1) * validatedPageSize;

      const searchConditions: string[] = [];
      const searchParams: any[] = [];

      if (term && typeof term === 'string' && term.trim()) {
        searchConditions.push('(nama_file LIKE ? OR response LIKE ? OR url LIKE ?)');
        const searchTerm = `%${term.trim()}%`;
        searchParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (startDate && endDate) {
        searchConditions.push('DATE(tanggal) BETWEEN ? AND ?');
        searchParams.push(startDate, endDate);
      }

      const whereClause = searchConditions.length > 0 ? 'WHERE ' + searchConditions.join(' AND ') : '';
      const countQuery = `SELECT COUNT(*) AS total_data FROM log_sapico_deposit ${whereClause}`;
      const [countRows] = await db.query(countQuery, searchParams);
      const total_data = parseInt(countRows[0].total_data, 10) || 0;  // ✅ Simple parse

      // DATA QUERY
      let dataQuery = '';
      const dataParams: any[] = [...searchParams];

      const parsedLimit = limit ? parseInt(limit as string, 10) : 0;
      const safeLimit = parsedLimit && parsedLimit > 0 ? Math.min(parsedLimit, 1000) : 0;

      if (safeLimit > 0) {
        dataQuery = `SELECT * FROM log_sapico_deposit ${whereClause} ORDER BY tanggal DESC LIMIT ?`;
        dataParams.push(safeLimit);
      } else {
        dataQuery = `SELECT * FROM log_sapico_deposit ${whereClause} ORDER BY tanggal DESC LIMIT ? OFFSET ?`;
        dataParams.push(validatedPageSize, offset);
      }

      const [dataRows] = await db.query(dataQuery, dataParams);

      const total_page = Math.max(Math.ceil(total_data / validatedPageSize), 1);

      return res.status(200).json({
        status: true,
        code: '200',
        message: 'Success get log_sapico_deposit.',
        data: {
          items: dataRows,
          pagination: {
            page: validatedPage,
            page_size: validatedPageSize,
            total_page,
            total_data,
            current_page: dataRows.length > 0 ? validatedPage : 0,
            current_data: dataRows.length,
          },
        },
      });
    } catch (error: any) {
      console.error('Error in log_sapico_deposit handler:', error);
      return res.status(500).json({
        status: false,
        code: '500',
        message: `Internal server error: ${error.message}`,
        data: null,
      });
    } finally {
      if (db) {
        await db.end(); 
      }
    }
  });
}
