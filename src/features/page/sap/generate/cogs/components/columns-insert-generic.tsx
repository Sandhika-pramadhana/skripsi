import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { 
  InsertZYResult, 
  InsertZZResult 
} from "@/types/def";

const formatRupiah = (value: any) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

// ==================== ZY COLUMNS ====================
/**
 * CREATE COLUMNS FOR ZY - MANUAL COGS INPUT
 * Kolom: date, amount, status
 * Style konsisten dengan ZD, ZE, ZF, ZG
 */
export const createInsertZYColumns = (): ColumnDef<InsertZYResult>[] => [
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
    header: () => <div className="text-right font-medium">COGS</div>,
    cell: ({ row }) => (
      <div className="text-right font-bold font-mono text-black-700 px-2 py-1 rounded">
        {formatRupiah(row.getValue("amount"))}
      </div>
    ),
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

// ==================== ZZ COLUMNS ====================
/**
 * CREATE COLUMNS FOR ZZ - MANUAL COGS INPUT
 * Kolom: date, amount, status
 * Style konsisten dengan ZD, ZE, ZF, ZG, ZY
 */
export const createInsertZZColumns = (): ColumnDef<InsertZZResult>[] => [
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
    header: () => <div className="text-right font-medium">COGS</div>,
    cell: ({ row }) => (
      <div className="text-right font-bold font-mono text-black-700 px-2 py-1 rounded">
        {formatRupiah(row.getValue("amount"))}
      </div>
    ),
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
