/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/features/core/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APIResponse, User } from "@/types/def";
import { RowDataPacket } from "mysql2/promise";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "secret_key";
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 5 * 60 * 1000; // 5 menit

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<{ items: { token: string; user: Omit<User, "password"> } }>>
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
        message: "Username dan password wajib diisi.",
        data: null,
      });
    }

    const db = await connectDB();

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: false,
        code: "401",
        message: "Username atau password salah.",
        data: null,
      });
    }

    const user = rows[0] as User;
    const now = new Date();

    // Cek blokir
    const blockedUntilTime = user.blocked_until ? new Date(user.blocked_until) : null;
    if (blockedUntilTime && blockedUntilTime > now) {
      const minutesLeft = Math.ceil((blockedUntilTime.getTime() - now.getTime()) / 60000);
      return res.status(429).json({
        status: false,
        code: "429",
        message: `Akun diblokir. Coba lagi dalam ${minutesLeft} menit.`,
        data: null,
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const newCount = (user.login_attempts || 0) + 1;
      const newBlockedUntil =
        newCount >= MAX_ATTEMPTS ? new Date(now.getTime() + BLOCK_TIME) : null;

      await db.execute(
        `UPDATE users SET login_attempts = ?, last_attempt = ?, blocked_until = ? WHERE id = ?`,
        [newCount, now, newBlockedUntil, user.id]
      );

      return res.status(401).json({
        status: false,
        code: "401",
        message:
          newCount >= MAX_ATTEMPTS
            ? "Terlalu banyak percobaan gagal. Akun diblokir selama 5 menit."
            : "Username atau password salah.",
        data: null,
      });
    }

    // Reset login attempt
    await db.execute(
      "UPDATE users SET login_attempts = 0, blocked_until = NULL WHERE id = ?",
      [user.id]
    );

    // Buat JWT token
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

    const { password: _, ...userData } = user;

    return res.status(200).json({
      status: true,
      code: "200",
      message: "Login berhasil.",
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
      message: `Internal Server Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      data: null,
    });
  }
}
