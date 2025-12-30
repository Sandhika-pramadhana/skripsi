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
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Start date and end date are required',
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
      });
    }

    
    pool = await connectDB7();
    connection = await pool.getConnection();

    const querySelect = `
    SELECT
      DATE(transaction_date) AS tgl_trx,
      COALESCE(SUM(fee_amount), 0) AS total_amount
    FROM data_transactions
    WHERE transaction_type IN ('CLB', 'PAY')
      AND (error_code = 'PF000' OR final_status = 'PF000')
      AND transaction_date >= ? 
      AND transaction_date < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY DATE(transaction_date)
  `;
  const [rows] = await connection.execute(querySelect, [start_date + ' 00:00:00', end_date]);
    const data = rows as { tgl_trx: string; total_amount: number }[];

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No data in selected range',
        results: [],
      });
    }

    const values: any[] = [];
    const results: any[] = [];

    for (const row of data) {
      const totalAmount = Number(row.total_amount || 0);
      const ppn = totalAmount * 0.0991;
      const amount = totalAmount - ppn;

      values.push([
        row.tgl_trx,
        amount,
      ]);

      results.push({
        date: row.tgl_trx,
        success: true,
        amount: Math.round(amount),
        ppn: Math.round(ppn),
        total_amount: Math.round(totalAmount),
      });
    }

    await connection.beginTransaction();

    const queryInsert = `
      INSERT INTO sapico_temp(tgl_trx, id_number, amount, coa, sgtxt, ket, flag)
      VALUES
      ${values
        .map(
          () =>
            `(?, '12200111-aggpb', ?, '4100200000', 'Pendapatan Pihak Berelasi - Aggregator [12200111]', 'ZF', 0)`
        )
        .join(',')}
    `;

    const params = values.flat(); // [tgl1, amount1, tgl2, amount2, ...]

    await connection.execute(queryInsert, params);
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Processed ${results.length} dates successfully`,
      results,
    });
  } catch (error: any) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to insert ZF data',
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
