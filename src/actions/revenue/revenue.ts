"use server";

import axios from "axios";
import { APIResponse, GlobalData } from "@/types/def";
import { serverAction, ServerActionError } from "../action";

const API_KEY = process.env.NEXT_PUBLIC_X_API_TOKEN ?? ""; 

// Untuk Get Data Rekap Revenue
export const getGraphRevenue = serverAction(
  async (params?: { startDate?: string; endDate?: string }) => {
    const response = await axios.get<APIResponse<GlobalData>>(
      `${process.env.NEXT_PUBLIC_API_URL_2}/kurir/dashboard/statistic/transaction`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
      }
    );

    const { status, message, data, code } = response.data;

    if (!status) {
      throw new ServerActionError(message, code);
    }

    const revenueData = data?.revenue ?? [];

    if (revenueData.length > 0) {
      revenueData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let cumulativeRevenue = 0;
      const cumulativeData = revenueData.map((item) => {
        cumulativeRevenue += item.revenue;
        return {
          ...item,
          JML_Revenue: item.revenue,
          Running_SUM_JML_Revenue: cumulativeRevenue,
        };
      });

      return cumulativeData;
    }

    return []; 
  },
  "GET_REVENUE_GRAPH"
);
