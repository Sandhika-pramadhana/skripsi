import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB7 } from '@/features/core/lib/db';
import fs from 'fs';
import path from 'path';

const PRD_ENDPOINT = process.env.PRD_ENDPOINT || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.socket?.setTimeout(0);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection: any = null;
  
  try {
    const { start_date, end_date, environment = 'prod' } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (!PRD_ENDPOINT) {
      return res.status(400).json({ error: 'PRD_ENDPOINT not configured' });
    }

    connection = await connectDB7();

    const results: any[] = [];
    const errors: any[] = [];

    // Generate all dates in range
    const allDates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    for (const currentDate of allDates) {
      try {
        const dateObj = new Date(currentDate);
        const startDateFormatted = dateObj.toISOString().split('T')[0].replace(/-/g, '');
        const month = dateObj.toISOString().split('-')[1];
        const BLART = "ZF";

        // Ambil data dari sapico_temp untuk ket = "ZF"
        const querySelect = `
          SELECT * 
          FROM sapico_temp
          WHERE ket = "ZF"
            AND DATE(tgl_trx) = ?
            AND flag = 0 
        `;

        const [rows] = await connection.execute(querySelect, [currentDate]);
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

        // Hitung total sum amount
        let total_sum = 0;
        for (const data of datas) {
          total_sum += Number(data.amount);
        }

        //Generate Xml data
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <dws:setTransaction xmlns:dws="http://dwssync_pfi_prd" xmlns:xsd="http://dwssync_pfi_prd/xsd">
      <dws:input>`;

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
          <xsd:BKTXT>${BLART}${startDateFormatted}--- REV3 ---</xsd:BKTXT>
          <xsd:BSCHL>01</xsd:BSCHL>
          <xsd:NEWKO>5000000000</xsd:NEWKO>
          <xsd:WRBTR>${total_sum}</xsd:WRBTR>
          <xsd:GSBER>HO00</xsd:GSBER>
          <xsd:ZFBDT>${startDateFormatted}</xsd:ZFBDT>
          <xsd:ZTERM>Z030</xsd:ZTERM>
          <xsd:PRCTR>PFI0040005</xsd:PRCTR>
          <xsd:ZUONR>REVENUE-AGGPB</xsd:ZUONR>
          <xsd:KOSTL></xsd:KOSTL>
          <xsd:WWPRD></xsd:WWPRD>
          <xsd:KUNNR>5000000000</xsd:KUNNR>
          <xsd:SGTXT>POSPAY AGGREGATOR</xsd:SGTXT>
          <xsd:STATE></xsd:STATE>
        </xsd:ITEM>`;

        // Item kedua (Credit - Pendapatan Pihak Berelasi - Aggregator) - PER DATA
        for (const data of datas) {
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
          <xsd:BKTXT>${BLART}${startDateFormatted}--- REV3 ---</xsd:BKTXT>
          <xsd:BSCHL>50</xsd:BSCHL>
          <xsd:NEWKO>4100200000</xsd:NEWKO>
          <xsd:WRBTR>${data.amount}</xsd:WRBTR>
          <xsd:GSBER>HO00</xsd:GSBER>
          <xsd:ZFBDT>${startDateFormatted}</xsd:ZFBDT>
          <xsd:ZTERM>Z030</xsd:ZTERM>
          <xsd:PRCTR>PFI0040005</xsd:PRCTR>
          <xsd:ZUONR>REVENUE-AGGPB</xsd:ZUONR>
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
        const xmlname = `ZF_Revenue_AGGPB-${startDateFormatted}.xml`;
        const xmlPath = path.join(process.cwd(), 'public', 'sapico', xmlname);
        
        const dir = path.dirname(xmlPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(xmlPath, xml);

        // ✅ API CALL - SOAP 1.1 HEADERS
        let apiResponse: any = null;
        let apiSuccess = false;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const response = await fetch(PRD_ENDPOINT, {
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

            // Parse response - sama persis
            const resultMatch = apiResponse.match(/<ns:return>([\s\S]*?)<\/ns:return>/);
            if (resultMatch) {
              let resultJson = resultMatch[1];
              resultJson = resultJson.replace(/<\/[^>]*>/g, "");

              const jsonData = JSON.parse(resultJson);
              const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

              // Log to database (DB7)
              const queryLog = `
                INSERT INTO log_sapico_deposit(nama_file, response, tanggal, url) 
                VALUES (?, ?, ?, ?)
              `;

              await connection.execute(queryLog, [
                xmlname,
                resultJson,
                timestamp,
                PRD_ENDPOINT
              ]);

              // Check if successful
              if (jsonData[0]?.MESSG === "Document posted successfully") {
                apiSuccess = true;

                // Update flag in sapico_temp
                const queryUpdate = `
                  UPDATE sapico_temp 
                  SET flag = 1, 
                      no_doc = ?, 
                      file = ?
                  WHERE ket = "ZF"
                    AND DATE(tgl_trx) = ?
                    AND flag = 0
                `;

                await connection.execute(queryUpdate, [
                  jsonData[0].BELNR,
                  xmlname,
                  currentDate
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
      message: `Processed ${results.length} dates (${environment})`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate XML ZF (Production)',
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
