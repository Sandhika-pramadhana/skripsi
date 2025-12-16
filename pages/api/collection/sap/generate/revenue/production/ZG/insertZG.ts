import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB7 } from '@/features/core/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.socket?.setTimeout(0);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection: any = null;
  
  try {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Start date and end date are required' 
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format' 
      });
    }

    connection = await connectDB7();

    const results = [];
    const errors = [];

    // Generate all dates in range
    const allDates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    // Process each date
    for (const currentDate of allDates) {
      try {
        await connection.beginTransaction();

        // ZG Query - same as PHP version
        const querySelect = `
          SELECT CEIL(SUM(fee)) AS total_amount
          FROM (
            SELECT 
              CASE 
                WHEN a.product_id LIKE '%SCF%' 
                  THEN SUM(a.amount) * 0.01
                ELSE COUNT(*) * b.fee
              END AS fee
            FROM data_transactions a
            JOIN mapping_fee_temp b 
              ON a.product_id = b.product_id
            WHERE (a.error_code = 'PF000' OR a.final_status = 'PF000')
              AND DATE(a.transaction_date) = ?
            GROUP BY a.product_id, b.fee
          ) t
        `;

        const [rows] = await connection.execute(querySelect, [currentDate]);
        const data = (rows as any[])[0];

        const totalAmount = Number(data.total_amount || 0);

        // Calculate PPN 9.91%
        const ppn = totalAmount * 0.0991;
        const amount = totalAmount - ppn; // DPP (Dasar Pengenaan Pajak)

        // Insert to sapico_temp - ZG specific values
        const queryInsert = `
          INSERT INTO sapico_temp(tgl_trx, id_number, amount, coa, sgtxt, ket, flag)
          VALUES
            (?, '12200111-aggpk', ?, '4200200000', 'Pendapatan Pihak Ketiga - Aggregator [12200111]', 'ZG', 0)
        `;

        await connection.execute(queryInsert, [
          currentDate, amount 
        ]);

        await connection.commit();

        results.push({
          date: currentDate,
          success: true,
          amount: Math.round(amount), 
          ppn: Math.round(ppn),
          total_amount: Math.round(totalAmount)
        });

      } catch (error: any) {
        await connection.rollback();
        
        errors.push({
          date: currentDate,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${results.length} dates successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to insert ZG data',
      errorType: error.constructor.name,
      sqlMessage: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error: any) {
        // Silent error
      }
    }
  }
}
