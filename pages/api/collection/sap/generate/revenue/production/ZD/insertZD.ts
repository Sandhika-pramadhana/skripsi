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

        // Query untuk mendapatkan revenue direct dan third party
        const querySelect = `
          SELECT
            a.rev_direct_agency as direct,
            b.rev_third_party as third
          FROM
          (
            SELECT
              SUM(trx_commission_total) AS rev_direct_agency
            FROM
              log_trx_agent_${tableMonth},
              history_trx_agent_${tableMonth}
            WHERE
              product_id <> '9001'
              AND trx_price_fee_type <> 'INDIRECT'
              AND description NOT LIKE '%refund%'
              AND DATE(log_datetime) = ?
              AND log_trx_agent_${tableMonth}.id = log_id
              AND biller_aggregator_id = '2'
          ) a,
          (
            SELECT
              SUM(trx_commission_total) AS rev_third_party
            FROM
              log_trx_agent_${tableMonth},
              history_trx_agent_${tableMonth}
            WHERE
              description NOT LIKE '%refund%'
              AND DATE(log_datetime) = ?
              AND log_trx_agent_${tableMonth}.id = log_id
              AND biller_aggregator_id <> '2'
          ) b
        `;

        const [rows] = await connection.execute(querySelect, [currentDate, currentDate]);
        const data = (rows as any[])[0];

        const third = Number(data.third || 0);
        const direct = Number(data.direct || 0);

        // Calculate PPN 9.91%
        const ppn_third = third * 0.0991;
        const dpp_third = third - ppn_third;

        const ppn_direct = direct * 0.0991;
        const dpp_direct = direct - ppn_direct;

        // Insert to sapico_temp
        const queryInsert = `
          INSERT INTO sapico_temp(tgl_trx, id_number, amount, coa, sgtxt, ket, flag)
          VALUES
            (?, "12100111-agnpk", ?, "4100200000", "POSPAY AGEN", "ZD", 0),
            (?, "Giro Pos CGS 030-000002-3 - agnpb", ?, "1113400000", "POSPAY AGEN", "ZD", 0)
        `;

        await connection.execute(queryInsert, [
          currentDate, dpp_third,
          currentDate, dpp_direct
        ]);

        await connection.commit();

        results.push({
          date: currentDate,
          success: true,
          dpp_third: Math.round(dpp_third),
          dpp_direct: Math.round(dpp_direct),
          ppn_third: Math.round(ppn_third),
          ppn_direct: Math.round(ppn_direct),
          total_third: Math.round(third),
          total_direct: Math.round(direct)
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
      error: error.message || 'Failed to insert ZD data',
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