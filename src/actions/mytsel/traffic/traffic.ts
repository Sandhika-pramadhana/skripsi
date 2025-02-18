import { serverAction, ServerActionError } from "@/actions/action";
import { getApiToken } from "@/actions/auth/getToken";
import { APIResponse, PaginatedAPIResponse, PaginationParams, TrafficReportMyTsel } from "@/types/def";
import axios from "axios";

function paginateItems<T>(items: T[], currentPage: number, pageSize: number): T[] {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }

// Fungsi untuk Get List Transaksi
export const getListTraffic = serverAction(
    async (params?: PaginationParams & { startDate?: string; endDate?: string }) => {
      const token = await getApiToken();
  
      const res = await axios.get<PaginatedAPIResponse<TrafficReportMyTsel>>(
        `${process.env.NEXT_PUBLIC_API_URL}/kurir/report/mtsel/traffic`,
        {
          params,
          headers: {
            "x-api-key": token,
            'Accept': 'application/json'
          },
        }
      );
  
      const { status, message, data, code } = res.data;

      if (!status) {
        throw new ServerActionError(message, code);
      }

    return data;
    
    },
  
    "GET_LIST_TRAFFIC_REPORT_MYTSEL"
  );

// Untuk Get Data Rekap Traffic
export const getGraphTraffic = serverAction(
  async (params?: { startDate?: string; endDate?: string; page?: number; size?: number; }) => {
    const token = await getApiToken();

    const res = await axios.get<PaginatedAPIResponse<TrafficReportMyTsel>>(
      `${process.env.NEXT_PUBLIC_API_URL}/kurir/report/mtsel/traffic`,
      {
        params,
        headers: {
          "x-api-key": token,
          'Accept': 'application/json'
        },
      }
    );

    const { status, message, data, code } = res.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }
    const size = data.items.length;
    const currentPage = params?.page || 1;
    
    data.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const paginatedItems = paginateItems(data.items, currentPage, size);

    return {
      items: paginatedItems,
      pagination: {
        current_page: currentPage,
        per_page: size,
        total: data.items.length,
        total_page: Math.ceil(data.items.length / size),
      }
    };
  },
  "GET_TRAFFIC_GRAPH_LINE"
);

export const createTraffic = serverAction(async (data: TrafficReportMyTsel) => {
  const token = await getApiToken();

  const res = await axios.post<APIResponse<TrafficReportMyTsel>>(
    `${process.env.NEXT_PUBLIC_API_URL}/kurir/report/mtsel/traffic`,
    data,
    {
      headers: {
        "x-api-key": token,
        'Content-Type': 'application/json'
      },
    }
  );

  const { status, message, code } = res.data;

  if (!status) {
    throw new ServerActionError(message, code);
  }

  return res.data;
}, "CREATE_TRAFFIC");