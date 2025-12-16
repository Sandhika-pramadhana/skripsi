"use client";

import { LogApis } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/features/core/components/ui/button";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import FormDetailLogApiMandiri from "./form-detail";

// Component untuk tombol detail per-row
const ActionComponent: React.FC<{ row: { original: LogApis } }> = ({ row }) => {
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

      <FormDetailLogApiMandiri
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={row.original}
      />
    </>
  );
};

const TruncatedCell: React.FC<{
  value: string | undefined;
  row: { original: LogApis };
}> = ({ value, row }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<LogApis | undefined>(undefined);

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

      <FormDetailLogApiMandiri
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={selectedData}
      />
    </>
  );
};

export const columns: ColumnDef<LogApis>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "process_name",
    header: "Nama Proses",
  },
  {
    accessorKey: "third_party_name",
    header: "Third Party",
  },
  {
    accessorKey: "request_date",
    header: "Tanggal Request",
    cell: (info) => {
      const rawDate = info.getValue();
      if (typeof rawDate === "string") {
        return format(new Date(rawDate), "d MMMM yyyy (HH:mm:ss)", { locale: id });
      }
      return "";
    },
  },
  {
    accessorKey: "request_url",
    header: "Request URL",
  },
  {
    accessorKey: "request_header",
    header: "Request Header",
    cell: ({ row, getValue }) => (
      <TruncatedCell value={getValue() as string} row={row} />
    ),
  },
  {
    accessorKey: "request_payload",
    header: "Request Payload",
    cell: ({ row, getValue }) => (
      <TruncatedCell value={getValue() as string} row={row} />
    ),
  },
  {
    accessorKey: "response_payload",
    header: "Response Payload",
    cell: ({ row, getValue }) => (
      <TruncatedCell value={getValue() as string} row={row} />
    ),
  },
  {
    accessorKey: "response_date",
    header: "Tanggal Response",
    cell: (info) => {
      const rawDate = info.getValue();
      if (typeof rawDate === "string") {
        return format(new Date(rawDate), "d MMMM yyyy (HH:mm:ss)", { locale: id });
      }
      return "";
    },
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row, getValue }) => (
      <TruncatedCell value={getValue() as string} row={row} />
    ),
  },
];