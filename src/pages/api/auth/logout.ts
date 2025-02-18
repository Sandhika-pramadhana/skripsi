import { destroyCookie } from 'nookies';
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, code: 405, message: "Method Not Allowed" });
  }

  try {
    destroyCookie({ res }, 'theme', { path: '/' });
    destroyCookie({ res }, 'accessToken', { path: '/' });
    res.status(200).json({
      status: true,
      code: 200,
      message: "OK"
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      message: `Internal Server Error. ${error}`
    });
  }
}
