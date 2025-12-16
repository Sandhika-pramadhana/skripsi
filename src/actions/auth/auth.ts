/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIResponse, Credentials, LoginResponse } from "@/types/def";
import { serverAction, ServerActionError } from "../action";
import axios from "axios";
import Cookies from "js-cookie";
import { EndpointLogin } from "@/types/api";

export const LoginUser = serverAction(
  async (credentials: Credentials, useDomain: boolean = true) => {
    try {
      const baseUrl = useDomain
      ? process.env.NEXT_PUBLIC_API_URL_1 
      : process.env.NEXT_PUBLIC_API_URL_IP; 
      const res = await axios.post<APIResponse<LoginResponse>>(
        `${baseUrl}/${EndpointLogin}`,
        credentials,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const { status, message, code, data } = res.data;
      if (!status) {
        throw new ServerActionError(message, code);
      }

      const token = data?.items?.token;
      const user = data?.items?.user;

      if (!token || !user) {
        throw new ServerActionError("Invalid response structure", "500");
      }

      // Set cookie
      Cookies.set("token-auth", token, { expires: 1 });
      Cookies.set("user_id", user.id.toString(), { expires: 1 });
      Cookies.set("name", user.name, { expires: 1 });
      Cookies.set("username", user.username, { expires: 1 });
      Cookies.set("role_id", user.role_id.toString(), { expires: 1 });
      Cookies.set("roleName", user.roleName, { expires: 1 });

      return { success: true, message: "Login berhasil" };
    } catch (error) {
      throw new ServerActionError("Terjadi kesalahan", "500");
    }
  },
  "LOGIN_USER"
);
