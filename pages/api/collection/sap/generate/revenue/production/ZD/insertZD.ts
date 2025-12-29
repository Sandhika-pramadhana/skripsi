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

    
    pool = await connectDB6();
    connection = await pool.getConnection();

    const results: any[] = [];
    const errors: any[] = [];

    
    const allDates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    for (const currentDate of allDates) {
      try {
        await connection.beginTransaction();

        const [year, month] = currentDate.split('-');
        const tableMonth = `${year}_${month}`;

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
        const data = (rows as any[])[0] || {};

        const third = Number(data.third || 0);
        const direct = Number(data.direct || 0);

        const ppn_third = third * 0.0991;
        const dpp_third = third - ppn_third;

        const ppn_direct = direct * 0.0991;
        const dpp_direct = direct - ppn_direct;

        const queryInsert = `
          INSERT INTO sapico_temp(tgl_trx, id_number, amount, coa, sgtxt, ket, flag)
          VALUES
            (?, "12100111-agnpk", ?, "4100200000", "POSPAY AGEN", "ZD", 0),
            (?, "Giro Pos CGS 030-000002-3 - agnpb", ?, "1113400000", "POSPAY AGEN", "ZD", 0)
        `;

        await connection.execute(queryInsert, [
          currentDate, dpp_third,
          currentDate, dpp_direct,
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
          total_direct: Math.round(direct),
        });
      } catch (error: any) {
        
        try {
          await connection.rollback();
        } catch {}
        errors.push({
          date: currentDate,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${results.length} dates successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to insert ZD data',
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
