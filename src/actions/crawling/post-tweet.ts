import axios from "axios";
import { PaginatedAPIResponse, PaginationParams } from "@/types/def";
import { serverAction, ServerActionError } from "../action";

type Tweet = {
  id: string;
  username: string | null;
  full_text: string;
  created_at: string;
  tweet_url: string | null;
};

export const getTweets = serverAction(
  async (
    params?: PaginationParams & {
      term?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL_1}/tweets`;

    const res = await axios.get<PaginatedAPIResponse<Tweet>>(url, {
      params: {
        page: params?.page,
        page_size: params?.page_size,
        term: params?.term,
        startDate: params?.startDate,
        endDate: params?.endDate,
        limit: params?.limit,
      },
    });

    const { status, message, data, code } = res.data;
    if (!status) {
      throw new ServerActionError(message, code);
    }

    return data;
  },
  "GET_TWEETS"
);