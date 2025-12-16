import axios from "axios";
import { EndpointInsertZF, EndpointGenerateXmlZF, EndpointGenerateXmlZFQA } from "@/types/api";
import { 
  GenerateRevenueParams, 
  InsertZFResponse, 
  GenerateXmlZFResponse 
} from "@/types/def";
import { serverAction, ServerActionError } from "../../action";
import { getToken } from "../../auth/getToken";

// ==================== INSERT ZF ACTION ====================
export const insertZF = serverAction(
  async (params: GenerateRevenueParams) => {
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointInsertZF}`;
      
      console.log('Calling Insert ZF API:', url);
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
        results?: InsertZFResponse['results'];
        errors?: InsertZFResponse['errors'];
        status?: boolean;
        data?: InsertZFResponse;
        code?: number;
        error?: string;
      }>(url, params, config);

      console.log('Insert ZF API Response status:', res.status);
      console.log('Insert ZF API Response data:', res.data);

      // Format 1: Backend wrapper { status, message, data, code }
      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(message || 'Failed to insert ZF data', String(code || 500));
        }
        return data!;
      }

      // Format 2: Direct API response { success, results, errors }
      if (res.data.success !== undefined) {
        if (!res.data.success) {
          throw new ServerActionError(
            res.data.message || res.data.error || 'Failed to insert ZF data', 
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results,
          errors: res.data.errors
        } as InsertZFResponse;
      }

      // Format 3: Error response
      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error('Error in insertZF action:', error);

      // Handle axios errors
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || 'Failed to insert ZF data';

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
  "INSERT_ZF"
);

// ==================== GENERATE XML ZF (SANDBOX + PRODUCTION) ====================
export const generateXmlZF = serverAction(
  async (params: GenerateRevenueParams & { 
    environment?: 'sandbox' | 'production' 
  }) => {
    try {
      const token = await getToken();
      const environment = params.environment || 'production'; // Default production
      
      // IF-ELSE untuk pilih endpoint berdasarkan environment
      let url: string;
      if (environment === 'sandbox') {
        url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointGenerateXmlZFQA}`;
        console.log('Calling Generate XML ZF SANDBOX:', url);
      } else {
        url = `${process.env.NEXT_PUBLIC_API_LOCAL}/${EndpointGenerateXmlZF}`;
        console.log('Calling Generate XML ZF PRODUCTION:', url);
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
        results?: GenerateXmlZFResponse['results'];
        errors?: GenerateXmlZFResponse['errors'];
        status?: boolean;
        data?: GenerateXmlZFResponse;
        code?: number;
        error?: string;
      }>(url, { ...params, environment }, config);

      console.log(`Generate XML ZF [${environment}] Response status:`, res.status);
      console.log(`Generate XML ZF [${environment}] Response data:`, res.data);

      // Format 1: Backend wrapper { status, message, data, code }
      if (res.data.status !== undefined) {
        const { status, message, data, code } = res.data;
        if (!status) {
          throw new ServerActionError(
            message || `Failed to generate XML ZF (${environment})`, 
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
            res.data.message || res.data.error || `Failed to generate XML ZF (${environment})`,
            '500'
          );
        }
        return {
          success: res.data.success,
          message: res.data.message,
          results: res.data.results?.map((r: any) => ({ ...r, environment })),
          errors: res.data.errors,
          environment
        } as GenerateXmlZFResponse & { environment: 'sandbox' | 'production' };
      }

      // Format 3: Error response
      if (res.data.error) {
        throw new ServerActionError(res.data.error, '500');
      }

      throw new ServerActionError('Invalid response format from API', '500');

    } catch (error: any) {
      console.error(`Error in generateXmlZF [${params?.environment || 'unknown'}]:`, error);

      // Handle axios errors
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        const errorMessage = error.response.data?.error 
          || error.response.data?.message 
          || `Failed to generate XML ZF (${params?.environment || 'unknown'})`;

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
  "GENERATE_XML_ZF"
);
