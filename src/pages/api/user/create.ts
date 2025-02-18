import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import CryptoJS from 'crypto-js';
import { User } from "@/types/def";

export default async function HandlerSubmitContact(
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
    const passphrase = process.env.ENCRYPTION_KEY;
    if (!passphrase) {
        return res.status(500).json({
            status: false,
            code: "500",
            message: "Encryption key is missing",
            data: {}
        });
    }

    const encryptedPassword = CryptoJS.AES.encrypt(body.password, passphrase).toString();

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets'
            ]
        });

        const sheets = google.sheets({ auth, version: 'v4' });
        const sheetName = "users";

        const getLastRow = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `${sheetName}!A2:A`,
        });

        const lastId = getLastRow.data.values ? getLastRow.data.values.length + 1 : 1;

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `${sheetName}!A2:F`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [lastId, body.name, body.username, encryptedPassword, body.roleId, body.roleName]
                ]
            }
        });

        return res.status(200).json({
            status: true,
            code: "200",
            message: "OK",
            data: response.data
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
