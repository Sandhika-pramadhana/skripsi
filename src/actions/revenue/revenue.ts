"use server";

import axios from "axios";
import { APIResponse, GlobalData } from "@/types/def";
import { serverAction, ServerActionError } from "../action";
import { getApiToken } from "../auth/getToken";

// Untuk Get Data Rekap Revenue
export const getGraphRevenue = serverAction(
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
        if (data && data.revenue) {
            data.revenue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            let cumulativeRevenue = 0;
            const cumulativeData = data.revenue.map(item => {
                cumulativeRevenue += item.revenue;
                return {...item,
                        JML_Revenue: item.revenue,
                        Running_SUM_JML_Revenue: cumulativeRevenue
                       };
            });

            return cumulativeData;
        }
    }, 
    "GET_REVENUE_GRAPH"
);
