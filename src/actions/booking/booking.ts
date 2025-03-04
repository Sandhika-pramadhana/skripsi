"use server";

import axios from "axios";
import { APIResponse, GlobalData } from "@/types/def";
import { serverAction, ServerActionError } from "../action";
import { getApiToken } from "../auth/getToken";

// Untuk Get Data Rekap Booking
export const getGraphBooking = serverAction(
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
      if (data && data.booking) {
          data.booking.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let cumulativeBooking = 0;
          const cumulativeData = data.booking.map(item => {
              cumulativeBooking += item.count;
              return {...item,
                      JML_Booking: item.count,
                      Running_SUM_JML_Booking: cumulativeBooking
                     };
          });

          return cumulativeData;
      }
  }, 
  "GET_BOOKING_GRAPH"
);

export const findBookingDate = async () => {
    try {
      const token = await getApiToken();
      const response = await axios.get<APIResponse<GlobalData>>
        (`${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/statistic/transaction`, {
        headers: {
          'x-api-key': token,
        },
      });
  
      const bookings = response.data.data.booking;
      if (bookings.length > 0) {
        bookings.sort((a: { date: string | Date; }, b: { date: string | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const earliestDate = bookings[0].date;
        const latestDate = bookings[bookings.length - 1].date;
        return { earliestDate, latestDate };
      } else {
        return { earliestDate: null, latestDate: null };
      }
    } catch (error) {
      throw error;
    }
  };