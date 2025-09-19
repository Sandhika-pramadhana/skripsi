"use server";

import { 
  ListTransactionData, 
  PaginatedAPIResponse, 
  GlobalData, 
  APIResponse, 
  BookingData, 
  TransactionData 
} from "@/types/def";
import axios from "axios";
import { serverAction, ServerActionError } from "../action";
import moment from 'moment';

const API_KEY = process.env.NEXT_PUBLIC_X_API_TOKEN ?? ""; // ✅ konsisten pakai API_KEY

interface ResultBookTrx {
  [date: string]: {
    booking: number;
    transaction: number;
  };
}

// Fungsi untuk Pagination
function paginateItems<T>(items: T[], currentPage: number, pageSize: number): T[] {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}

// Fungsi helper untuk ambil data berdasarkan statusName
function getCumulativeByStatus(transactions: ListTransactionData[]): { statusName: string; count: number }[] {
  const statusCounts: { [key: string]: number } = {};
  transactions.forEach(transaction => {
    statusCounts[transaction.statusName] = (statusCounts[transaction.statusName] ?? 0) + 1;
  });
  return Object.entries(statusCounts).map(([statusName, count]) => ({
    statusName,
    count
  }));
}

// Fungsi untuk Get List Transaksi
export const getListTransaction = serverAction(
  async (params?: { term?: string; startDate?: string; endDate?: string; page?: number; size?: number }) => {
    const res = await axios.get<PaginatedAPIResponse<ListTransactionData>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/dashboard/transaction/list`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
      }
    );

    const { status, message, data, code } = res.data;

    if (!status) throw new ServerActionError(message, code);

    const items = data?.items ?? [];
    const size = params?.size || 10;
    const currentPage = params?.page || 1;
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
  "GET_LIST_TRANSACTION"
);

// Untuk get data di grafik transaksi
export const getGraphTrx = serverAction(
  async (params?: { startDate?: string; endDate?: string }) => {
    const response = await axios.get<APIResponse<GlobalData>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/dashboard/statistic/transaction`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const { status, message, data, code } = response.data;
    if (!status) throw new ServerActionError(message, code);

    const trxData = data?.transaction ?? [];
    trxData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulativeTrx = 0;
    return trxData.map(item => {
      cumulativeTrx += item.count;
      return {
        ...item,
        JML_Trx: item.count,
        Running_SUM_JML_Trx: cumulativeTrx,
      };
    });
  },
  "GET_TRANSACTION_GRAPH"
);

// Untuk get data berdasarkan StatusName
export const getCumulativeTransactionStatus = serverAction(
  async (params?: { startDate?: string; endDate?: string; page?: number; size?: number }) => {
    const res = await axios.get<PaginatedAPIResponse<ListTransactionData>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/dashboard/transaction/list`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
      }
    );

    const { status, message, data, code } = res.data;
    if (!status) throw new ServerActionError(message, code);

    return getCumulativeByStatus(data?.items ?? []);
  },
  "GET_CUMULATIVE_TRANSACTION_STATUS"
);

// Fungsi untuk mengambil data transaksi terbaru berdasarkan tanggal saat ini
export const getLatestTransactions = async (
  todayDate: string
): Promise<{ latestBooking: BookingData | null; latestTransaction: TransactionData | null }> => {
  const formattedTodayDate = moment(todayDate).format("YYYY-MM-DD");

  try {
    const res = await axios.get<APIResponse<GlobalData>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/dashboard/statistic/transaction`,
      {
        headers: {
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (res.data.status && res.data.data) {
      const bookingsToday = res.data.data.booking?.filter(b => moment(b.date).isSame(formattedTodayDate, "day")) ?? [];
      const transactionsToday = res.data.data.transaction?.filter(t => moment(t.date).isSame(formattedTodayDate, "day")) ?? [];

      const latestBooking = bookingsToday.length > 0
        ? bookingsToday.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b)
        : null;

      const latestTransaction = transactionsToday.length > 0
        ? transactionsToday.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b)
        : null;

      return { latestBooking, latestTransaction };
    } else {
      throw new ServerActionError(res.data.message, res.data.code);
    }
  } catch {
    throw new ServerActionError("Failed to fetch latest transactions", "500");
  }
};

// Untuk Get Data Rekap Booking dan Transaction
export const getGraphBookingTrx = serverAction(
  async (params?: { startDate?: string; endDate?: string }) => {
    const response = await axios.get<APIResponse<GlobalData>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/dashboard/statistic/transaction`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const { status, message, data, code } = response.data;
    if (!status) throw new ServerActionError(message, code);

    const combinedResults: ResultBookTrx = {};
    const bookingData = data?.booking ?? [];
    const trxData = data?.transaction ?? [];

    bookingData.forEach(item => {
      if (!combinedResults[item.date]) combinedResults[item.date] = { booking: 0, transaction: 0 };
      combinedResults[item.date].booking = item.count;
    });

    trxData.forEach(item => {
      if (!combinedResults[item.date]) combinedResults[item.date] = { booking: 0, transaction: 0 };
      combinedResults[item.date].transaction = item.count;
    });

    const result = Object.keys(combinedResults).map(date => ({
      date,
      booking: combinedResults[date].booking,
      transaction: combinedResults[date].transaction,
    }));

    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return result;
  },
  "GET_BOOKING_TRX_GRAPH"
);
 