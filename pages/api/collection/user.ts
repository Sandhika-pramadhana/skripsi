/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB2 } from "@/features/core/lib/db";
import bcrypt from "bcryptjs";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { APIResponse, User, PaginatedAPIResponseBackend } from "@/types/def";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAPIResponseBackend<User> | APIResponse<User>>
) {
  authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      const db = await connectDB2();
      const { id, term } = req.query;

      // ------------------- GET -------------------
      if (req.method === "GET") {
        if (id) {
          if (!/^\d+$/.test(id as string))
            return res.status(400).json({
              status: false,
              code: "400",
              message: "Invalid User ID. Must be numeric.",
              data: null,
            });

          const result = await db.query<User>("SELECT * FROM users WHERE id = $1", [Number(id)]);
          if (result.rows.length === 0)
            return res.status(404).json({
              status: false,
              code: "404",
              message: "User not found.",
              data: null,
            });

          return res.status(200).json({
            status: true,
            code: "200",
            message: "Success get user by ID.",
            data: result.rows[0],
          });
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const page_size = parseInt(req.query.page_size as string, 10) || 25;
        const offset = (page - 1) * page_size;

        let searchCondition = "";
        let searchParams: any[] = [];

        if (term && typeof term === "string") {
          searchCondition = `WHERE name ILIKE $1 OR roleName ILIKE $1 OR username ILIKE $1 OR CAST(role_id AS TEXT) ILIKE $1`;
          searchParams.push(`%${term}%`);
        }

        const totalResult = await db.query<{ total_data: number }>(
          `SELECT COUNT(*)::int AS total_data FROM users ${searchCondition}`,
          searchParams
        );
        const total_data = totalResult.rows[0]?.total_data || 0;

        const dataResult = await db.query<User>(
          `SELECT * FROM users ${searchCondition} LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}`,
          [...searchParams, page_size, offset]
        );

        return res.status(200).json({
          status: true,
          code: "200",
          message: "Success get users.",
          data: {
            items: dataResult.rows,
            pagination: {
              page,
              page_size,
              total_page: Math.max(Math.ceil(total_data / page_size), 1),
              total_data,
              current_page: dataResult.rows.length > 0 ? page : 0,
              current_data: dataResult.rows.length,
            },
          },
        });
      }

      // ------------------- POST -------------------
      if (req.method === "POST") {
        const { name, username, password, role_id, roleName } = req.body;

        if (!name || !username || !password || role_id === undefined || !roleName)
          return res.status(400).json({
            status: false,
            code: "400",
            message: "All fields are required.",
            data: null,
          });

        const exists = await db.query("SELECT id FROM users WHERE username = $1", [username]);
        if (exists.rows.length > 0)
          return res.status(400).json({
            status: false,
            code: "400",
            message: "Username already exists.",
            data: null,
          });

        const hashed = await bcrypt.hash(password, 10);
        await db.query(
          "INSERT INTO users (name, username, password, role_id, roleName) VALUES ($1, $2, $3, $4, $5)",
          [name, username, hashed, Number(role_id), roleName]
        );

        return res.status(201).json({
          status: true,
          code: "201",
          message: "User created successfully.",
          data: null,
        });
      }

      // ------------------- PUT -------------------
      if (req.method === "PUT") {
        if (!id || !/^\d+$/.test(id as string))
          return res.status(400).json({
            status: false,
            code: "400",
            message: "Valid User ID required.",
            data: null,
          });

        const { name, username, password, role_id, roleName } = req.body;

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (name) updateFields.push(`name = $${updateValues.length + 1}`), updateValues.push(name);
        if (username) updateFields.push(`username = $${updateValues.length + 1}`), updateValues.push(username);
        if (password)
          updateFields.push(`password = $${updateValues.length + 1}`),
            updateValues.push(await bcrypt.hash(password, 10));
        if (role_id !== undefined)
          updateFields.push(`role_id = $${updateValues.length + 1}`),
            updateValues.push(Number(role_id));
        if (roleName) updateFields.push(`roleName = $${updateValues.length + 1}`), updateValues.push(roleName);

        if (updateFields.length === 0)
          return res.status(400).json({
            status: false,
            code: "400",
            message: "At least one field required.",
            data: null,
          });

        updateValues.push(Number(id));
        const result = await db.query(
          `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${updateValues.length}`,
          updateValues
        );

        if (result.rowCount === 0)
          return res.status(404).json({
            status: false,
            code: "404",
            message: "User not found.",
            data: null,
          });

        return res.status(200).json({
          status: true,
          code: "200",
          message: "User updated successfully.",
          data: null,
        });
      }

      // ------------------- DELETE -------------------
      if (req.method === "DELETE") {
        if (!id || !/^\d+$/.test(id as string))
          return res.status(400).json({
            status: false,
            code: "400",
            message: "Valid User ID required.",
            data: null,
          });

        const result = await db.query("DELETE FROM users WHERE id = $1", [Number(id)]);
        if (result.rowCount === 0)
          return res.status(404).json({
            status: false,
            code: "404",
            message: "User not found.",
            data: null,
          });

        return res.status(200).json({
          status: true,
          code: "200",
          message: "User deleted successfully.",
          data: null,
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        code: "500",
        message: "Internal server error",
        data: null,
      });
    }
  });
}
