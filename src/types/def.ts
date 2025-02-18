/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */

//#region Auth
export interface Credentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    items: User[];
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
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_page: number;
      total_pages?: number;
      links: {
        previous?: string;
        next?: string;
      };
    }>;
}
  
export interface APIData<T = unknown> {
    items: T;
    pagination: Partial<{
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_page: number;
      links: {
        previous?: string;
        next?: string;
      };
    }>;
}
  
export interface APIResponse<T = unknown> {
    status: boolean;
    message: string;
    code: string;
    data: T;
}
  
export interface PaginatedAPIResponse<T = unknown>
    extends APIResponse<PaginatedAPIData<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
    map(arg0: (r: any) => { label: any; value: any }): any;
}
  
export interface DataAPIResponse<T = unknown> extends APIResponse<APIData<T>> {}

export type PaginationParams = Partial<{
    paging: 1 | 0;
    page: number;
    size: number;
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
    username: string;
    password: string;
    name: string;
    roleName: string;
    roleId: string;
}

export interface Role {
    id: number;
    roleId: string;
    roleName: string;
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
//#endregion