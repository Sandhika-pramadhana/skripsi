"use client";

// import { Badge } from "@/features/core/components/ui/badge";
import { ListTransactionData } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const statusColors: { [key: string]: string } = {
  "Pesanan Dibuat": "bg-blue-500",
  "Pesanan Terbayar": "bg-green-700",
  "Kurir ditugaskan": "bg-yellow-700",
  "Pickup berhasil": "bg-orange-700",
  "Dalam Proses Pengiriman": "bg-yellow-500",
  "Dalam Proses Pengantaran": "bg-orange-500",
  "Kiriman tiba": "bg-green-500",
  "Kurang bayar": "bg-gray-500",
  "Pesanan Dibatalkan": "bg-black",
  "Gagal antar": "bg-red-500"
};

export const columns: ColumnDef<ListTransactionData>[] = [
  {
    accessorKey: "bookingId",
    header: "Nomor Booking",
  },
  {
    accessorKey: "bookingDate",
    header: "Tanggal Booking",
    cell: (info) => {
      const rawDate = info.getValue();
      if (typeof rawDate === 'string') {
        return format(new Date(rawDate), 'd MMMM yyyy (HH:mm:ss)', { locale: id });
      }
      return '';
    },
  },
  {
    accessorKey: "userId",
    header: "Nomor User",
  },
  {
    accessorKey: "cityFrom",
    header: "Kota Asal",
  },
  {
    accessorKey: "cityTo",
    header: "Kota Tujuan",
  },
  {
    accessorKey: "statusName",
    header: "Status",
    cell: (info) => {
      const status = info.getValue() as string;
      const badgeColor = statusColors[status as keyof typeof statusColors] || "bg-gray-200";
      return (
        <div className="flex gap-1 items-center">
          <div className={`${badgeColor} w-2 h-2 rounded-full`}></div>
          {status}
        </div>
      );
    }
  }
];