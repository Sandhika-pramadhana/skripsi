// actions/sap/generate/ZZ/index.ts
import axios from "axios";
import { EndpointInsertZZ, EndpointGenerateXmlZZ } from "@/types/api";
import { 
  GenerateRevenueParams, 
  InsertZZResponse, 
  GenerateXmlZZResponse 
} from "@/types/def";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

// Helper function untuk generate date range
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let current = new Date(start);
  while (current <= end && dates.length < 7) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ==================== INSERT ZZ ACTION (NEW FORMAT) ====================
export const insertZZ = serverAction(
  async (params: { 
    start_date: string; 
    dates: string[]; 
    amounts: number[]; 
  }) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointInsertZZ}`;
      
      console.log('Calling Insert ZZ API:', url);
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
        results?: InsertZZResponse['results'];
        errors?: InsertZZResponse['errors'];
        status?: boolean;
        data?: InsertZZResponse;
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log('Insert ZZ API Response status:', res.status);
      console.log('Insert ZZ API Response data:', res.data);

      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(message || 'Failed to insert ZZ data', String(code || 500));
        }
        return data!;
      }

      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || 'Failed to insert ZZ data', 
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results,
          errors: res.data.errors
        } as InsertZZResponse;
      }

      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error('Error in insertZZ action:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || 'Failed to insert ZZ data';

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
  "INSERT_ZZ"
);

// ==================== GENERATE XML ZZ ACTION (TIDAK BERUBAH) ====================
export const generateXmlZZ = serverAction(
  async (params: GenerateRevenueParams) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointGenerateXmlZZ}`;
      
      console.log('Calling Generate XML ZZ API:', url);
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
        results?: GenerateXmlZZResponse['results'];
        errors?: GenerateXmlZZResponse['errors'];
        status?: boolean;
        data?: GenerateXmlZZResponse;
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log('Generate XML ZZ API Response status:', res.status);
      console.log('Generate XML ZZ API Response data:', res.data);

      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(
            message || 'Failed to generate XML ZZ', 
            String(code || 500)
          );
        }
        return data!;
      }

      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || 'Failed to generate XML ZZ',
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results,
          errors: res.data.errors
        } as GenerateXmlZZResponse;
      }

      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error('Error in generateXmlZZ action:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || 'Failed to generate XML ZZ';

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
  "GENERATE_XML_ZZ"
);
