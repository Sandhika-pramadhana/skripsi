"use server";

import { ListTransactionData, PaginatedAPIResponse, GlobalData, APIResponse, BookingData, TransactionData } from "@/types/def";
import { getApiToken } from "../auth/getToken";
import axios from "axios";
import { serverAction, ServerActionError } from "../action";
import moment from 'moment';

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
    if (statusCounts[transaction.statusName]) {
      statusCounts[transaction.statusName] += 1;
    } else {
      statusCounts[transaction.statusName] = 1;
    }
  });
  const cumulativeResults = Object.entries(statusCounts).map(([statusName, count]) => ({
    statusName,
    count
  }));

  return cumulativeResults;
}

// Fungsi untuk Get List Transaksi
export const getListTransaction = serverAction(
  async (params?: { term?: string; startDate?: string; endDate?: string; page?: number; size?: number; }) => {
    const token = await getApiToken();

    const res = await axios.get<PaginatedAPIResponse<ListTransactionData>>(
      `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/transaction/list`,
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
    const size = params?.size || 10;
    const currentPage = params?.page || 1;
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

  "GET_LIST_TRANSACTION"
);

// Untuk get data di grafik transaksi
export const getGraphTrx = serverAction(
  async (params?: { startDate?: string, endDate?: string }) => {
      const token = await getApiToken();
      const response = await axios.get<APIResponse<GlobalData>>(
          `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/statistic/transaction`,
          {
              params,
              headers: {
                  'x-api-key': token,
              },
          }
      );

      const { status, message, data, code } = response.data;

      if (!status) {
        throw new ServerActionError(message, code);
      }
      if (data && data.transaction) {
          data.transaction.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let cumulativeTrx = 0;
          const cumulativeData = data.transaction.map(item => {
              cumulativeTrx += item.count;
              return {...item,
                      JML_Trx: item.count,
                      Running_SUM_JML_Trx: cumulativeTrx
                     };
          });

          return cumulativeData;
      }
  }, 
  "GET_TRANSACTION_GRAPH"
);

// Untuk get data berdasarkan StatusName
export const getCumulativeTransactionStatus = serverAction(
  async (params?: { startDate?: string; endDate?: string; page?: number; size?: number; }) => {
    const token = await getApiToken();

    const res = await axios.get<PaginatedAPIResponse<ListTransactionData>>(
      `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/transaction/list`,
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
    const cumulativeCounts = getCumulativeByStatus(data.items);
    return cumulativeCounts;
  },
  "GET_CUMULATIVE_TRANSACTION_STATUS"
);

// Fungsi untuk mengambil data transaksi terbaru berdasarkan tanggal saat ini
export const getLatestTransactions = async (
  todayDate: string
  ): Promise<{ latestBooking: BookingData, latestTransaction: TransactionData }> => {
  const token = await getApiToken();
  const formattedTodayDate = moment(todayDate).format('YYYY-MM-DD');

  try {
    const res = await axios.get<APIResponse<GlobalData>>(
      `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/statistic/transaction`,
      {
        headers: {
          "x-api-key": token,
          'Accept': 'application/json'
        },
      }
    );

    if (res.data.status) {
      const bookingsToday = res.data.data.booking.filter(b => moment(b.date).isSame(formattedTodayDate, 'day'));
      const transactionsToday = res.data.data.transaction.filter(t => moment(t.date).isSame(formattedTodayDate, 'day'));

      const latestBooking = bookingsToday.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, bookingsToday[0]);
      const latestTransaction = transactionsToday.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b, transactionsToday[0]);

      return {
        latestBooking,
        latestTransaction
      };
    } else {
      throw new ServerActionError(res.data.message, res.data.code);
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new ServerActionError('Failed to fetch latest transactions', '500');
  }
};

// Untuk Get Data Rekap Booking dan Transaction
export const getGraphBookingTrx = serverAction(
async (params?: { startDate?: string, endDate?: string }) => {
    const token = await getApiToken();
    const response = await axios.get<APIResponse<GlobalData>>(
        `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/statistic/transaction`,
        {
            params,
            headers: {
                'x-api-key': token,
            },
        }
    );

    const { status, message, data, code } = response.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    const combinedResults: ResultBookTrx = {};
    data.booking.forEach(item => {
        if (!combinedResults[item.date]) {
            combinedResults[item.date] = { booking: 0, transaction: 0 };
        }
        combinedResults[item.date].booking = item.count;
    });

    data.transaction.forEach(item => {
        if (!combinedResults[item.date]) {
            combinedResults[item.date] = { booking: 0, transaction: 0 };
        }
        combinedResults[item.date].transaction = item.count;
    });

    const result = Object.keys(combinedResults).map(date => ({
        date: date,
        booking: combinedResults[date].booking,
        transaction: combinedResults[date].transaction
    }));

    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return result;
}, 
"GET_BOOKING_TRX_GRAPH"
);
