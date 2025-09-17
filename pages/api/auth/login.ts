/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB2 } from "@/features/core/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APIResponse, User } from "@/types/def";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "secret_key";

// Function Handler for Login
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    APIResponse<{ items: { token: string; user: Omit<User, "password"> } }>
  >
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      code: "405",
      message: "Method Not Allowed. Only POST is supported.",
      data: null,
    });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: false,
        code: "400",
        message: "Username and password are required.",
        data: null,
      });
    }

    const db = await connectDB2();

    const result = await db.query<User>(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(401).json({
        status: false,
        code: "401",
        message: "Invalid username or password.",
        data: null,
      });
    }

    const user = rows[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        code: "401",
        message: "Invalid username or password.",
        data: null,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        role_id: user.role_id,
      },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    // Hapus password dari response
    const { password: _, ...userData } = user;

    return res.status(200).json({
      status: true,
      code: "200",
      message: "Login successful.",
      data: {
        items: {
          token,
          user: userData,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      code: "500",
      message: `Internal Server Error, ${
        error instanceof Error ? error.message : String(error)
      }`,
      data: null,
    });
  }
}
