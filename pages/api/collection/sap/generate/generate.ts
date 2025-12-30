import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB6 } from '@/features/core/lib/db';

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(Math.round(num));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.socket?.setTimeout(0);

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection: any = null;
  
  try {
    let start_date: string;
    let end_date: string;

    if (req.method === 'GET') {
      start_date = req.query.start_date as string;
      end_date = req.query.end_date as string;
    } else {
      start_date = req.body.start_date;
      end_date = req.body.end_date;
    }

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

   
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff > 7) {
      return res.status(400).json({ 
        error: `maksimal 7 hari. Request: ${daysDiff} hari` 
      });
    }

    connection = await connectDB6();

  
    const allDates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    const weeks: any[] = [];
    let weekData: any[] = [];
    let weekGross = 0;
    let weekNumber = 1;
    let totalGrossMonth = 0;
    let totalDppMonth = 0;
    let totalPpnMonth = 0;
    
    
    const queryPromises = allDates.map(async (currentDate) => {
      const [year, month] = currentDate.split('-');
      const tableMonth = `${year}_${month}`;

      try {
        const querySelect = `
          SELECT
            IFNULL(a.rev_direct_agency, 0) + IFNULL(d.rev_direct_b2b, 0) AS Total_direct,
            IFNULL(b.rev_indirect_agency, 0) + IFNULL(c.rev_takaful_agency, 0) + IFNULL(e.rev_indirect_b2b, 0) AS total_indirect,
            IFNULL(g.rev_third_party, 0) AS third_party
          FROM 
            (
              SELECT SUM(trx_sheet_number) AS jml_trx
              FROM history_trx_agent_${tableMonth}
              WHERE description NOT LIKE "%REFUND%" 
              AND DATE(trx_datetime) BETWEEN ? AND ?
              AND trx_mode = "CASHOUT"
            ) trx,
            (
              SELECT SUM(trx_commission_total) AS rev_direct_agency
              FROM log_trx_agent_${tableMonth}, history_trx_agent_${tableMonth}
              WHERE product_id <> "9001"
              AND trx_price_fee_type <> "INDIRECT"
              AND description NOT LIKE "%refund%"
              AND DATE(log_datetime) BETWEEN ? AND ?
              AND log_trx_agent_${tableMonth}.id = log_id
              AND biller_aggregator_id = "2"
            ) a,
            (
              SELECT SUM(trx_commission_total + trx_bonus_total) AS rev_indirect_agency
              FROM log_trx_agent_${tableMonth} lg, history_trx_agent_${tableMonth} his
              WHERE his.trx_type <> "inquiry"
              AND lg.id = his.log_id
              AND trx_result_code IN ("000", "5003")
              AND trx_price_fee_type <> "DIRECT"
              AND trx_price_fee_type <> "MIXDIRECTPAID"
              AND trx_price_fee_type <> "INDIRECTPAID"
              AND DATE(log_datetime) BETWEEN ? AND ?
              AND description NOT LIKE "%refund%"
            ) b,
            (
              SELECT IF(SUM(trx_commission_total + trx_bonus_total) IS NULL, 0, 
                     SUM(trx_commission_total + trx_bonus_total)) AS rev_takaful_agency
              FROM log_trx_agent_${tableMonth} lg, history_trx_agent_${tableMonth} his
              WHERE his.trx_type <> "inquiry"
              AND lg.id = his.log_id
              AND trx_result_code IN ("000", "5003")
              AND product_id = "9001"
              AND DATE(log_datetime) BETWEEN ? AND ?
              AND description NOT LIKE "%refund%"
            ) c,
            (
              SELECT SUM(white_label_fee_value) AS rev_direct_b2b, SUM(sheet_count) AS trx
              FROM partner_trx_request_${tableMonth}
              WHERE trx_type <> "inquiry"
              AND product_code NOT LIKE "75%"
              AND fee_type <> "INDIRECT"
              AND trx_status = 0
              AND DATE(partner_data_received_date) BETWEEN ? AND ?
            ) d,
            (
              SELECT SUM(white_label_bonus_value + partner_bonus_value) AS rev_indirect_b2b, 
                     SUM(sheet_count) AS trx
              FROM partner_trx_request_${tableMonth}
              WHERE trx_type <> "inquiry"
              AND product_code NOT LIKE "75%"
              AND fee_type <> "DIRECT"
              AND trx_status = 0
              AND DATE(partner_data_received_date) BETWEEN ? AND ?
            ) e,
            (
              SELECT SUM(white_label_fee_value) AS rev_direct_b2b, SUM(sheet_count) AS trx
              FROM partner_trx_request_${tableMonth}
              WHERE trx_type <> "inquiry"
              AND product_code NOT LIKE "75%"
              AND trx_status = 0
              AND DATE(partner_data_received_date) BETWEEN ? AND ?
            ) f,
            (
              SELECT SUM(trx_commission_total) AS rev_third_party
              FROM log_trx_agent_${tableMonth}, history_trx_agent_${tableMonth}
              WHERE description NOT LIKE "%refund%"
              AND DATE(log_datetime) BETWEEN ? AND ?
              AND log_trx_agent_${tableMonth}.id = log_id
              AND biller_aggregator_id <> "2"
            ) g
        `;

        const params = [
          currentDate, currentDate, // trx
          currentDate, currentDate, // a
          currentDate, currentDate, // b
          currentDate, currentDate, // c
          currentDate, currentDate, // d
          currentDate, currentDate, // e
          currentDate, currentDate, // f
          currentDate, currentDate  // g
        ];

        const [results] = await connection.execute(querySelect, params);
        const data = (results as any[])[0];

        const directRevenue = Number(data.Total_direct || 0);
        const indirectRevenue = Number(data.total_indirect || 0);
        const thirdPartyRevenue = Number(data.third_party || 0);
        
        const gross = directRevenue + indirectRevenue + thirdPartyRevenue;
        
        // ✅ DPP = GROSS - PPN (9.91%)
        const dpp = gross * (1 - 0.0991); 
        const ppn = gross * 0.0991;

        return {
          date: currentDate,
          direct: directRevenue,        // Raw numbers untuk week calculation
          indirect: indirectRevenue,
          thirdparty: thirdPartyRevenue,
          gross: gross,
          dpp: dpp,
          ppn: ppn
        };

      } catch (error: any) {
        console.error(`Query failed for ${currentDate}:`, error);
        return {
          date: currentDate,
          direct: 0,
          indirect: 0,
          thirdparty: 0,
          gross: 0,
          dpp: 0,
          ppn: 0
        };
      }
    });

    const dailyResults = await Promise.all(queryPromises);

    
    for (let i = 0; i < allDates.length; i++) {
      const currentDate = allDates[i];
      const result = dailyResults[i];
      const d = new Date(currentDate);

      
      const totalGross = result.gross;
      const totalPpn = result.ppn;
      
      const directDpp = (result.direct / totalGross) * result.dpp;
      const indirectDpp = (result.indirect / totalGross) * result.dpp;
      const thirdpartyDpp = (result.thirdparty / totalGross) * result.dpp;

      weekData.push({
        date: currentDate,
        direct: formatNumber(directDpp),           
        indirect: formatNumber(indirectDpp),       
        thirdparty: formatNumber(thirdpartyDpp),   
        gross_revenue: formatNumber(result.gross),
        dpp: formatNumber(result.dpp)
      });

      
      weekGross += result.dpp;


      const isLastDay = i === allDates.length - 1;
      
      if (isLastDay || i === allDates.length - 1) {
        const weekPpn = weekGross * 0.0991;
        const weekDpp = weekGross - weekPpn;

        let weekDirect = 0;
        let weekIndirect = 0;
        let weekThirdParty = 0;

        
        weekData.forEach(day => {
          weekDirect += parseFloat(day.direct.replace(/\./g, '')) || 0;
          weekIndirect += parseFloat(day.indirect.replace(/\./g, '')) || 0;
          weekThirdParty += parseFloat(day.thirdparty.replace(/\./g, '')) || 0;
        });

        weeks.push({
          week: `Week ${weekNumber}`,
          days: weekData,
          summary: {
            direct: formatNumber(weekDirect),
            indirect: formatNumber(weekIndirect),
            thirdparty: formatNumber(weekThirdParty),
            gross_revenue: formatNumber(weekGross + weekPpn), // Gross = DPP + PPN
            dpp: formatNumber(weekDpp),
            ppn: formatNumber(weekPpn),
            days_count: allDates.length
          }
        });

        totalGrossMonth += (weekGross + weekPpn);
        totalDppMonth += weekDpp;
        totalPpnMonth += weekPpn;

        weekData = [];
        weekGross = 0;
        weekNumber++;
      }
    }

    weeks.push({
      summary_range: {
        date_range: `${start_date} to ${end_date}`,
        total_days: allDates.length,
        gross_revenue: formatNumber(totalGrossMonth),
        dpp: formatNumber(totalDppMonth),
        ppn: formatNumber(totalPpnMonth)
      }
    });

    return res.status(200).json({ 
      weeks, 
      processed_dates: allDates.length,
      date_range: `${start_date} to ${end_date}`
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate revenue data',
      errorType: error.constructor.name,
      sqlMessage: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error: any) {}
    }
  }
}
