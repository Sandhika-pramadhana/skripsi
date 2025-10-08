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

//#endregion