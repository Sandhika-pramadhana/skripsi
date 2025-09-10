import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'secret_key';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; name: string; username: string; role_id: number };
}

export function authenticateToken(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: false,
      code: "401",
      message: "Unauthorized. Token is required.",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; name: string; username: string; role_id: number };
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({
      status: false,
      code: "403",
      message: `Forbidden. Invalid or expired token: ${error}`,
      data: null,
    });
  }
}
