import { NextApiRequest, NextApiResponse } from "next";
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: false,
      code: "405",
      message: "Method Not Allowed"
    });
  }

  const { username, password } = req.body;
  const passphrase = process.env.ENCRYPTION_KEY;
  if (!passphrase) {
    return res.status(500).json({
      status: false,
      code: "500",
      message: "Encryption key is missing"
    });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ auth, version: 'v4' });
    const sheetName = "users";
    const range = `${sheetName}!A2:F`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range
    });

    const rows = response.data.values ?? [];
    const userRow = rows.find(row => row[2] === username);

    if (!userRow) {
      return res.status(404).json({
        status: false,
        code: "404",
        message: "User not found"
      });
    }

    const decryptedPassword = CryptoJS.AES.decrypt(userRow[3], passphrase).toString(CryptoJS.enc.Utf8);

    if (password !== decryptedPassword) {
      return res.status(401).json({
        status: false,
        code: "401",
        message: "Invalid credentials"
      });
    }

    const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || 'default_secret_key';

    const accessToken = jwt.sign(
      { id: userRow[0], name: userRow[1], username: userRow[2], roleId: userRow[4], roleName: userRow[5] },
      jwtSecret,
      { expiresIn: '3h' }
    );

    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: 10800
    };
    const serialized = serialize('accessToken', accessToken, cookieOptions);
    res.setHeader('Set-Cookie', serialized);

    return res.status(200).json({
      status: true,
      code: "200",
      message: "OK",
      data: {
        accessToken,
        items: {
          id: userRow[0],
          name: userRow[1],
          username: userRow[2],
          roleId: userRow[4],
          roleName: userRow[5]
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: "500",
      message: `Internal Server Error. ${error}`
    });
  }
}
