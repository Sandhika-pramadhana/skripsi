import axios from "axios";
import { EndpointGenerateSap,EndpointSync } from "@/types/api";
import {
  GenerateRevenueParams,
  DayData,
  WeekSummary,
  WeekData,
  GenerateRevenueResponse,
  SyncRevenueParams,
  SyncRevenueResult
} from "@/types/def";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

// ==================== GENERATE SAP ====================
export const generateSap = serverAction(
  async (params: GenerateRevenueParams) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointGenerateSap}`;

      console.log("Calling API:", url);
      console.log("With params:", params);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 0,
      };

      const res = await axios.post<{
        status?: boolean;
        message?: string;
        data?: GenerateRevenueResponse;
        weeks?: WeekData[];
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log("API Response status:", res.status);
      console.log("API Response data:", res.data);

      
      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(
            message || "Unknown error",
            String(code || 500)
          );
        }
        return data!;
      }

      
      if (res.data.weeks) {
        return res.data as GenerateRevenueResponse;
      }

      
      if (res.data.error) {
        throw new ServerActionError(res.data.error, "500");
      }

      throw new ServerActionError("Invalid response format from API", "500");
    } catch (error: any) {
      console.error("Error in generateSap action:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);

        const errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          "Failed to generate revenue data";

        throw new ServerActionError(
          errorMessage,
          String(error.response.status)
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new ServerActionError(
          "Request timeout. Please try with a smaller date range.",
          "408"
        );
      }

      if (error.request) {
        throw new ServerActionError(
          "Network error. Please check your connection.",
          "503"
        );
      }

      if (error instanceof ServerActionError) {
        throw error;
      }

      throw new ServerActionError(
        error.message || "Unknown error occurred",
        "500"
      );
    }
  },
  "GENERATE_SAP"
);

// ==================== SYNC SAPFICO ====================
export const syncRevenue = serverAction(
  async (params: SyncRevenueParams) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointSync}`;

      console.log("Calling Sync SAPFICO API:", url);
      console.log("With params:", params);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 0,
      };

      const res = await axios.post<{
        success?: boolean;
        message?: string;
        year?: number;
        month?: number;
        periode?: string;
        inserted?: {
          history_trx_agent: number;
          log_trx_agent: number;
          partner_trx_request: number;
        };
        error?: string;
      }>(url, params, config);

      console.log("Sync API Response:", res.data);

    
      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || "Sync failed",
            "500"
          );
        }

        return {
          success: true,
          year: res.data.year!,
          month: res.data.month!,
          periode: res.data.periode!,
          inserted: res.data.inserted!,
          message: res.data.message,
        } as SyncRevenueResult;
      }

      if (res.data.error) {
        throw new ServerActionError(res.data.error, "500");
      }

      throw new ServerActionError("Invalid sync response format", "500");
    } catch (error: any) {
      console.error("Error in sync action:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          "Sync failed";
        throw new ServerActionError(
          errorMessage,
          String(error.response.status)
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new ServerActionError(
          "Sync timeout - data terlalu besar",
          "408"
        );
      }

      if (error.request) {
        throw new ServerActionError("Network error", "503");
      }

      if (error instanceof ServerActionError) {
        throw error;
      }

      throw new ServerActionError(error.message || "Sync failed", "500");
    }
  },
  "SYNC_REVENUE"
);
