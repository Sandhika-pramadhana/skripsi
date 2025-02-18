"use client";

import { TrafficReportMyTsel } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const columns: ColumnDef<TrafficReportMyTsel>[] = [
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: (info) => {
      const rawDate = info.getValue();
      if (typeof rawDate === 'string') {
        return format(new Date(rawDate), 'd MMMM yyyy', { locale: id });
      }
      return '';
    },
  },
  {
    accessorKey: "activeUser",
    header: "Pengguna Aktif",
  },
  {
    accessorKey: "viewCount",
    header: "Traffic",
  }
];