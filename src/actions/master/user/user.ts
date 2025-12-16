/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverAction, ServerActionError } from "@/actions/action";
import { getToken } from "@/actions/auth/getToken";
import { EndpointUser } from "@/types/api";
import { APIResponse, PaginatedAPIResponse, PaginationParams, User } from "@/types/def";
import axios from "axios";


export const getUsers = serverAction(
  async (params?: PaginationParams) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointUser}`;
    const config = {
      params: {
        page: params?.page,
        page_size: params?.page_size,
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    const res = await axios.get<PaginatedAPIResponse<User>>(url, config);

    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data;
  },
  "GET_USERS"
);

// 🔹 Create User
export const createUser = serverAction(
  async (data: User) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointUser}`;
    const requestData = {
      name: data.name,
      username: data.username,
      password: data.password,
      role_id: data.role_id,
      roleName: data.roleName
    };
    const res = await axios.post<APIResponse<User>>(url, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
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

// 🔹 Update User
export const updateUser = serverAction(
  async (data: User) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointUser}?id=${data.id}`;
    const requestData = {
      name: data.name,
      username: data.username,
      password: data.password,
      role_id: data.role_id,
      roleName: data.roleName
    };
    const res = await axios.put<APIResponse<User>>(url, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
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

// 🔹 Delete User
export const deleteUser = serverAction(
  async (id: number) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointUser}?id=${id}`;

    const res = await axios.delete<APIResponse<User>>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
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
