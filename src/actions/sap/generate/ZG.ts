import axios from "axios";
import { EndpointInsertZG, EndpointGenerateXmlZG, EndpointGenerateXmlZGQA } from "@/types/api";
import { 
  GenerateRevenueParams, 
  InsertZGResponse, 
  GenerateXmlZGResponse 
} from "@/types/def";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

// ==================== INSERT ZG ACTION ====================
export const insertZG = serverAction(
  async (params: GenerateRevenueParams) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointInsertZG}`;
      
      console.log('Calling Insert ZG API:', url);
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
        results?: InsertZGResponse['results'];
        errors?: InsertZGResponse['errors'];
        status?: boolean;
        data?: InsertZGResponse;
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log('Insert ZG API Response status:', res.status);
      console.log('Insert ZG API Response data:', res.data);

      // Format 1: Backend wrapper { status, message, data, code }
      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(message || 'Failed to insert ZG data', String(code || 500));
        }
        return data!;
      }

      // Format 2: Direct API response { success, results, errors }
      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || 'Failed to insert ZG data', 
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results,
          errors: res.data.errors
        } as InsertZGResponse;
      }

      // Format 3: Error response
      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error('Error in insertZG action:', error);

      // Handle axios errors
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || 'Failed to insert ZG data';

        throw new ServerActionError(
          errorMessage,
          String(error.response.status)
        );
      }

      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        throw new ServerActionError(
          'Request timeout. Please try with a smaller date range.',
          '408'
        );
      }

      // Handle network errors
      if (error.request) {
        throw new ServerActionError(
          'Network error. Please check your connection.',
          '503'
        );
      }

      // Re-throw ServerActionError
      if (error instanceof ServerActionError) {
        throw error;
      }

      // Unknown error
      throw new ServerActionError(
        error.message || 'Unknown error occurred',
        '500'
      );
    }
  },
  "INSERT_ZG"
);

// ==================== GENERATE XML ZG (SANDBOX + PRODUCTION) ====================
export const generateXmlZG = serverAction(
  async (params: GenerateRevenueParams & { 
    environment?: 'sandbox' | 'production' 
  }) => {
    try {
      const token = await getToken();
      const environment = params.environment || 'production'; // Default production
      
      // IF-ELSE untuk pilih endpoint berdasarkan environment
      let url: string;
      if (environment === 'sandbox') {
        url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointGenerateXmlZGQA}`;
        console.log('Calling Generate XML ZG SANDBOX:', url);
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL_1}/${EndpointGenerateXmlZG}`;
        console.log('Calling Generate XML ZG PRODUCTION:', url);
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
        results?: GenerateXmlZGResponse['results'];
        errors?: GenerateXmlZGResponse['errors'];
        status?: boolean;
        data?: GenerateXmlZGResponse;
        code?: number;
        error?: string;
      }>(url, { ...params, environment }, config);

      console.log(`Generate XML ZG [${environment}] Response status:`, res.status);
      console.log(`Generate XML ZG [${environment}] Response data:`, res.data);

      // Format 1: Backend wrapper { status, message, data, code }
      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(
            message || `Failed to generate XML ZG (${environment})`, 
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
            res.data.message || res.data.error || `Failed to generate XML ZG (${environment})`,
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results?.map((r: any) => ({ ...r, environment })),
          errors: res.data.errors,
          environment
        } as GenerateXmlZGResponse & { environment: 'sandbox' | 'production' };
      }

      // Format 3: Error response
      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error(`Error in generateXmlZG [${params?.environment || 'unknown'}]:`, error);

      // Handle axios errors
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || `Failed to generate XML ZG (${params?.environment || 'unknown'})`;

        throw new ServerActionError(
          errorMessage,
          String(error.response.status)
        );
      }

      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        throw new ServerActionError(
          'Request timeout. Please try with a smaller date range.',
          '408'
        );
      }

      // Handle network errors
      if (error.request) {
        throw new ServerActionError(
          'Network error. Please check your connection.',
          '503'
        );
      }

      // Re-throw ServerActionError
      if (error instanceof ServerActionError) {
        throw error;
      }

      // Unknown error
      throw new ServerActionError(
        error.message || 'Unknown error occurred',
        '500'
      );
    }
  },
  "GENERATE_XML_ZG"
);
