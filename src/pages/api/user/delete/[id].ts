/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function deleteRole(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, code: "405", message: "Method Not Allowed" });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ status: false, code: "400", message: "Role ID is required" });
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ auth, version: 'v4' });
    const sheetName = "roles";

    try {
        const fetchRows = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `${sheetName}!A:A`
        });

        const rows = fetchRows.data.values || [];
        let rowIndex = rows.findIndex(row => row[0] === String(id));
        if (rowIndex === -1) {
            return res.status(404).json({ status: false, code: "404", message: "Role not found" });
        }

        rowIndex += 1;

        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0, 
                            dimension: "ROWS",
                            startIndex: rowIndex - 1,
                            endIndex: rowIndex
                        }
                    }
                }]
            }
        });

        return res.status(200).json({ status: true, code: "200", message: "Role deleted successfully" });

    } catch (error) {
        return res.status(500).json({
            status: false,
            code: "500",
            message: "Failed to delete the role",
            error: error
        });
    }
}
