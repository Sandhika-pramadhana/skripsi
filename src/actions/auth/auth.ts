/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIResponse, Credentials, LoginResponse, LogoutResponse} from "@/types/def";
import { serverAction, ServerActionError } from "../action";
import axios from "axios";
import Cookies from "js-cookie";
import { EndpointLogin, EndpointLogout } from "@/types/api";

export const LoginUser = serverAction(
  async (credentials: Credentials) => {
    try {
      const res = await axios.post<APIResponse<LoginResponse>>(
        `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointLogin}`,
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

export const LogoutUser = serverAction(
  async () => {
    try {
      const token = Cookies.get("token-auth");
      
      const res = await axios.post<LogoutResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL_1}/${EndpointLogout}`,
        {},
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const { status, message, code } = res.data;
      if (!status) {
        throw new ServerActionError(message, code);
      }

      // Clear all authentication cookies
      Cookies.remove("token-auth");
      Cookies.remove("user_id");
      Cookies.remove("name");
      Cookies.remove("username");
      Cookies.remove("roleId");

      return { status, message, code };
    } catch (error) {
      // Clear cookies even if API call fails
      Cookies.remove("token-auth");
      Cookies.remove("user_id");
      Cookies.remove("name");
      Cookies.remove("username");
      Cookies.remove("roleId");
      
      throw new ServerActionError("Terjadi kesalahan saat logout", "500");
    }
  },
  "LOGOUT_USER"
);
