"use client";

import { ListTransactionData } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
    accessorKey: "cityFrom",
    header: "Kota Asal",
  },
  {
    accessorKey: "cityTo",
    header: "Kota Tujuan",
  },
  {
    accessorKey: "gtv",
    header: "GTV",
    cell: (info) => {
      const gtv = info.getValue() as string;
      return <b>{gtv}</b>;
    },
  },
  {
    accessorKey: "fee",
    header: "FEE",
    cell: (info) => {
      const fee = info.getValue() as string;
      return <b>{fee}</b>;
    },
  }
];