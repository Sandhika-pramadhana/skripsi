/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB2 } from "@/features/core/lib/db"; // pastikan connectDB2 pakai 'pg'
import { PaginatedAPIResponseBackend, APIResponse, Role } from "@/types/def";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAPIResponseBackend<Role> | APIResponse<Role>>
) {
  authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      const db = await connectDB2();
      const { id, term } = req.query;

      // GET
      if (req.method === "GET") {
        if (id) {
          if (!/^\d+$/.test(id as string)) {
            return res.status(400).json({
              status: false,
              code: "400",
              message: "Invalid Role ID. Must be numeric.",
              data: null,
            });
          }

          const result = await db.query<Role>(
            "SELECT * FROM roles WHERE id = $1",
            [Number(id)]
          );

          if (result.rows.length === 0) {
            return res.status(404).json({
              status: false,
              code: "404",
              message: "Role not found.",
              data: null,
            });
          }

          return res.status(200).json({
            status: true,
            code: "200",
            message: "Success get role by ID.",
            data: result.rows[0],
          });
        }

        // Pagination
        const page = parseInt(req.query.page as string, 10) || 1;
        const page_size = parseInt(req.query.page_size as string, 10) || 25;
        const validatedPage = page < 1 ? 1 : page;
        const validatedPageSize =
          page_size < 1 || page_size > 100 ? 25 : page_size;
        const offset = (validatedPage - 1) * validatedPageSize;

        let searchCondition = "";
        const searchParams: any[] = [];

        if (term && typeof term === "string") {
          searchCondition = `WHERE "roleName" ILIKE $1`;
          searchParams.push(`%${term}%`);
        }

        const totalQuery = `SELECT COUNT(*) AS total_data FROM roles ${searchCondition}`;
        const totalResult = await db.query(totalQuery, searchParams);
        const total_data = parseInt(totalResult.rows[0]?.total_data || "0", 10);

        const dataQuery = `
          SELECT * FROM roles 
          ${searchCondition}
          LIMIT $${searchParams.length + 1}
          OFFSET $${searchParams.length + 2}
        `;
        const result = await db.query<Role>(
          dataQuery,
          [...searchParams, validatedPageSize, offset]
        );

        const total_page = Math.max(
          Math.ceil(total_data / validatedPageSize),
          1
        );

        return res.status(200).json({
          status: true,
          code: "200",
          message: "Success get roles.",
          data: {
            items: result.rows,
            pagination: {
              page: validatedPage,
              page_size: validatedPageSize,
              total_page,
              total_data,
              current_page: result.rows.length > 0 ? validatedPage : 0,
              current_data: result.rows.length,
            },
          },
        });
      }

      // POST
      if (req.method === "POST") {
        const { roleName } = req.body;

        if (!roleName) {
          return res.status(400).json({
            status: false,
            code: "400",
            message: "roleName is required.",
            data: null,
          });
        }

        await db.query(
          'INSERT INTO roles ("roleName", created_at, updated_at) VALUES ($1, NOW(), NOW())',
          [roleName]
        );

        return res.status(201).json({
          status: true,
          code: "201",
          message: "Role created successfully.",
          data: null,
        });
      }

      // PUT
      if (req.method === "PUT") {
        if (!id || !/^\d+$/.test(id as string)) {
          return res.status(400).json({
            status: false,
            code: "400",
            message: "Valid Role ID is required for update.",
            data: null,
          });
        }

        const { roleName } = req.body;

        if (!roleName) {
          return res.status(400).json({
            status: false,
            code: "400",
            message: "roleName is required.",
            data: null,
          });
        }

        const result = await db.query(
          'UPDATE roles SET "roleName" = $1, updated_at = NOW() WHERE id = $2',
          [roleName, Number(id)]
        );

        if (result.rowCount === 0) {
          return res.status(404).json({
            status: false,
            code: "404",
            message: "Role not found or no changes made.",
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: "200",
          message: "Role updated successfully.",
          data: null,
        });
      }

      // DELETE
      if (req.method === "DELETE") {
        if (!id || !/^\d+$/.test(id as string)) {
          return res.status(400).json({
            status: false,
            code: "400",
            message: "Valid Role ID is required for deletion.",
            data: null,
          });
        }

        const result = await db.query("DELETE FROM roles WHERE id = $1", [
          Number(id),
        ]);

        if (result.rowCount === 0) {
          return res.status(404).json({
            status: false,
            code: "404",
            message: "Role not found or already deleted.",
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: "200",
          message: "Role deleted successfully.",
          data: null,
        });
      }

      // Method not allowed
      return res.status(405).json({
        status: false,
        code: "405",
        message: "Method not allowed",
        data: null,
      });
    } catch (error: any) {
      console.error("Error in Role API handler:", error);
      return res.status(500).json({
        status: false,
        code: "500",
        message: "Internal server error",
        data: null,
      });
    }
  });
}
