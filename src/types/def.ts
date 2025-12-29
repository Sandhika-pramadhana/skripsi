/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */

//#region Auth
export interface Credentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    items: {
        token: string;
        user: User;
    }
}

export interface LogoutResponse {
    status: boolean;
    message: string;
    code: string;
}

export interface DecodedType {
    id?: string;
    name?: string;
    username?:string;
    roleName?: string;
    roleId?: string;
}

export interface AlertSessionMethods {
    openDialog: () => void;
    closeDialog: () => void;
  }

//#region API Response
export interface PaginatedAPIData<T = unknown> {
    items: T[];
    pagination: Partial<{
      page: number;
      page_size: number;
      total_data: number;
      total_page: number;
      current_page: number;
      current_data: number;
    }>;
}

export interface APIData<T = unknown> {
    items: T;
    pagination: Partial<{
      page: number;
      page_size: number;
      total_data: number;
      total_page: number;
      current_page: number;
      current_data: number;
    }>;
}
  
export interface APIResponse<T = unknown> {
    status: boolean;
    message: string;
    code: string;
    data: T | null;
}
  
export interface PaginatedAPIResponse<T = unknown>
    extends APIResponse<PaginatedAPIData<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
    map(arg0: (r: any) => { label: any; value: any }): any;
}

export interface PaginatedAPIResponseBackend<T = unknown>
    extends APIResponse<PaginatedAPIData<T>> {}

export interface DataAPIResponse<T = unknown> extends APIResponse<APIData<T>> {}

export type PaginationParams = Partial<{
    page?: number;
    page_size?: number;
  }>;
//#endregion

//#region Transaction Data
export interface GlobalData {
    booking: BookingData[],
    transaction: TransactionData[],
    gtv: GtvData[];
    revenue: RevenueData[];
}

export interface BookingData {
    date: string;
    count: number;
}

export interface TransactionData {
    date: string;
    count: number;
}

export interface GtvData {
    date: string;
    gtv: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
}

export interface ListTransactionData {
    bookingId: string;
    bookingDate: string;
    userId: string;
    cityFrom: string;
    cityTo: string;
    gtv: string;
    fee: string;
    statusId: string;
    statusName: string; 
}

//#endregion

//#region User
export interface UserGraphResponse {
    date: string;
    count: number;
}

export interface User {
    id: number;
    name: string;
    username: string;
    password: string; 
    roleName: string;
    role_id: number;   
    created_at?: string;
    updated_at?: string;
    login_attempts?: number;
    last_attempt?: string | null;
    blocked_until?: string | null;
}

export interface Role {
    id: number;
    roleName: string;
    created_at?: string;
    updated_at?: string;
  }
  

export interface UserGraphResponse {
    date: string;
    count: number;
}
//#endregion

//region Chart
export interface TanggalType {
    startDate: string;
    endDate: string;
}

export interface DemographicType {
    Country: string;
    ActiveUser: string;
    NewUsers: string;
    EngagedSessions: string;
    EngagementRate: string;
    EngagedSessionsPerActiveUser: string;
    AverageEngagementTimePerActiveUser: string;
    EventCount: string;
    KeyEvents: string;
    UserKeyEventRate: string;
    TotalRevenue: string;
}

export interface PageType {
    PagePathAndScreenClass: string;
    Views: string;
    ActiveUser: string;
    ViewsPerActiveUser: string;
    AverageEngagementTimePerActiveUser: string;
    KeyEvents: string;
    TotalRevenue: string;
}

//#region Status Transaksi
export enum TransactionStatus {
    PesananDibuat = "01",
    PesananTerbayar = "02",
    KurirDitugaskan = "03",
    PickupBerhasil = "04",
    DalamProsesPengiriman = "05",
    DalamProsesPengantaran = "06",
    KirimanTiba = "07",
    KurangBayar = "97",
    PesananDibatalkan = "98",
    GagalAntar = "99"
  }
//#endregion

//#region MyTsel
export interface TrafficReportMyTsel {
    date: string;
    viewCount: number;
    activeUser: number;
}

