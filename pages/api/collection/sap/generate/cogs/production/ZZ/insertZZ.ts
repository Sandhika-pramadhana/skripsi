import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB7 } from '@/features/core/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.socket?.setTimeout(0);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let pool: any = null;
  let connection: any = null;

  try {
    const { start_date, dates, amounts } = req.body;

    
    if (!start_date) {
      return res.status(400).json({
        error: 'Start date is required',
      });
    }

    if (!Array.isArray(dates) || dates.length === 0 || dates.length > 7) {
      return res.status(400).json({
        error: 'Dates array required (1-7 dates maximum)',
      });
    }

    if (!Array.isArray(amounts) || amounts.length !== dates.length) {
      return res.status(400).json({
        error: 'Amounts array required and must match dates length',
      });
    }

    const validatedData: { date: string; amount: number }[] = [];
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const amount = Number(amounts[i]);

      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: `Invalid date format at index ${i}: ${dates[i]}`,
        });
      }

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          error: `Valid amount required at index ${i} (positive number): ${amounts[i]}`,
        });
      }

      validatedData.push({
        date: date.toISOString().split('T')[0],
        amount,
      });
    }

  
    pool = await connectDB7();
    connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const { date, amount } of validatedData) {
        const queryInsert = `
          INSERT INTO sapico_temp(tgl_trx, id_number, amount, coa, sgtxt, ket, flag)
          SELECT 
            ?, 
            temp.id,
            ?,
            b.coa,
            b.name,
            'ZZ',
            0
          FROM (
            SELECT "12200111-aggcogs" AS id
          ) temp,
          mapping_coa b
          WHERE temp.id = b.id_number
        `;

        await connection.execute(queryInsert, [date, amount]);
      }

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: `Successfully inserted ZZ data for ${validatedData.length} days`,
        results: validatedData.map(({ date, amount }) => ({
          date,
          success: true,
          amount,
          id_number: '12200111-aggcogs',
          ket: 'ZZ',
        })),
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
      error: error.message || 'Failed to insert ZZ data',
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
