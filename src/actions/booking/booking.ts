"use server";

import axios from "axios";
import { APIResponse, GlobalData } from "@/types/def";
import { serverAction, ServerActionError } from "../action";

const API_KEY = process.env.NEXT_PUBLIC_X_API_TOKEN ?? ""; 

// Untuk Get Data Rekap Booking
export const getGraphBooking = serverAction(
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

    if (!status) {
      throw new ServerActionError(message, code);
    }

    const bookingData = data?.booking ?? [];
    bookingData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulativeBooking = 0;
    return bookingData.map(item => {
      cumulativeBooking += item.count;
      return {
        ...item,
        JML_Booking: item.count,
        Running_SUM_JML_Booking: cumulativeBooking,
      };
    });
  },
  "GET_BOOKING_GRAPH"
);

// Untuk cari earliest & latest booking date
export const findBookingDate = async () => {
  try {
    const response = await axios.get<APIResponse<GlobalData>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/dashboard/statistic/transaction`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const bookings = response.data.data?.booking ?? [];

    if (bookings.length > 0) {
      bookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const earliestDate = bookings[0].date;
      const latestDate = bookings[bookings.length - 1].date;
      return { earliestDate, latestDate };
    } else {
      return { earliestDate: null, latestDate: null };
    }
  } catch (error) {
    throw new ServerActionError("Failed to fetch booking dates", "500");
  }
};
