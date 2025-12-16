import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB2 } from '@/features/core/lib/db';
import {
  APIResponse,
  PaginatedAPIResponseBackend,
  transaction_mandiri,
  TransactionFee_mandiri,
  TransactionItem_mandiri,
} from '@/types/def';
import { authenticateToken, AuthenticatedRequest } from '../../../middleware/auth';

type TransactionDetailResponse = {
  transaction: transaction_mandiri;
  items: TransactionItem_mandiri[];
  fees: TransactionFee_mandiri | null;
};

interface QueryResult<T> {
  rows: T[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    PaginatedAPIResponseBackend<transaction_mandiri> | APIResponse<TransactionDetailResponse>
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

      db = await connectDB2();
      const { id, term, page, page_size } = req.query;

      // Detail by ID
      if (id) {
        const trx: QueryResult<transaction_mandiri> = await db.query(
          `SELECT
            id,
            user_id,
            location_id,
            transaction_date,
            category_id,
            category_name,
            item_type_id,
            item_type_name,
            product_id,
            product_name,
            estimation,
            payment_type_id,
            payment_type_name,
            connote_code,
            status_id,
            status_name,
            awb_url,
            is_bagging,
            created_at,
            updated_at,
            agent_id,
            account_number,
            posdigi_product_id,
            bill_amount,
            fee_amount,
            ref_id,
            receipt_number,
            connote_id,
            payment_status_id,
            payment_status_name
          FROM transactions
          WHERE id = $1`,
          [id]
        );

        if (trx.rows.length === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'Transaction not found',
            data: null,
          });
        }

        const transaction = trx.rows[0];

        const itemsQuery: QueryResult<TransactionItem_mandiri> = await db.query(
          `SELECT
            id,
            transaction_id,
            weight,
            length,
            width,
            height,
            diameter,
            value,
            description,
            is_insurance,
            created_at,
            updated_at
          FROM transaction_items
          WHERE transaction_id = $1`,
          [id]
        );

        const feesQuery: QueryResult<TransactionFee_mandiri> = await db.query(
          `SELECT
            id,
            transaction_id,
            fee_amount,
            insurance_amount,
            discount_amount,
            fee_tax_amount,
            insurance_tax_amount,
            cod_value,
            total_amount,
            created_at,
            updated_at
          FROM transaction_fees
          WHERE transaction_id = $1`,
          [id]
        );

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'Success get transaction by ID',
          data: {
            transaction,
            items: itemsQuery.rows,
            fees: feesQuery.rows[0] || null,
          },
        });
      }

      // List + filter + pagination
      const validatedPage = Math.max(parseInt(page as string) || 1, 1);
      const validatedPageSize = Math.min(
        Math.max(parseInt(page_size as string) || 25, 1),
        100
      );
      const offset = (validatedPage - 1) * validatedPageSize;

      const conditions: string[] = [];
      const paramsFilter: any[] = [];

      if (term && typeof term === 'string') {
        const searchTerm = term.trim();
        const filters = searchTerm.split(' ');
        const regularSearchTerms: string[] = [];

        filters.forEach((filter) => {
          if (filter.startsWith('startDate:')) {
            const date = filter.split(':')[1];
            if (date) {
              paramsFilter.push(date);
              conditions.push(`transaction_date >= $${paramsFilter.length}`);
            }
          } else if (filter.startsWith('endDate:')) {
            const date = filter.split(':')[1];
            if (date) {
              paramsFilter.push(date);
              conditions.push(`transaction_date <= $${paramsFilter.length}`);
            }
          } else if (filter.startsWith('minAmount:')) {
            const amount = filter.split(':')[1];
            if (amount) {
              paramsFilter.push(parseFloat(amount));
              conditions.push(`fee_amount >= $${paramsFilter.length}`);
            }
          } else if (filter.startsWith('maxAmount:')) {
            const amount = filter.split(':')[1];
            if (amount) {
              paramsFilter.push(parseFloat(amount));
              conditions.push(`fee_amount <= $${paramsFilter.length}`);
            }
          } else if (filter) {
            regularSearchTerms.push(filter);
          }
        });

        if (regularSearchTerms.length > 0) {
          const searchPattern = `%${regularSearchTerms.join(' ')}%`;
          paramsFilter.push(searchPattern);
          conditions.push(`(
            category_name ILIKE $${paramsFilter.length} OR
            id::text ILIKE $${paramsFilter.length} OR
            user_id::text ILIKE $${paramsFilter.length} OR
            product_name ILIKE $${paramsFilter.length} OR
            status_name ILIKE $${paramsFilter.length} OR
            payment_type_name ILIKE $${paramsFilter.length}
          )`);
        }
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Hitung total data
      const totalQuery = `
        SELECT COUNT(*) AS total
        FROM transactions
        ${whereClause}
      `;
      const totalResult: QueryResult<{ total: string }> = await db.query(
        totalQuery,
        paramsFilter
      );
      const total_data = parseInt(totalResult.rows[0].total, 10);


      const limitIndex = paramsFilter.length + 1;
      const offsetIndex = paramsFilter.length + 2;
      const paramsRows = [...paramsFilter, validatedPageSize, offset];

      const rowsQuery = `
        SELECT
          id,
          user_id,
          location_id,
          transaction_date,
          category_id,
          category_name,
          item_type_id,
          item_type_name,
          product_id,
          product_name,
          estimation,
          payment_type_id,
          payment_type_name,
          connote_code,
          status_id,
          status_name,
          awb_url,
          is_bagging,
          created_at,
          updated_at,
          agent_id,
          account_number,
          posdigi_product_id,
          bill_amount,
          fee_amount,
          ref_id,
          receipt_number,
          connote_id,
          payment_status_id,
          payment_status_name
        FROM transactions
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
      `;

      const rowsResult: QueryResult<transaction_mandiri> = await db.query(
        rowsQuery,
        paramsRows
      );
      const rows: transaction_mandiri[] = rowsResult.rows;

      const total_page = Math.max(
        Math.ceil(total_data / validatedPageSize),
        1
      );

      return res.status(200).json({
        status: true,
        code: '200',
        message: 'Success get transaction list',
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
    } catch (error) {
      console.error('Error in Transaction Mandiri handler:', error);
      return res.status(500).json({
        status: false,
        code: '500',
        message: 'Internal server error',
        data: null,
      });
    } finally {
      if (db) await db.end();
    }
  });
}
