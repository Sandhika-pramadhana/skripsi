import axios from "axios";
import { PaginatedAPIResponse, PaginationParams, sapico } from "@/types/def";
import { EndpointSapicoPpob } from "@/types/api";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

export const getListSapico = serverAction(
  async (
    params?: PaginationParams & {
      term?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointSapicoPpob}`;
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
    const res = await axios.get<PaginatedAPIResponse<sapico>>(url, config);
    const { status, message, data, code } = res.data;
    if (!status) {
      throw new ServerActionError(message, code);
    }
    return data;
  },
  "GET_LIST_SAPICO"
);