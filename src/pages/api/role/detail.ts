import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function getRoleDetail(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { no } = req.query;

  if (!no) {
    return res.status(400).json({ error: "Role ID is required" });
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ auth, version: 'v4' });
  const sheetName = "roles";

  try {
    const range = `${sheetName}!A1:C`;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
    });

    const rows = result.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No roles found" });
    }

    const role = rows.find(row => row[0] === no);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    return res.status(200).json({
      no: role[0],
      roleId: role[1],
      roleName: role[2],
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
