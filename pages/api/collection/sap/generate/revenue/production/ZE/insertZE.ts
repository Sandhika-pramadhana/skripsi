import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB6 } from '@/features/core/lib/db';

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

    connection = await connectDB6();

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

        const [year, month] = currentDate.split('-');
        const tableMonth = `${year}_${month}`;

        // Query untuk mendapatkan revenue indirect agency dan takaful agency
        const querySelect = `
          SELECT
            a.rev_indirect_agency + b.rev_takaful_agency as indirect
          FROM
          (
            SELECT 
              COALESCE(SUM(trx_commission_total + trx_bonus_total), 0) AS rev_indirect_agency
            FROM
              log_trx_agent_${tableMonth} lg,
              history_trx_agent_${tableMonth} his
            WHERE
              his.trx_type <> 'inquiry'
              AND lg.id = his.log_id
              AND trx_result_code IN ('000','5003')
              AND trx_price_fee_type NOT IN ('DIRECT','MIXDIRECTPAID','INDIRECTPAID')
              AND DATE(log_datetime) = ?
              AND description NOT LIKE '%refund%'
          ) a,
          (
            SELECT 
              COALESCE(SUM(trx_commission_total + trx_bonus_total), 0) AS rev_takaful_agency
            FROM
              log_trx_agent_${tableMonth} lg,
              history_trx_agent_${tableMonth} his
            WHERE
              his.trx_type <> 'inquiry'
              AND lg.id = his.log_id
              AND trx_result_code IN ('000','5003')
              AND product_id = '9001'
              AND DATE(log_datetime) = ?
              AND description NOT LIKE '%refund%'
          ) b
        `;

        const [rows] = await connection.execute(querySelect, [currentDate, currentDate]);
        const data = (rows as any[])[0];

        const indirect = Number(data.indirect || 0);

        // Calculate PPN 9.91%
        const ppn = indirect * 0.0991;
        const dpp = indirect - ppn;

        // Insert to sapico_temp
        const queryInsert = `
          INSERT INTO sapico_temp(tgl_trx, id_number, amount, coa, sgtxt, ket, flag)
          VALUES
            (?, "PT Pos Indonesia (Persero) - angpb", ?, "5000000000", "POSPAY AGEN", "ZE", 0)
        `;

        await connection.execute(queryInsert, [
          currentDate, dpp
        ]);

        await connection.commit();

        results.push({
          date: currentDate,
          success: true,
          dpp: Math.round(dpp),
          ppn: Math.round(ppn),
          total_indirect: Math.round(indirect)
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
      error: error.message || 'Failed to insert ZE data',
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