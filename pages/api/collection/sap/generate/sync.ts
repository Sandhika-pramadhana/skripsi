import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB6, connectDB8 } from '@/features/core/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.socket?.setTimeout(0);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection6: any = null;
  let connection8: any = null;

  try {
    const { year, month } = req.body;
    if (!year || !month) {
      return res.status(400).json({ error: 'year dan month wajib diisi' });
    }
    const mm = String(month).padStart(2, '0');
    const ym = `${year}_${mm}`;
    connection6 = await connectDB6();
    connection8 = await connectDB8();

    // insert join table history,log,partner
    const historySource = `agen_posfin.history_trx_agent_${ym}`;
    const historyTarget = `sapfico.history_trx_agent_${ym}`;
    const logSource = `agen_posfin.log_trx_agent_${ym}`;
    const logTarget = `sapfico.log_trx_agent_${ym}`;
    const partnerSource = `B2B.partner_trx_request_${ym}`;
    const partnerTarget = `sapfico.partner_trx_request_${ym}`;

    await connection6.query(`TRUNCATE TABLE ${historyTarget}`);
    await connection6.query(`TRUNCATE TABLE ${logTarget}`);
    await connection6.query(`TRUNCATE TABLE ${partnerTarget}`);

    const [r1]: any = await connection6.query(
      `INSERT INTO ${historyTarget} SELECT * FROM ${historySource}`
    );
    const [r2]: any = await connection6.query(
      `INSERT INTO ${logTarget} SELECT * FROM ${logSource}`
    );
    const [r3]: any = await connection6.query(
      `INSERT INTO ${partnerTarget} SELECT * FROM ${partnerSource}`
    );

    return res.status(200).json({
      success: true,
      year,
      month,
      periode: ym,
      inserted: {
        history_trx_agent: r1.affectedRows,
        log_trx_agent: r2.affectedRows,
        partner_trx_request: r3.affectedRows,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
    });
  } finally {
    if (connection6) {
      try { await connection6.end(); } catch {}
    }
    if (connection8) {
      try { await connection8.end(); } catch {}
    }
  }
}
