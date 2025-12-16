/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogoutResponse } from "@/types/def";
import { serverAction, ServerActionError } from "../action";
import axios from "axios";
import Cookies from "js-cookie";
import { EndpointLogout } from "@/types/api";

export const LogoutUser = serverAction(
  async () => {
    try {
      const token = Cookies.get("token-auth");
      
      const res = await axios.post<LogoutResponse>(
        `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointLogout}`,
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
      Cookies.remove("role_id");
      Cookies.remove("roleName");

      return { status, message, code };
    } catch (error) {
      // Clear cookies even if API call fails
      Cookies.remove("token-auth");
      Cookies.remove("user_id");
      Cookies.remove("name");
      Cookies.remove("username");
      Cookies.remove("role_id");
      Cookies.remove("roleName");
      
      throw new ServerActionError("Terjadi kesalahan saat logout", "500");
    }
  },
  "LOGOUT_USER"
);
