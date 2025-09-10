"use client";

import { callbacks } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/features/core/components/ui/button";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import FormDetailCallback from "./form-detail";

// Component untuk tombol detail per-row
const ActionComponent: React.FC<{ row: { original: callbacks } }> = ({ row }) => {
  const [openDetail, setOpenDetail] = useState<boolean>(false);

  return (
    <>
      <div className="flex">
        <Button
          variant={"link"}
          className="flex gap-3"
          onClick={() => setOpenDetail(true)}
        >
          <CircleAlert className="mr-2" size={16} />
          Detail
        </Button>
      </div>

      <FormDetailCallback
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={row.original}
      />
    </>
  );
};

// Helper render cell panjang
const TruncatedCell: React.FC<{
  value: string | undefined;
  row: { original: callbacks };
}> = ({ value, row }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<callbacks | undefined>(undefined);

  if (!value) return null;

  const truncated = value.length > 50 ? `${value.substring(0, 50)}...` : value;

  return (
    <>
      <div className="flex items-center gap-2">
        <span>{truncated}</span>
        {value.length > 50 && (
          <Button
            variant="link"
            className="p-0 text-blue-600"
            onClick={() => {
              setSelectedData(row.original);
              setOpenDetail(true);
            }}
          >
            More
          </Button>
        )}
      </div>

      <FormDetailCallback
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={selectedData}
      />
    </>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const columns: ColumnDef<callbacks>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "order_id",
    header: "Order ID",
  },
  {
    accessorKey: "user_id",
    header: "User ID",
  },
  {
    accessorKey: "order_date",
    header: "Tanggal Order",
    cell: (info) => {
      const rawDate = info.getValue();
      if (typeof rawDate === "string") {
        return format(new Date(rawDate), "d MMMM yyyy (HH:mm:ss)", { locale: id });
      }
      return "";
    },
  },
  {
    accessorKey: "type_name",
    header: "Tipe",
  },
  {
    accessorKey: "paid_amount",
    header: "Jumlah Bayar",
    cell: (info) => {
      const amount = info.getValue() as number;
      return formatCurrency(amount);
    },
  },
  {
    accessorKey: "va_number",
    header: "VA Number",
  },
  {
    accessorKey: "paid_date",
    header: "Tanggal Bayar",
    cell: (info) => {
      const rawDate = info.getValue();
      if (typeof rawDate === "string" && rawDate) {
        return format(new Date(rawDate), "d MMMM yyyy (HH:mm:ss)", { locale: id });
      }
      return "-";
    },
  },
  {
    accessorKey: "status_name",
    header: "Status",
    cell: (info) => {
      const status = info.getValue() as string;
      const statusColor = status === 'SUCCESS' ? 'bg-green-500' : 
                         status === 'PENDING' ? 'bg-yellow-500' : 
                         status === 'FAILED' ? 'bg-red-500' : 'bg-gray-500';
      return (
        <div className="flex gap-1 items-center">
          <div className={`${statusColor} w-2 h-2 rounded-full`}></div>
          {status || '-'}
        </div>
      );
    },
  },
  {
    header: "Aksi",
    enableHiding: false,
    cell: ActionComponent,
  },
];