export interface CumulativeTraffic {
    traffic: TrafficReportMyTsel[]
}

export interface TrafficTotalData {
    date: string;
    SUM_JML_ActiveUser: number;
    SUM_JML_ViewCount: number;
  }

  export interface LogApis {
    id: string;
    process_name: string;
    third_party_name: string;
    request_date: string;   
    request_url: string;
    request_header: string; 
    request_payload: string; 
    response_payload: string; 
    response_date: string;   
    description: string;
  }

  export interface callbacks {
    id: number;
    order_id: string;
    user_id: number;
    order_date: string; 
    type_id: number;
    type_name: string;
    paid_amount: number;
    va_number?: string | null;
    paid_date?: string | null;
    payload?: Record<string, any> | null; 
    status_id?: number | null;
    status_name?: string | null;
    status_message?: string | null;
  }

  export interface callback_registrations {
    id: number;
    uniq_id: number;
    location_id?: number;      
    nopend?: string;           
    api_key?: string | null;   
    username: string;
    status_id: string;
    status_message: string;
    payload?: Record<string, any> | null;         
  }

  export interface transaction_mandiri {
    id: string;                     
    user_id: number;
    location_id: string;            
    transaction_date: string;       
    category_id: number;
    category_name: string;
    item_type_id: number;
    item_type_name: string;
    product_id?: string | number | null;
    product_name?: string | null;
    estimation?: number | null;
    payment_type_id?: number | null;
    payment_type_name?: string | null;
    connote_code?: string | null;
    status_id?: number | string;
    status_name?: string | null;
    awb_url?: string | null;
    is_bagging?: boolean | number;  
    created_at?: string;
    updated_at?: string;
    agent_id?: number | null;
    account_number?: string | null;
    posdigi_product_id?: number | string | null;
    bill_amount?: number | null;
    fee_amount?: number | null;
    ref_id?: string | null;
    receipt_number?: string | null;
    connote_id?: string | null;
    payment_status_id?: number | string | null;
    payment_status_name?: string | null;
  }

  export interface TransactionItem_mandiri {
    id: string;
    transaction_id: string;
    weight: number | string;       
    length: number | string;
    width: number | string;
    height: number | string;
    diameter: number | string;
    value: number | string;         
    description: string | null;
    is_insurance: number | boolean; 
    created_at?: string | null;
    updated_at?: string | null;
  }

  export interface TransactionFee_mandiri {
    id: string;
    transaction_id: string;
    fee_amount: number | string;
    insurance_amount: number | string;
    discount_amount: number | string;
    fee_tax_amount: number | string;
    insurance_tax_amount: number | string;
    cod_value: number | string;
    total_amount: number | string;
    created_at?: string | null;
    updated_at?: string | null;
  }

  export interface sapico {
    id: number;
    tgl_trx: string;       
    id_number: string;     
    amount: number;        
    coa: string;           
    sgtxt: string;         
    ket: string;           
    flag: number;          
    no_doc: string;        
    file: string;          
    tgl_hit: string;       
  }
  


  export interface log_sapico{
    id: number;
    nama_file: string;
    response: string;
    tanggal: string;
    url: string;
  }

  export interface GenerateRevenueParams {
    start_date: string;
    end_date: string;
  }
  
  export interface DayData {
    date: string;
    direct: string;
    indirect: string;
    thirdparty: string;
    gross_revenue: string;
    dpp: string;
  }
  
  export interface WeekSummary {
    gross_revenue: string;
    dpp: string;
    ppn: string;
  }
  
  export interface WeekData {
    week?: string;
    days?: DayData[];
    summary?: WeekSummary;
    summary_month?: {
      gross_revenue: string;
      dpp: string;
      ppn: string;
    };
  }
  
  export interface GenerateRevenueResponse {
    weeks: WeekData[];
  }

  export interface ApiWeekSummary {
    gross_revenue: string;
    dpp: string;
    ppn: string;
  }
  
  export interface ApiMonthSummary {
    gross_revenue: string;
    dpp: string;
    ppn: string;
  }
  
  export interface ApiDayData {
    date: string;
    direct: string;
    indirect: string;
    thirdparty: string;
    gross_revenue: string;
    dpp: string;
  }
  

  export interface LogSapico extends ApiDayData {
    id: number;
    nama_file: string;
    response: string;
    tanggal: string;
    url: string;
  }
  
  export interface ApiWeekData {
    week?: string;
    days?: ApiDayData[];
    summary?: ApiWeekSummary;
    summary_month?: ApiMonthSummary;
  }
  
  export interface ApiResponse {
    weeks: ApiWeekData[];
  }

  export interface ZDProcessResult {
    date: string;
    insertSuccess: boolean;
    insertError?: string | null;
    xmlFile?: string;
    total_sum?: number;
    soapSuccess: boolean;
    belnr?: string | null;
    soapError?: string | null;
  }
  
  export interface ZDProcessResponse {
    success: boolean;
    processed: number;
    results: ZDProcessResult[];
  }

