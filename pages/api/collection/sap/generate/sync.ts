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
    const { year, month, startDate, endDate, tables } = req.body as {
      year?: number;
      month?: number;
      startDate?: number; 
      endDate?: number;    
      tables?: string[];
    };

    if (!year || !month || !startDate || !endDate || startDate > endDate) {
      return res.status(400).json({ error: 'year, month, startDate, endDate wajib diisi' });
    }

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
    const dateRange = `${startDate}-${endDate}`;

    // Date range untuk query
    const startDateFull = `${year}-${mm}-${String(startDate).padStart(2, '0')} 00:00:00`;
    const endDateFull = `${year}-${mm}-${String(endDate).padStart(2, '0')} 23:59:59`;

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
    let lastSync = dateRange;

    // Proses per tabel - INCREMENTAL SYNC
    for (const tableName of selectedTables) {
      const table = tableMap[tableName];
      if (!table) continue;

      console.log(`🔄 Incremental Sync ${tableName} (${dateRange}): ${table.source} → ${table.target}`);

      // SINGLE QUERY: Insert atau Update berdasarkan range tanggal
      const [result]: any = await connection6.query(`
        INSERT INTO ${table.target} 
        SELECT * FROM ${table.source} 
        WHERE created_at >= '${startDateFull}' 
          AND created_at <= '${endDateFull}'
        ON DUPLICATE KEY UPDATE
          created_at = VALUES(created_at),
          updated_at = NOW()
      `);

      const rowsAffected = result.affectedRows || 0;
      inserted[tableName] = rowsAffected;
      
      // insertCount + updateCount = affectedRows
      console.log(`✅ ${tableName} ${dateRange}: ${rowsAffected} rows affected (insert+update)`);
    }

    return res.status(200).json({
      success: true,
      year,
      month,
      periode: ym,
      dateRange,
      startDateFull,
      endDateFull,
      lastSync,
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
