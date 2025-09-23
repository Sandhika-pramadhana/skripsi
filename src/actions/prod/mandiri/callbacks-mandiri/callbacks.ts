import axios from "axios";
import { PaginatedAPIResponse, PaginationParams, callbacks } from "@/types/def";
import { EndpointCallbacksMandiri } from "@/types/api";
import { serverAction, ServerActionError } from "../../../action";
import { getToken } from "../../../auth/getToken";


export const getListCallbacksMandiri = serverAction(
  async (
    params?: PaginationParams & {
      term?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointCallbacksMandiri}`;

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

    const res = await axios.get<PaginatedAPIResponse<callbacks>>(url, config);
    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data;
  },
  "GET_LIST_CALLBACKS_MANDIRI"
);