// Request params (sama dengan GenerateRevenueParams yang sudah ada)
export interface GenerateRevenueParams {
  start_date: string; // Format: YYYY-MM-DD
  end_date: string;   // Format: YYYY-MM-DD
}

// ==================== INSERT ZD TYPES ====================
export interface InsertZDResult {
  date: string;
  success: boolean;
  dpp_third: number;
  dpp_direct: number;
  ppn_third: number;
  ppn_direct: number;
  total_third: number;
  total_direct: number;
}

export interface InsertZDError {
  date: string;
  error: string;
}


export interface InsertZDResponse {
  success: boolean;
  message: string;
  results: InsertZDResult[];
  errors?: InsertZDError[];
}

// ==================== GENERATE XML ZD TYPES ====================
export interface GenerateXmlZDResult {
  date: string;
  status: 'success' | 'xml_created' | 'skipped';
  xmlFile?: string;
  total_amount?: number;
  api_response?: any;
  message: string;
}

export interface GenerateXmlZDError {
  date: string;
  error: string;
}

export interface GenerateXmlZDResponse {
  success: boolean;
  message: string;
  results: GenerateXmlZDResult[];
  errors?: GenerateXmlZDError[];
}


export interface ZDProcessResult {
  insertResult?: InsertZDResponse;
  xmlResult?: GenerateXmlZDResponse;
  totalProcessed: number;
  totalErrors: number;
  duration: number; 
}

// ==================== INSERT ZE TYPES ====================
export interface InsertZEResult {
  date: string;
  success: boolean;
  dpp: number;              
  ppn: number;             
  total_indirect?: number;  
}

export interface InsertZEError {
  date: string;
  error: string;
}

export interface InsertZEResponse {
  success: boolean;
  message: string;
  results: InsertZEResult[];
  errors?: InsertZEError[];
}

// ==================== GENERATE XML ZE TYPES ====================
export interface GenerateXmlZEResult {
  date: string;
  status: 'success' | 'xml_created' | 'skipped';
  xmlFile?: string;
  total_amount?: number;
  api_response?: any;
  message: string;
}

export interface GenerateXmlZEError {
  date: string;
  error: string;
}

export interface GenerateXmlZEResponse {
  success: boolean;
  message: string;
  results: GenerateXmlZEResult[];
  errors?: GenerateXmlZEError[];
}

export interface ZEProcessResult {
  insertResult?: InsertZEResponse;
  xmlResult?: GenerateXmlZEResponse;
  totalProcessed: number;
  totalErrors: number;
  duration: number; 
}

// ==================== INSERT ZF TYPES ====================
export interface InsertZFResult {
  date: string;
  success: boolean;
  amount: number;      // ganti dari dpp ke amount
  ppn: number;
  total_amount?: number;
}

export interface InsertZFError {
  date: string;
  error: string;
}

export interface InsertZFResponse {
  success: boolean;
  message: string;
  results: InsertZFResult[];
  errors?: InsertZFError[];
}

