import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { 
  InsertZDResult, 
  InsertZEResult, 
  InsertZFResult,
  InsertZGResult 
} from "@/types/def";

const formatRupiah = (value: any) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

// ==================== ZD COLUMNS ====================
export const createInsertZDColumns = (): ColumnDef<InsertZDResult>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="font-medium">
          {date.toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "dpp_third",
    header: () => <div className="text-right">DPP Third</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatRupiah(row.getValue("dpp_third"))}
      </div>
    ),
  },
  {
    accessorKey: "dpp_direct",
    header: () => <div className="text-right">DPP Direct</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatRupiah(row.getValue("dpp_direct"))}
      </div>
    ),
  },
  {
    id: "daily_dpp",
    header: () => <div className="text-right font-medium">DPP</div>,
    cell: ({ row }) => {
      const dppThird = Number(row.original.dpp_third || 0);
      const dppDirect = Number(row.original.dpp_direct || 0);
      const dailyDpp = dppThird + dppDirect;
      return (
        <div className="text-right font-medium font-mono text-black-700 px-2 py-1 rounded">
          {formatRupiah(dailyDpp)}
        </div>
      );
    },
  },
  {
    id: "total_amount",
    header: () => <div className="text-right font-bold">Gross</div>,
    cell: ({ row }) => {
      const dppThird = Number(row.original.dpp_third || 0);
      const dppDirect = Number(row.original.dpp_direct || 0);
      const ppnThird = Number(row.original.ppn_third || 0);
      const ppnDirect = Number(row.original.ppn_direct || 0);
      
      const total = dppThird + dppDirect + ppnThird + ppnDirect;
      
      return (
        <div className="text-right font-medium font-mono text-black-700 px-2 py-1 rounded">
          {formatRupiah(total)}
        </div>
      );
    },
  },
  {
    id: "total_ppn",
    header: () => <div className="text-right">PPN</div>,
    cell: ({ row }) => {
      const ppnThird = Number(row.original.ppn_third || 0);
      const ppnDirect = Number(row.original.ppn_direct || 0);
      const total = ppnThird + ppnDirect;
      return (
        <div className="text-right text-gray-600 font-mono">
          {formatRupiah(total)}
        </div>
      );
    },
  },
  {
    accessorKey: "success",
    header: "Status",
    cell: ({ row }) => {
      const success = Boolean(row.getValue("success"));
      return (
        <div className="flex items-center gap-2">
          {success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                Data inserted successfully
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 font-medium">Insert failed</span>
            </>
          )}
        </div>
      );
    },
  },
];

// ==================== ZE COLUMNS ====================
export const createInsertZEColumns = (): ColumnDef<InsertZEResult>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="font-medium">
          {date.toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "dpp", 
    header: () => <div className="text-right">DPP Indirect</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatRupiah(row.getValue("dpp"))}
      </div>
    ),
  },
  {
    id: "total_indirect",
    header: () => <div className="text-right">Gross Indirect</div>,
    cell: ({ row }) => {
      const dpp = Number(row.original.dpp || 0);
      const total_indirect = Number(row.original.total_indirect || 0);
      const displayValue = total_indirect || dpp;
      return (
        <div className="text-right font-medium font-mono">
          {formatRupiah(displayValue)}
        </div>
      );
    },
  },
  {
    accessorKey: "ppn",
    header: () => <div className="text-right">PPN</div>,
    cell: ({ row }) => {
      const ppn = Number(row.getValue("ppn") || 0);
      return <div className="text-right text-gray-600 font-mono">{formatRupiah(ppn)}</div>;
    },
  },
  {
    accessorKey: "success",
    header: "Status",
    cell: ({ row }) => {
      const success = Boolean(row.getValue("success"));
      return (
        <div className="flex items-center gap-2">
          {success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                Data inserted successfully
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 font-medium">Insert failed</span>
            </>
          )}
        </div>
      );
    },
  },
];

// ==================== ZF COLUMNS ====================
export const createInsertZFColumns = (): ColumnDef<InsertZFResult>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="font-medium">
          {date.toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Dpp Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatRupiah(row.getValue("amount"))}
      </div>
    ),
  },
  {
    id: "total_amount",
    header: () => <div className="text-right">Gross</div>,
    cell: ({ row }) => {
      const amount = Number(row.original.amount || 0);
      const total_amount = Number(row.original.total_amount || 0);
      const displayValue = total_amount || amount;
      return (
        <div className="text-right font-medium font-mono">
          {formatRupiah(displayValue)}
        </div>
      );
    },
  },
  {
    accessorKey: "ppn",
    header: () => <div className="text-right">PPN</div>,
    cell: ({ row }) => {
      const ppn = Number(row.getValue("ppn") || 0);
      return <div className="text-right font-mono">{formatRupiah(ppn)}</div>;
    },
  },
  {
    accessorKey: "success",
    header: "Status",
    cell: ({ row }) => {
      const success = Boolean(row.getValue("success"));
      return (
        <div className="flex items-center gap-2">
          {success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                Data inserted successfully
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 font-medium">Insert failed</span>
            </>
          )}
        </div>
      );
    },
  },
];

// ==================== ZG COLUMNS ====================
export const createInsertZGColumns = (): ColumnDef<InsertZGResult>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="font-medium">
          {date.toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Dpp Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatRupiah(row.getValue("amount"))}
      </div>
    ),
  },
  {
    id: "total_amount",
    header: () => <div className="text-right">Gross</div>,
    cell: ({ row }) => {
      const amount = Number(row.original.amount || 0);
      const total_amount = Number(row.original.total_amount || 0);
      const displayValue = total_amount || amount;
      return (
        <div className="text-right font-medium font-mono">
          {formatRupiah(displayValue)}
        </div>
      );
    },
  },
  {
    accessorKey: "ppn",
    header: () => <div className="text-right">PPN</div>,
    cell: ({ row }) => {
      const ppn = Number(row.getValue("ppn") || 0);
      return <div className="text-right font-mono">{formatRupiah(ppn)}</div>;
    },
  },
  {
    accessorKey: "success",
    header: "Status",
    cell: ({ row }) => {
      const success = Boolean(row.getValue("success"));
      return (
        <div className="flex items-center gap-2">
          {success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                Data inserted successfully
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 font-medium">Insert failed</span>
            </>
          )}
        </div>
      );
    },
  },
];
