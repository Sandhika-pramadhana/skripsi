"use server";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverAction, ServerActionError } from "@/actions/action";
import { APIResponse, PaginatedAPIResponse, PaginationParams, Role } from "@/types/def";
import axios from "axios";

// Untuk View Role
export const getListRole = serverAction(
  async ({ 
    page = 1, 
    size = 10 
  }: PaginationParams & {
    page?: number;
    size?: number;
  }): Promise<PaginatedAPIResponse<Role>> => {
    const res = await axios.post<PaginatedAPIResponse<Role>>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role/get`,
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
  "GET_LIST_ROLE"
);

export const getRoles = serverAction(async () => {

  const res = await axios.post<PaginatedAPIResponse<Role>>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role/get`,
    { paging: 0 },
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

  return data.items;
}, "GET_ROLES");

// Untuk Create User
export const createRole = serverAction(
  async (data: Role) => {
    const res = await axios.post<APIResponse<Role>>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role/create`, data, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const { status, message, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return res.data;
  },
  "CREATE_ROLE"
);

// Untuk Update Role
export const updateRole = serverAction(
  async (data : Role) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role/update`, data, {
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
  "UPDATE_ROLE"
);

// Untuk Hapus Role
export const deleteRole = serverAction(
  async (id: number) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role/delete/${id}`, {}, {
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
  "DELETE_ROLE"
);