"use server";

import { serverAction, ServerActionError } from "@/actions/action";
import { APIResponse, PaginatedAPIResponse, PaginationParams, TrafficReportMyTsel } from "@/types/def";
import axios from "axios";

function paginateItems<T>(items: T[], currentPage: number, pageSize: number): T[] {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}

// Ambil API Key langsung dari .env
const API_KEY = process.env.NEXT_PUBLIC_X_API_TOKEN ?? "";

// Fungsi untuk Get List Transaksi
export const getListTraffic = serverAction(
  async (params?: PaginationParams & { startDate?: string; endDate?: string }) => {
    const res = await axios.get<PaginatedAPIResponse<TrafficReportMyTsel>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/report/mtsel/traffic`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
      }
    );

    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data ?? { items: [], pagination: { current_page: 1, per_page: 0, total: 0, total_page: 0 } };
  },
  "GET_LIST_TRAFFIC_REPORT_MYTSEL"
);

// Untuk Get Data Rekap Traffic
export const getGraphTraffic = serverAction(
  async (params?: { startDate?: string; endDate?: string; page?: number; size?: number }) => {
    const res = await axios.get<PaginatedAPIResponse<TrafficReportMyTsel>>(
      `${process.env.NEXT_PUBLIC_API_URL}/kurir/report/mtsel/traffic`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
      }
    );

    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    const items = data?.items ?? []; // fix: kalau null jadi []
    const size = params?.size || items.length || 1; // biar ga division by zero
    const currentPage = params?.page || 1;

    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const paginatedItems = paginateItems(items, currentPage, size);

    return {
      items: paginatedItems,
      pagination: {
        current_page: currentPage,
        per_page: size,
        total: items.length,
        total_page: Math.ceil(items.length / size),
      },
    };
  },
  "GET_TRAFFIC_GRAPH_LINE"
);

export const createTraffic = serverAction(
  async (data: TrafficReportMyTsel) => {
    const res = await axios.post<APIResponse<TrafficReportMyTsel>>(
      `${process.env.NEXT_PUBLIC_API_URL}/kurir/report/mtsel/traffic`,
      data,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, message, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    return res.data;
  },
  "CREATE_TRAFFIC"
);
