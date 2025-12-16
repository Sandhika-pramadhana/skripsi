import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB7 } from '@/features/core/lib/db';  // ✅ Hanya 1 import
import fs from 'fs';
import path from 'path';

const QA_ENDPOINT = process.env.QA_ENDPOINT || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.socket?.setTimeout(0);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection7: any = null;  // ✅ Hanya 1 koneksi DB7 (sapico_temp & log_sapico_deposit)

  try {
    const { start_date, end_date, environment = 'sandbox' } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (!QA_ENDPOINT) {
      return res.status(400).json({ error: 'QA_ENDPOINT not configured' });
    }

    // ✅ SATU KONEKSI SAJA
    connection7 = await connectDB7();

    const results: any[] = [];
    const errors: any[] = [];

    // Generate all dates
    const allDates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    // Process each date
    for (const currentDate of allDates) {
      try {
        const dateObj = new Date(currentDate);
        const startDateFormatted = dateObj.toISOString().split('T')[0].replace(/-/g, '');
        const month = dateObj.toISOString().split('-')[1];
        const BLART = "ZG";

        // Get data dari DB7 - ZG (includes id and id_number)
        const querySelect = `
          SELECT id, id_number, amount 
          FROM sapico_temp
          WHERE ket = "ZG"
            AND DATE(tgl_trx) = ?
            AND flag = 0 
          ORDER BY id
        `;

        const [rows] = await connection7.execute(querySelect, [currentDate]);
        const datas = rows as any[];

        if (datas.length === 0) {
        results.push({
          date: currentDate,
          environment,
          status: 'skipped',
          message: 'No data found for this date'
        });
        continue;
        }

        let total_sum = 0;
        for (const data of datas) {
          total_sum += Number(data.amount);
        }

        // *** SOAP 1.1 XML - SERVER EXPECT ***
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <dws:setTransaction xmlns:dws="http://dwssync_pfi_qa" xmlns:xsd="http://dwssync_pfi_qa/xsd">
      <dws:input>`;
        
        // ✅ DEBIT ITEM - Single (Total Sum) - AGGPK
        xml += `
        <xsd:ITEM>
          <xsd:AUFNR></xsd:AUFNR>
          <xsd:BUKRS>4000</xsd:BUKRS>
          <xsd:BLDAT>${startDateFormatted}</xsd:BLDAT>
          <xsd:BUDAT>${startDateFormatted}</xsd:BUDAT>
          <xsd:MONAT>${month}</xsd:MONAT>
          <xsd:BLART>${BLART}</xsd:BLART>
          <xsd:WAERS>IDR</xsd:WAERS>
          <xsd:XBLNR>29111</xsd:XBLNR>
          <xsd:BKTXT>${BLART}${startDateFormatted}-- REV3 --</xsd:BKTXT>
          <xsd:BSCHL>01</xsd:BSCHL>
          <xsd:NEWKO>5110000000</xsd:NEWKO>
          <xsd:WRBTR>${total_sum}</xsd:WRBTR>
          <xsd:GSBER>HO00</xsd:GSBER>
          <xsd:ZFBDT>${startDateFormatted}</xsd:ZFBDT>
          <xsd:ZTERM>Z030</xsd:ZTERM>
          <xsd:PRCTR>PFI0040005</xsd:PRCTR>
          <xsd:ZUONR>REVENUE-AGGPK</xsd:ZUONR>
          <xsd:KOSTL></xsd:KOSTL>
          <xsd:WWPRD></xsd:WWPRD>
          <xsd:KUNNR>5110000000</xsd:KUNNR>
          <xsd:SGTXT>POSPAY AGGREGATOR</xsd:SGTXT>
          <xsd:STATE></xsd:STATE>
        </xsd:ITEM>`;

        // ✅ CREDIT ITEMS - Multiple (Per Data Row)
        for (const data of datas) {
          const wwprd = parseInt(data.id_number.replace(/\D/g, '')); // Extract numbers from id_number
          
          xml += `
        <xsd:ITEM>
          <xsd:AUFNR></xsd:AUFNR>
          <xsd:BUKRS>4000</xsd:BUKRS>
          <xsd:BLDAT>${startDateFormatted}</xsd:BLDAT>
          <xsd:BUDAT>${startDateFormatted}</xsd:BUDAT>
          <xsd:MONAT>${month}</xsd:MONAT>
          <xsd:BLART>${BLART}</xsd:BLART>
          <xsd:WAERS>IDR</xsd:WAERS>
          <xsd:XBLNR>29111</xsd:XBLNR>
          <xsd:BKTXT>${BLART}${startDateFormatted}-- REV3 --</xsd:BKTXT>
          <xsd:BSCHL>50</xsd:BSCHL>
          <xsd:NEWKO>4200220000</xsd:NEWKO>
          <xsd:WRBTR>${Number(data.amount)}</xsd:WRBTR>
          <xsd:GSBER>HO00</xsd:GSBER>
          <xsd:ZFBDT>${startDateFormatted}</xsd:ZFBDT>
          <xsd:ZTERM>Z030</xsd:ZTERM>
          <xsd:PRCTR>PFI0040005</xsd:PRCTR>
          <xsd:ZUONR>REVENUE-AGGPK</xsd:ZUONR>
          <xsd:KOSTL></xsd:KOSTL>
          <xsd:WWPRD>12200111</xsd:WWPRD>
          <xsd:KUNNR></xsd:KUNNR>
          <xsd:SGTXT>POSPAY AGGREGATOR</xsd:SGTXT>
          <xsd:STATE></xsd:STATE>
        </xsd:ITEM>`;
        }

        xml += `
      </dws:input>
      <dws:type>JSON</dws:type>
    </dws:setTransaction>
  </soapenv:Body>
</soapenv:Envelope>`;

        // Save XML file
        const xmlname = `ZG_Revenue_AGGPK-${startDateFormatted}.xml`;
        const xmlPath = path.join(process.cwd(), 'public', 'sapico', xmlname);
        const dir = path.dirname(xmlPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(xmlPath, xml);

        // API CALL - SOAP 1.1 HEADERS
        let apiResponse: any = null;
        let apiSuccess = false;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const response = await fetch(QA_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              'SOAPAction': '""',
              'Content-Length': Buffer.byteLength(xml, 'utf8').toString(),
              'User-Agent': 'PHP/8.0.0',
              'Connection': 'close'
            },
            body: xml,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          
          if (!response.ok) {
            apiResponse = await response.text();
          } else {
            apiResponse = await response.text();

            // Parse response
            const resultMatch = apiResponse.match(/<ns:return>([\s\S]*?)<\/ns:return>/);
            if (resultMatch) {
              let resultJson = resultMatch[1];
              resultJson = resultJson.replace(/<\/[^>]*>/g, "");

              const jsonData = JSON.parse(resultJson);
              const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

              // ✅ LOG ke DB7 (log_sapico_deposit table)
              const queryLog = `
                INSERT INTO log_sapico_deposit(nama_file, response, tanggal, url) 
                VALUES (?, ?, ?, ?)
              `;
              await connection7.execute(queryLog, [
                xmlname,
                resultJson,
                timestamp,
                QA_ENDPOINT
              ]);

              if (jsonData[0]?.MESSG === "Document posted successfully") {
                apiSuccess = true;

                // ✅ UPDATE sapico_temp di DB7 - ZG
                const idsPlaceholder = datas.map(() => '?').join(',');
                const idsParams = datas.map(data => data.id);
                idsParams.push(currentDate);
                
                const queryUpdate = `
                  UPDATE sapico_temp 
                  SET flag = 1, 
                      no_doc = ?, 
                      file = ?
                  WHERE id IN (${idsPlaceholder})
                    AND ket = "ZG"
                    AND DATE(tgl_trx) = ?
                    AND flag = 0
                `;
                await connection7.execute(queryUpdate, [
                  jsonData[0].BELNR,
                  xmlname,
                  ...idsParams
                ]);
              }
            }
          }
        } catch (apiError: any) {
          apiResponse = { error: apiError.message };
          console.error(`API Error [${currentDate}]:`, apiError.message);
        }

        results.push({
          date: currentDate,
          environment,
          status: apiSuccess ? 'success' : 'xml_created',
          xmlFile: xmlname,
          total_amount: Math.round(total_sum),
          record_count: datas.length,
          api_response: apiResponse,
          message: apiSuccess 
            ? 'Document posted successfully' 
            : 'XML created but API call failed or skipped'
        });

      } catch (error: any) {
        errors.push({
          date: currentDate,
          environment,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      environment,
      message: `Processed ${results.length} dates (${environment}) - ZG`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate XML ZG (Sandbox)',
      errorType: error.constructor.name,
      sqlMessage: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // ✅ Hanya 1 koneksi yang di-close
    if (connection7) {
      try {
        await connection7.end();
      } catch (error: any) {
        // Silent error
      }
    }
  }
}
