/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB2 } from '@/features/core/lib/db';
import bcrypt from 'bcryptjs';
import { PaginatedAPIResponseBackend, APIResponse, User } from '@/types/def';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAPIResponseBackend<User> | APIResponse<User>>
) {
  authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      const db = await connectDB2();
      const { id, term } = req.query;

      // GET REQUEST
      if (req.method === 'GET') {
        if (id) {
          if (!/^\d+$/.test(id as string)) {
            return res.status(400).json({
              status: false,
              code: '400',
              message: 'Invalid User ID. Must be numeric.',
              data: null,
            });
          }

          const result = await db.query<User>(
            'SELECT * FROM users WHERE id = $1',
            [Number(id)]
          );

          if (result.rows.length === 0) {
            return res.status(404).json({
              status: false,
              code: '404',
              message: 'User not found.',
              data: null,
            });
          }

          return res.status(200).json({
            status: true,
            code: '200',
            message: 'Success get user by ID.',
            data: result.rows[0],
          });
        }

        // Pagination + Search
        const page = parseInt(req.query.page as string, 10) || 1;
        const page_size = parseInt(req.query.page_size as string, 10) || 25;
        const validatedPage = page < 1 ? 1 : page;
        const validatedPageSize =
          page_size < 1 || page_size > 100 ? 25 : page_size;
        const offset = (validatedPage - 1) * validatedPageSize;

        let searchCondition = '';
        const searchParams: any[] = [];

        if (term && typeof term === 'string') {
          searchCondition = `
            WHERE name ILIKE $1 OR 
                  "roleName" ILIKE $1 OR
                  username ILIKE $1 OR
                  CAST(role_id AS TEXT) ILIKE $1
          `;
          searchParams.push(`%${term}%`);
        }

        const totalQuery = `SELECT COUNT(*) AS total_data FROM users ${searchCondition}`;
        const totalResult = await db.query(totalQuery, searchParams);
        const total_data = parseInt(totalResult.rows[0]?.total_data || '0', 10);

        const dataQuery = `
          SELECT * FROM users
          ${searchCondition}
          LIMIT $${searchParams.length + 1}
          OFFSET $${searchParams.length + 2}
        `;
        const result = await db.query<User>(
          dataQuery,
          [...searchParams, validatedPageSize, offset]
        );

        const total_page = Math.max(Math.ceil(total_data / validatedPageSize), 1);

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'Success get users.',
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

      // POST REQUEST
      if (req.method === 'POST') {
        const { name, username, password, role_id, roleName } = req.body;

        if (!name || !username || !password || role_id === undefined || !roleName) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'All fields (name, username, password, role_id, roleName) are required.',
            data: null,
          });
        }

        if (typeof role_id !== 'number' && !/^\d+$/.test(role_id.toString())) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'Invalid role_id. Must be numeric.',
            data: null,
          });
        }

        // Check if username exists
        const existingUser = await db.query(
          'SELECT id FROM users WHERE username = $1',
          [username]
        );

        if (existingUser.rows.length > 0) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'Username already exists.',
            data: null,
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
          'INSERT INTO users (name, username, password, role_id, "roleName", created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [name, username, hashedPassword, Number(role_id), roleName]
        );

        return res.status(201).json({
          status: true,
          code: '201',
          message: 'User created successfully.',
          data: null,
        });
      }

      // PUT REQUEST
      if (req.method === 'PUT') {
        if (!id || !/^\d+$/.test(id as string)) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'Valid User ID is required for update.',
            data: null,
          });
        }

        const { name, username, password, role_id, roleName } = req.body;

        if (!name && !username && !password && !role_id && !roleName) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'At least one field is required for update.',
            data: null,
          });
        }

        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        if (name) {
          updateFields.push(`name = $${paramIndex++}`);
          updateValues.push(name);
        }
        if (username) {
          updateFields.push(`username = $${paramIndex++}`);
          updateValues.push(username);
        }
        if (password) {
          const hashed = await bcrypt.hash(password, 10);
          updateFields.push(`password = $${paramIndex++}`);
          updateValues.push(hashed);
        }
        if (role_id !== undefined) {
          updateFields.push(`role_id = $${paramIndex++}`);
          updateValues.push(Number(role_id));
        }
        if (roleName) {
          updateFields.push(`"roleName" = $${paramIndex++}`);
          updateValues.push(roleName);
        }

        updateFields.push(`updated_at = NOW()`);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
        updateValues.push(Number(id));

        const result = await db.query(query, updateValues);

        if (result.rowCount === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'User not found or no changes made.',
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'User updated successfully.',
          data: null,
        });
      }

      // DELETE REQUEST
      if (req.method === 'DELETE') {
        if (!id || !/^\d+$/.test(id as string)) {
          return res.status(400).json({
            status: false,
            code: '400',
            message: 'Valid User ID is required for deletion.',
            data: null,
          });
        }

        const result = await db.query('DELETE FROM users WHERE id = $1', [
          Number(id),
        ]);

        if (result.rowCount === 0) {
          return res.status(404).json({
            status: false,
            code: '404',
            message: 'User not found or already deleted.',
            data: null,
          });
        }

        return res.status(200).json({
          status: true,
          code: '200',
          message: 'User deleted successfully.',
          data: null,
        });
      }

      // Invalid Method
      return res.status(405).json({
        status: false,
        code: '405',
        message: 'Method not allowed',
        data: null,
      });
    } catch (error: any) {
      console.error('Error in API handler:', error);
      return res.status(500).json({
        status: false,
        code: '500',
        message: 'Internal server error',
        data: null,
      });
    }
  });
}
