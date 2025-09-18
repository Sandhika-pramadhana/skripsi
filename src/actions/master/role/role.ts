/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverAction, ServerActionError } from "@/actions/action";
import { getToken } from "@/actions/auth/getToken";
import { APIResponse, PaginatedAPIResponse } from "@/types/def";
import axios from "axios";
import { EndpointRole } from "@/types/api";


// 🔹 Get Roles
export const getRoles = serverAction(
  async (params?: { page?: number; page_size?: number }) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${EndpointRole}`;
    const config = {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const res = await axios.get<PaginatedAPIResponse<{ roleName: string }>>( url,config);

    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data;
  },
  "GET_ROLES"
);

// 🔹 Create Role
export const createRole = serverAction(
  async (roleName: string) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${EndpointRole}`;

    const requestData = { roleName };

    const res = await axios.post<APIResponse<any>>(url, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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

// 🔹 Update Role
export const updateRole = serverAction(
  async (id: number, roleName: string) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${EndpointRole}?id=${id}`;

    const requestData = { roleName };

    const res = await axios.put<APIResponse<any>>(url, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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

// 🔹 Delete Role
export const deleteRole = serverAction(
  async (id: number) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointRole}?id=${id}`;

    const res = await axios.delete<APIResponse<any>>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
