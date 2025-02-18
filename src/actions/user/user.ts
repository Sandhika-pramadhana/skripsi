import axios from "axios";
import { APIResponse, PaginatedAPIResponse, UserGraphResponse } from "@/types/def";
import { serverAction, ServerActionError } from "../action";
import { getApiToken } from "../auth/getToken";
import moment from "moment";

// Untuk Get Data Rekap User
export const getGraphUser = serverAction(
    async (params?: { startDate?: string, endDate?: string }) => {
        const token = await getApiToken();
        const response = await axios.get<PaginatedAPIResponse<UserGraphResponse>>(
            `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/statistic/user`,
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
        
        if (data.items) {
            data.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return data.items;
        }
    }, 
    "GET_USER_GRAPH"
);

// Untuk Ambil data user terakhir
export const getLatestUser = async (
    params?: { startDate?: string; endDate?: string; }
): Promise<{ latestUser: UserGraphResponse }> => {
    const token = await getApiToken();
    try {
        const res = await axios.get<APIResponse<{users: UserGraphResponse[]}>>(
            `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/statistic/user`,
            {
                params,
                headers: {
                    "x-api-key": token,
                    'Accept': 'application/json'
                },
            }
        );

        if (res.data.status) {
            const sortedUsers = res.data.data.users.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return {
                latestUser: sortedUsers[0]
            };
        } else {
            throw new ServerActionError(res.data.message, res.data.code);
        }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        throw new ServerActionError('Failed to fetch latest users', '500');
    }
};

// Fungsi untuk mengambil data user terbaru berdasarkan tanggal saat ini
export const getUserToday = async (
    todayDate: string
    ): Promise<{ latestUser?: { date: string; count: number } }> => {

    const token = await getApiToken();
    const formattedTodayDate = moment(todayDate).format('YYYY-MM-DD');

    try {
        const response = await axios.get<APIResponse<{ items: { date: string; count: number }[] }>>(
            `${process.env.NEXT_PUBLIC_API_URL}/kurir/dashboard/statistic/user`,
            {
                headers: {
                    "x-api-key": token,
                    'Accept': 'application/json'
                },
            }
        );

        if (response.data.status) {
            const userToday = response.data.data.items.filter(item => moment(item.date).isSame(formattedTodayDate, 'day'));
            if (userToday.length === 0) {
                return { latestUser: undefined };
            }
            const latestUser = userToday.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
            return { latestUser };
        } else {
            throw new Error(response.data.message);
        }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        throw new Error('Failed to fetch latest user data');
    }
};