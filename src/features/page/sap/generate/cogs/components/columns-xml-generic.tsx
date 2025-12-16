import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, FileCode, AlertCircle } from "lucide-react";
import { GenerateXmlZYResult } from "@/types/def";

export const createXmlColumns = (): ColumnDef<GenerateXmlZYResult>[] => [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      if (status === "success") {
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">
              Posted to SAP (ZY)
            </span>
          </div>
        );
      }

      if (status === "xml_created") {
        return (
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600 font-medium">
              XML Created (ZY)
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-yellow-600 font-medium">
            Skipped (ZY)
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "xmlFile",
    header: "XML File",
    cell: ({ row }) => {
      const filename = row.getValue("xmlFile") as string;
      return filename ? (
        <span className="text-sm font-mono text-gray-700">{filename}</span>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Total Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("total_amount") as number;
      return amount ? (
        <div className="text-right font-medium font-mono">
          Rp {amount.toLocaleString("id-ID")}
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      const status = row.original.status;

      return message ? (
        <span
          className={`text-sm ${
            status === "success"
              ? "text-green-600"
              : status === "xml_created"
              ? "text-blue-600"
              : "text-yellow-600"
          }`}
        >
          {message}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
];
