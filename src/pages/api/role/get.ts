import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function getRoleData(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, code: "405", message: "Method Not Allowed" });
    }

    // Menangani data paging dari body request
    const { page = 1, size = 10 } = req.body;

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ auth, version: 'v4' });
    const sheetName = "roles";
    const startRow = ((page - 1) * size) + 2;
    const endRow = startRow + size - 1;
    const range = `${sheetName}!A${startRow}:C${endRow}`;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: range,
        });

        const items = response.data.values?.map((row) => ({
            id: row[0],
            roleId: row[1],
            roleName: row[2],
        })) || [];

        const total = items.length;
        const count = items.length;
        const per_page = size;
        const current_page = page;
        const total_pages = Math.ceil(total / per_page);

        const pagination = {
            total,
            count,
            per_page,
            current_page,
            total_pages
        };

        return res.status(200).json({
            status: true,
            code: "200",
            message: "OK",
            data: {
                items,
                pagination
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            code: "500",
            message: "Failed to retrieve data",
            error
        });
    }
}