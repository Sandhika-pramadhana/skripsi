import axios from "axios";
import { PaginatedAPIResponse, PaginationParams, LogApis } from "@/types/def";
import { EndpointLogApis } from "@/types/api";
import { serverAction, ServerActionError } from "../action";
import { getToken } from "../auth/getToken";

export const getListLogApis = serverAction(
  async (
    params?: PaginationParams & {
      term?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointLogApis}`;

    const config = {
      params: {
        page: params?.page,
        page_size: params?.page_size,
        term: params?.term,
        startDate: params?.startDate,
        endDate: params?.endDate,
        limit: params?.limit, 
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const res = await axios.get<PaginatedAPIResponse<LogApis>>(url, config);
    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data;
  },
  "GET_LIST_LOG_APIS"
);
