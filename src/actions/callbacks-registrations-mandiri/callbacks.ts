import axios from "axios";
import { PaginatedAPIResponse, PaginationParams, callback_registrations } from "@/types/def";
import { EndpointCallbacksRegistrationsMandiri } from "@/types/api";
import { serverAction, ServerActionError } from "../action";
import { getToken } from "../auth/getToken";


export const getListCallbacksRegistrationsMandiri = serverAction(
  async (
    params?: PaginationParams & {
      term?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointCallbacksRegistrationsMandiri}`;

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

    const res = await axios.get<PaginatedAPIResponse<callback_registrations>>(url, config);
    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data;
  },
  "GET_LIST_CALLBACKS_REGISTRATIONS_MANDIRI"
);