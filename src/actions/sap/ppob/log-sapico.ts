import axios from "axios";
import { PaginatedAPIResponse, PaginationParams, log_sapico } from "@/types/def";
import { EndpointLogSapicoPpob } from "@/types/api";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

export const getListLogSapico = serverAction(
  async (
    params?: PaginationParams & {
      term?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointLogSapicoPpob}`;

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

    const res = await axios.get<PaginatedAPIResponse<log_sapico>>(url, config);
    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data;
  },
  "GET_LIST_LOG_SAPICO"
);
