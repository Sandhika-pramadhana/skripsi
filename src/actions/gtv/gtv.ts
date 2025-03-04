"use server";

import axios from "axios";
import { APIResponse, GlobalData } from "@/types/def";
import { serverAction, ServerActionError } from "../action";
import { getApiToken } from "../auth/getToken";

// Untuk Get Data Rekap GTV
export const getGraphGTV = serverAction(
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
        if (data && data.gtv) {
            data.gtv.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            let cumulativeGtv = 0;
            const cumulativeData = data.gtv.map(item => {
                cumulativeGtv += item.gtv;
                return {...item, 
                        Running_SUM_JML_GTV: cumulativeGtv,
                        JML_GTV: item.gtv
                       };
            });
            return cumulativeData;
        }
    }, 
    "GET_GTV_GRAPH"
);