// ==================== GENERATE XML ZF TYPES ====================
export interface GenerateXmlZFResult {
  date: string;
  status: 'success' | 'xml_created' | 'skipped';
  xmlFile?: string;
  total_amount?: number;
  api_response?: any;
  message: string;
}

export interface GenerateXmlZFError {
  date: string;
  error: string;
}

export interface GenerateXmlZFResponse {
  success: boolean;
  message: string;
  results: GenerateXmlZFResult[];
  errors?: GenerateXmlZFError[];
}


export interface ZFProcessResult {
  insertResult?: InsertZFResponse;
  xmlResult?: GenerateXmlZFResponse;
  totalProcessed: number;
  totalErrors: number;
  duration: number;
}

// ==================== INSERT ZG TYPES ====================
export interface InsertZGResult {
  date: string;
  success: boolean;
  amount: number;      // ganti dari dpp ke amount
  ppn: number;
  total_amount?: number;
}

export interface InsertZGError {
  date: string;
  error: string;
}

export interface InsertZGResponse {
  success: boolean;
  message: string;
  results: InsertZGResult[];
  errors?: InsertZGError[];
}

// ==================== GENERATE XML ZG TYPES ====================
export interface GenerateXmlZGResult {
  date: string;
  status: 'success' | 'xml_created' | 'skipped';
  xmlFile?: string;
  total_amount?: number;
  api_response?: any;
  message: string;
}

export interface GenerateXmlZGError {
  date: string;
  error: string;
}

export interface GenerateXmlZGResponse {
  success: boolean;
  message: string;
  results: GenerateXmlZGResult[];
  errors?: GenerateXmlZGError[];
}

export interface ZGProcessResult {
  insertResult?: InsertZGResponse;
  xmlResult?: GenerateXmlZGResponse;
  totalProcessed: number;
  totalErrors: number;
  duration: number;
}

// ==================== INSERT ZY TYPES ====================
export interface InsertZYResult {
  date: string;
  success: boolean;
  amount: number;
  id_number: string;
  ket: string;
}

export interface InsertZYResponse {
  success: boolean;
  message: string;
  results: InsertZYResult[];
  errors?: Array<{ date: string; error: string }>;
}


// ==================== GENERATE XML ZY TYPES ====================
export interface GenerateXmlZYResult {
  date: string;
  status: 'success' | 'xml_created' | 'skipped';
  xmlFile?: string;
  total_amount?: number;
  record_count?: number;
  api_response?: any;
  message: string;
}

export interface GenerateXmlZYResponse {
  success: boolean;
  message: string;
  results: GenerateXmlZYResult[];
  errors?: Array<{ date: string; error: string }>;
}

// ==================== INSERT ZZ TYPES ====================
export interface InsertZZResult {
  date: string;
  success: boolean;
  amount: number;
  id_number: string;
  ket: string;
}

export interface InsertZZResponse {
  success: boolean;
  message: string;
  results: InsertZZResult[];
  errors?: Array<{ date: string; error: string }>;
}

interface ZZRevenueProcessProps {
  insertAction: (params: { 
    start_date: string; 
    dates: string[]; 
    amounts: number[]; 
  }) => Promise<any>;
  generateXmlAction: (params: { start_date: string; end_date: string }) => Promise<any>;
}

// ==================== GENERATE XML ZZ TYPES ====================
export interface GenerateXmlZZResult {
  date: string;
  status: 'success' | 'xml_created' | 'skipped';
  xmlFile?: string;
  total_amount?: number;
  record_count?: number;
  api_response?: any;
  message: string;
}

export interface GenerateXmlZZResponse {
  success: boolean;
  message: string;
  results: GenerateXmlZZResult[];
  errors?: Array<{ date: string; error: string }>;
}

export interface SyncRevenueParams {
  year: number;
  month: number;
  tables?: string[]; 
}

export interface SyncRevenueResult {
  success: boolean;
  year: number;
  month: number;
  periode: string;
  inserted: {
    history_trx_agent: number;
    log_trx_agent: number;
    partner_trx_request: number;
  };
  message?: string;
}


//end region