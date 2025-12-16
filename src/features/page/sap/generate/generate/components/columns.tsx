"use client";
import { log_sapico } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";

const CurrencyCell: React.FC<{ value: number | string | undefined }> = ({ value }) => {
  if (value === undefined || value === null) return null;
  
  // Kalau sudah string (dari API yang sudah formatted), langsung tampilkan
  if (typeof value === 'string') {
    return <span>Rp {value}</span>;
  }
  
  // Kalau number, format dulu
  return (
    <span>
      {new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(value)}
    </span>
  );
};

const NumberCell: React.FC<{ value: number | string | undefined }> = ({ value }) => {
  if (value === undefined || value === null) return null;
  
  // Kalau sudah string (dari API yang sudah formatted), langsung tampilkan
  if (typeof value === 'string') {
    return <span>{value}</span>;
  }
  
  // Kalau number, format dulu
  return (
    <span>
      {new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
      }).format(value)}
    </span>
  );
};

export const columns: ColumnDef<log_sapico>[] = [
  { accessorKey: "date", header: "Date" },
  { 
    accessorKey: "direct", 
    header: "Direct",
    cell: (info) => <NumberCell value={info.getValue() as number | string} />,
  },
  { 
    accessorKey: "indirect", 
    header: "Indirect",
    cell: (info) => <NumberCell value={info.getValue() as number | string} />,
  },
  { 
    accessorKey: "thirdparty", 
    header: "Third Party",
    cell: (info) => <NumberCell value={info.getValue() as number | string} />,
  },
  {
    accessorKey: "dpp",
    header: "DPP",
    cell: (info) => <CurrencyCell value={info.getValue() as number | string} />,
  },
  {
    accessorKey: "gross_revenue",
    header: "Gross Revenue",
    cell: (info) => <CurrencyCell value={info.getValue() as number | string} />,
  },

  {
    accessorKey: "ppn",
    header: "PPN",
    cell: (info) => (
      <span className="text-black-600 font-mono">
        <CurrencyCell value={info.getValue() as number | string} />
      </span>
    ),
  },
];
