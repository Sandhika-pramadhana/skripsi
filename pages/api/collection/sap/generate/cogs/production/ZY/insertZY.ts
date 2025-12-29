import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB6 } from '@/features/core/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.socket?.setTimeout(0);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool: any = null;
  let connection: any = null;
  
  try {
    const { start_date, dates, amounts } = req.body;

    // Validasi input
    if (!start_date) {
      return res.status(400).json({
        error: 'Start date is required',
      });
    }

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        error: 'Dates array is required and cannot be empty',
      });
    }

    if (!amounts || !Array.isArray(amounts) || amounts.length !== dates.length) {
      return res.status(400).json({
        error: 'Amounts array is required and must match dates length',
      });
    }

    for (let i = 0; i < amounts.length; i++) {
      if (!amounts[i] || isNaN(Number(amounts[i])) || Number(amounts[i]) <= 0) {
        return res.status(400).json({
          error: `Valid amount is required for day ${i + 1} (positive number)`,
        });
      }
    }

    const startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid start date format',
      });
    }

    if (dates.length > 7) {
      return res.status(400).json({
        error: 'Maximum 7 days allowed',
      });
    }

    pool = await connectDB6();
    connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const results: any[] = [];

      // Loop untuk setiap tanggal dan amount
      for (let i = 0; i < dates.length; i++) {
        const currentDate = dates[i];
        const amount = Number(amounts[i]);

        const dateObj = new Date(currentDate);
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Invalid date format for day ${i + 1}: ${currentDate}`);
        }

        const formattedDate = dateObj.toISOString().split('T')[0];

        const queryInsert = `
          INSERT INTO sapico_temp(tgl_trx, id_number, amount, coa, sgtxt, ket, flag)
          SELECT 
            ?, 
            temp.id,
            ?,
            b.coa,
            b.name,
            'ZY',
            0
          FROM (
            SELECT "12100111-agncogs" AS id
          ) temp,
          mapping_coa b
          WHERE temp.id = b.id_number
        `;

        try {
          await connection.execute(queryInsert, [formattedDate, amount]);
          results.push({
            date: formattedDate,
            success: true,
            amount: amount,
            id_number: '12100111-agncogs',
            ket: 'ZY',
          });
        } catch (insertError: any) {
          results.push({
            date: formattedDate,
            success: false,
            amount: amount,
            id_number: '12100111-agncogs',
            ket: 'ZY',
            error: insertError.message || 'Insert failed',
          });
        }
      }

      await connection.commit();

      const totalAmount = results.reduce((sum, item) => sum + (item.amount || 0), 0);
      const successCount = results.filter((r) => r.success).length;

      return res.status(200).json({
        success: true,
        message: `Successfully processed ZY data for ${dates.length} days. ${successCount}/${dates.length} inserted, Total: Rp ${totalAmount.toLocaleString('id-ID')}`,
        results: results,
      });
    } catch (error: any) {
      try {
        await connection.rollback();
      } catch {}
      throw error;
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to insert ZY data',
      errorType: error.constructor?.name,
      sqlMessage: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } finally {
    if (connection) {
      try {
        await connection.release(); 
      } catch {}
    }
    if (pool) {
      try {
        await pool.end(); 
      } catch {}
    }
  }
}
