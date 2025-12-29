import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB6, connectDB8 } from '@/features/core/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow long-running sync
  res.socket?.setTimeout(0);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection6: any = null;
  let connection8: any = null; 

  try {
    const { year, month, tables } = req.body as {
      year?: number;
      month?: number;
      tables?: string[];
    };

    if (!year || !month) {
      return res.status(400).json({ error: 'year dan month wajib diisi' });
    }

    // Validasi table parameter
    const validTables = ['history', 'log', 'partner'] as const;
    const selectedTables: string[] =
      tables && Array.isArray(tables)
        ? tables.filter((t: string) => validTables.includes(t as any))
        : [...validTables]; 

    if (selectedTables.length === 0) {
      return res.status(400).json({ error: 'Minimal 1 tabel harus dipilih' });
    }

    const mm = String(month).padStart(2, '0');
    const ym = `${year}_${mm}`;

    // Koneksi ke MySQL
    connection6 = await connectDB6();
    connection8 = await connectDB8();

    // Mapping source → target per tabel
    const tableMap: Record<string, { source: string; target: string }> = {
      history: {
        source: `agen_posfin.history_trx_agent_${ym}`,
        target: `sapfico.history_trx_agent_${ym}`,
      },
      log: {
        source: `agen_posfin.log_trx_agent_${ym}`,
        target: `sapfico.log_trx_agent_${ym}`,
      },
      partner: {
        source: `B2B.partner_trx_request_${ym}`,
        target: `sapfico.partner_trx_request_${ym}`,
      },
    };

    const inserted: Record<string, number> = {};

    // Proses tabel yang dipilih
    for (const tableName of selectedTables) {
      const table = tableMap[tableName];
      if (!table) continue;

      console.log(`Syncing ${tableName}: ${table.source} → ${table.target}`);

      // TRUNCATE target
      await connection6.query(`TRUNCATE TABLE ${table.target}`);

      // INSERT SELECT 
      const [result]: any = await connection6.query(
        `INSERT INTO ${table.target} SELECT * FROM ${table.source}`
      );

      inserted[tableName] = result?.affectedRows || 0;
      console.log(`✅ ${tableName}: ${inserted[tableName]} rows inserted`);
    }

    return res.status(200).json({
      success: true,
      periode: ym,
      tables: selectedTables,
      inserted,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
    });
  } finally {
    if (connection6) {
      try {
        await connection6.end();
      } catch {}
    }
    if (connection8) {
      try {
        await connection8.end();
      } catch {}
    }
  }
}
