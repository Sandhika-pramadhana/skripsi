// actions/sap/generate/ZY/index.ts
import axios from "axios";
import { EndpointInsertZY, EndpointGenerateXmlZY } from "@/types/api";
import { 
  GenerateRevenueParams, 
  InsertZYResponse, 
  GenerateXmlZYResponse 
} from "@/types/def";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

// ==================== INSERT ZY ACTION ====================
export const insertZY = serverAction(
  async (params: { start_date: string; dates: string[]; amounts: number[] }) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointInsertZY}`;
      
      console.log('Calling Insert ZY API:', url);
      console.log('With params:', params);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 0, 
      };

      const res = await axios.post<{
        success?: boolean;
        message?: string;
        results?: InsertZYResponse['results'];
        errors?: InsertZYResponse['errors'];
        status?: boolean;
        data?: InsertZYResponse;
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log('Insert ZY API Response status:', res.status);
      console.log('Insert ZY API Response data:', res.data);

      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(message || 'Failed to insert ZY data', String(code || 500));
        }
        return data!;
      }

      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || 'Failed to insert ZY data', 
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results,
          errors: res.data.errors
        } as InsertZYResponse;
      }

      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error('Error in insertZY action:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || 'Failed to insert ZY data';

        throw new ServerActionError(
          errorMessage,
          String(error.response.status)
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new ServerActionError(
          'Request timeout. Please try with a smaller date range.',
          '408'
        );
      }

      if (error.request) {
        throw new ServerActionError(
          'Network error. Please check your connection.',
          '503'
        );
      }

      if (error instanceof ServerActionError) {
        throw error;
      }

      throw new ServerActionError(
        error.message || 'Unknown error occurred',
        '500'
      );
    }
  },
  "INSERT_ZY"
);

// ==================== GENERATE XML ZY ACTION ====================
export const generateXmlZY = serverAction(
  async (params: GenerateRevenueParams) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointGenerateXmlZY}`;
      
      console.log('Calling Generate XML ZY API:', url);
      console.log('With params:', params);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 0, // No timeout for long running process
      };

      const res = await axios.post<{
        success?: boolean;
        message?: string;
        results?: GenerateXmlZYResponse['results'];
        errors?: GenerateXmlZYResponse['errors'];
        status?: boolean;
        data?: GenerateXmlZYResponse;
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log('Generate XML ZY API Response status:', res.status);
      console.log('Generate XML ZY API Response data:', res.data);

      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(
            message || 'Failed to generate XML ZY', 
            String(code || 500)
          );
        }
        return data!;
      }

      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || 'Failed to generate XML ZY',
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results,
          errors: res.data.errors
        } as GenerateXmlZYResponse;
      }

      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error('Error in generateXmlZY action:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || 'Failed to generate XML ZY';

        throw new ServerActionError(
          errorMessage,
          String(error.response.status)
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new ServerActionError(
          'Request timeout. Please try with a smaller date range.',
          '408'
        );
      }

      if (error.request) {
        throw new ServerActionError(
          'Network error. Please check your connection.',
          '503'
        );
      }

      if (error instanceof ServerActionError) {
        throw error;
      }

      throw new ServerActionError(
        error.message || 'Unknown error occurred',
        '500'
      );
    }
  },
  "GENERATE_XML_ZY"
);
