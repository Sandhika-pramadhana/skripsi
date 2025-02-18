/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverAction, ServerActionError } from "@/actions/action";
import { APIResponse, PaginatedAPIResponse, PaginationParams, User } from "@/types/def";
import axios from "axios";

// Untuk View User
export const getAllUser = serverAction(
  async ({ 
    page = 1, 
    size = 10 
  }: PaginationParams & {
    page?: number;
    size?: number;
  }): Promise<PaginatedAPIResponse<User>> => {
    const res = await axios.post<PaginatedAPIResponse<User>>(
      "/api/user/get",
      { 
        page,
        size,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return res.data;
  },
  "GET_USERS"
);

// Untuk Create User
export const createUser = serverAction(
  async (data: User) => {
    const res = await axios.post<APIResponse<User>>("/api/user/create", data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { status, message, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return res.data;
  },
  "CREATE_USER"
);

export const updateUser = serverAction(
  async (data: User) => {

    const res = await axios.post("/api/user/update", data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });


    const { status, message, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return res.data;
  },
  "UPDATE_USER"
);

// Untuk Hapus User
export const deleteUser = serverAction(
  async (id: number) => {
    const res = await axios.post(`/api/user/delete/${id}`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { status, message, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return res.data;
  },
  "DELETE_USER"
);