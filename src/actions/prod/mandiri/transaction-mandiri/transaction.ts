import axios from "axios";
import { 
  PaginatedAPIResponse, 
  PaginationParams,
  transaction_mandiri,
  TransactionItem_mandiri,
  TransactionFee_mandiri,
  APIResponse
} from "@/types/def";
import { EndpointTransactionMandiri } from "@/types/api";
import { serverAction, ServerActionError } from "../../../action";
import { getToken } from "../../../auth/getToken";

// Type untuk detail transaction (dengan items dan fees)
export type TransactionDetailData = {
  transaction: transaction_mandiri;
  items: TransactionItem_mandiri[];
  fees: TransactionFee_mandiri | null;
};

// 1. GET LIST - untuk pagination (tidak berubah)
export const getListTransactionMandiri = serverAction(
  async (
    params?: PaginationParams & {
      term?: string;
      limit?: number;
    }
  ) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointTransactionMandiri}`;
    const config = {
      params: {
        page: params?.page,
        page_size: params?.page_size,
        term: params?.term,
        limit: params?.limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axios.get<PaginatedAPIResponse<transaction_mandiri>>(url, config);
    const { status, message, data, code } = res.data;
    if (!status) {
      throw new ServerActionError(message, code);
    }
    return data;
  },
  "GET_LIST_TRANSACTION_MANDIRI"
);

// 2. GET BY ID - untuk detail lengkap (BARU)
export const getTransactionMandiriById = serverAction(
  async (id: string | number) => {
    const token = await getToken();
    const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointTransactionMandiri}`;
    const config = {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axios.get<APIResponse<TransactionDetailData>>(url, config);
    const { status, message, data, code } = res.data;
    if (!status) {
      throw new ServerActionError(message, code);
    }
    return data;
  },
  "GET_TRANSACTION_MANDIRI_BY_ID"
);