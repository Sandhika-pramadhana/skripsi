"use server";

import { destroyCookie } from "nookies";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      code: 405,
      message: "Method Not Allowed. Only POST is supported.",
    });
  }

  try {
    destroyCookie({ res }, "accessToken", { path: "/" });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Logout successful.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: `Internal Server Error. ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
