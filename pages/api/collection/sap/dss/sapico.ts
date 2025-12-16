import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB6 } from '@/features/core/lib/db'; 
import { PaginatedAPIResponseBackend, APIResponse, sapico } from '@/types/def';
import { authenticateToken, AuthenticatedRequest } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAPIResponseBackend<sapico> | APIResponse<sapico>>
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

      db = await connectDB6();
      const { id, term, startDate, endDate, page, page_size, limit } = req.query;

      // By ID
      if (id) {
        const searchId = typeof id === 'string' ? id.trim() : String(id);
        const [rows] = await db.query('SELECT * FROM sapico_temp WHERE id = ?', [searchId]);
        
        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'Sapico not found.',
            data: null,
          });
        }
        
        return res.status(200).json({
          status: true,
          code: '200',
          message: 'Success get sapico by ID.',
          data: rows[0],
        });
      }

      // Pagination
      const validatedPage = Math.max(parseInt(page as string, 10) || 1, 1);
      const validatedPageSize = Math.min(Math.max(parseInt(page_size as string, 10) || 25, 1), 100);
      const offset = (validatedPage - 1) * validatedPageSize;

      let searchConditions: string[] = [];
      let searchParams: any[] = [];

      // FIXED: Search term
      if (term && typeof term === 'string' && term.trim()) {
        searchConditions.push('(id_number LIKE ? OR coa LIKE ? OR sgtxt LIKE ? OR no_doc LIKE ?)');
        const searchTerm = `%${term.trim()}%`;
        searchParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // FIXED: Date range
      if (startDate && endDate) {
        searchConditions.push('DATE(tgl_trx) BETWEEN ? AND ?');
        searchParams.push(startDate, endDate);
      }

      const whereClause = searchConditions.length > 0 ? 'WHERE ' + searchConditions.join(' AND ') : '';

      // Limit? (Client Pagination)
      let dataQuery = '';
      let dataParams = [...searchParams];
      
      if (limit && parseInt(limit as string, 10) > 0) {
        dataQuery = `SELECT * FROM sapico_temp ${whereClause} ORDER BY tgl_trx DESC LIMIT ${parseInt(limit as string, 10)}`;
      } else {
        dataQuery = `SELECT * FROM sapico_temp ${whereClause} ORDER BY tgl_trx DESC LIMIT ? OFFSET ?`;
        dataParams.push(validatedPageSize, offset);
      }

      // Total count
      const countQuery = `SELECT COUNT(*) AS total_data FROM sapico_temp ${whereClause}`;
      const [countRows] = await db.query(countQuery, searchParams);
      const total_data = countRows[0].total_data;

      const [dataRows] = await db.query(dataQuery, dataParams);
      const total_page = Math.max(Math.ceil(total_data / validatedPageSize), 1);

      return res.status(200).json({
        status: true,
        code: '200',
        message: 'Success get sapico_temp.',
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
    } catch (error) {
      console.error('Error in sapico_temp handler:', error);
      return res.status(500).json({
        status: false,
        code: '500',
        message: 'Internal server error',
        data: null,
      });
    } finally {
      if (db) {
        db.end();
      }
    }
  });
}