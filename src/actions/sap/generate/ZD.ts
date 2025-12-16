import axios from "axios";
import { EndpointInsertZD, EndpointGenerateXmlZD, EndpointGenerateXmlZDQA } from "@/types/api";
import { 
  GenerateRevenueParams, 
  InsertZDResponse, 
  GenerateXmlZDResponse 
} from "@/types/def";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

// ==================== INSERT ZD ACTION (KODE LAMA TETAP SAMA) ====================
export const insertZD = serverAction(
  async (params: GenerateRevenueParams) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointInsertZD}`;
      
      console.log('Calling Insert ZD API:', url);
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
        results?: InsertZDResponse['results'];
        errors?: InsertZDResponse['errors'];
        status?: boolean;
        data?: InsertZDResponse;
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log('Insert ZD API Response status:', res.status);
      console.log('Insert ZD API Response data:', res.data);

      // Format 1: Backend wrapper { status, message, data, code }
      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(message || 'Failed to insert ZD data', String(code || 500));
        }
        return data!;
      }

      // Format 2: Direct API response { success, results, errors }
      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || 'Failed to insert ZD data', 
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results,
          errors: res.data.errors
        } as InsertZDResponse;
      }

      // Format 3: Error response
      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error('Error in insertZD action:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || 'Failed to insert ZD data';

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
  "INSERT_ZD"
);

// ==================== GENERATE XML ZD (SANDBOX + PRODUCTION) ====================
export const generateXmlZD = serverAction(
  async (params: GenerateRevenueParams & { 
    environment?: 'sandbox' | 'production' 
  }) => {
    try {
      const token = await getToken();
      const environment = params.environment || 'production'; // Default production
      
      // IF-ELSE untuk pilih endpoint berdasarkan environment
      let url: string;
      if (environment === 'sandbox') {
        url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointGenerateXmlZDQA}`;
        console.log('Calling Generate XML ZD SANDBOX:', url);
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointGenerateXmlZD}`;
        console.log('Calling Generate XML ZD PRODUCTION:', url);
      }
      
      console.log('With params:', params);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Environment': environment,
        },
        timeout: 0, // No timeout for long running process
      };

      const res = await axios.post<{
        success?: boolean;
        message?: string;
        results?: GenerateXmlZDResponse['results'];
        errors?: GenerateXmlZDResponse['errors'];
        status?: boolean;
        data?: GenerateXmlZDResponse;
        code?: number;
        error?: string;
      }>(url, { ...params, environment }, config);

      console.log(`Generate XML ZD [${environment}] Response status:`, res.status);
      console.log(`Generate XML ZD [${environment}] Response data:`, res.data);

      // Format 1: Backend wrapper { status, message, data, code }
      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(
            message || `Failed to generate XML ZD (${environment})`, 
            String(code || 500)
          );
        }
        return {
          ...data!,
          environment
        };
      }

      // Format 2: Direct API response { success, results, errors }
      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || `Failed to generate XML ZD (${environment})`,
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results?.map((r: any) => ({ ...r, environment })),
          errors: res.data.errors,
          environment
        } as GenerateXmlZDResponse & { environment: 'sandbox' | 'production' };
      }

      // Format 3: Error response
      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error(`Error in generateXmlZD [${params?.environment || 'unknown'}]:`, error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || `Failed to generate XML ZD (${params?.environment || 'unknown'})`;

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
  "GENERATE_XML_ZD"
);
