/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIResponse, Credentials, LoginResponse, LogoutResponse, User } from '@/types/def';
import userItems from "@/data/user.json";
import axios from 'axios';
import { serverAction, ServerActionError } from '../action';

// Function untuk login
export async function verifyUser(username: string, password: string): Promise<boolean> {
    try {
        const users: User[] = userItems;
        return users.some(user => user.username === username && user.password === password);
    } catch (error) {
        return false;
    }
}

export const LoginUser = serverAction(
    async (credentials: Credentials) => {
      const res = await axios.post<APIResponse<LoginResponse>>("/api/auth/login", credentials, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      const { status, message, code, data } = res.data;
  
      if (!status) {
        throw new ServerActionError(message, code);
      }
  
      return data;
    },
    "LOGIN_USER"
);

export const LogoutUser = serverAction(
  async () => {
    const res = await axios.post<LogoutResponse>("/api/auth/logout", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const { status, message, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return res;
  },
  "LOGOUT_USER"
);