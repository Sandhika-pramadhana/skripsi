import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { User } from "@/types/def";

export default async function HandlerUpdateUser(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: false,
            code: "405",
            message: "Only POST requests are allowed",
            data: {}
        });
    }

    const body = req.body as User;

    if (!body.id) {
        return res.status(400).json({
            status: false,
            code: "400",
            message: "User ID is required for update",
            data: {}
        });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets'
            ]
        });

        const sheets = google.sheets({ auth, version: 'v4' });
        const sheetName = "users";

        const range = `${sheetName}!A2:A`;
        const readResult = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: range,
        });

        const rows = readResult.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({
                status: false,
                code: "404",
                message: "User not found",
                data: {}
            });
        }

        const rowIndex = rows.findIndex(row => row[0] === body.id.toString()) + 2;
        if (rowIndex < 2) {
            return res.status(404).json({
                status: false,
                code: "404",
                message: "User not found",
                data: {}
            });
        }

        const updateRange = `${sheetName}!B${rowIndex}:F${rowIndex}`;
        const updateResponse = await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [body.name, body.username, body.password, body.roleId, body.roleName]
                ]
            }
        });

        return res.status(200).json({
            status: true,
            code: "200",
            message: "User updated successfully",
            data: updateResponse.data
        });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
        return res.status(500).json({
            status: false,
            code: "500",
            message: errorMessage,
            data: {}
        });
    }
}
