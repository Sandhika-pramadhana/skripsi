"use client";

import { log_sapico } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/features/core/components/ui/button";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import FormDetailLogSapico from "./form-detail";

const ActionComponent: React.FC<{ row: { original: log_sapico } }> = ({ row }) => {
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
      <FormDetailLogSapico
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={row.original}
      />
    </>
  );
};

const TruncatedCell: React.FC<{
  value: string | undefined;
  row: { original: log_sapico };
}> = ({ value, row }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<log_sapico | undefined>(
    undefined
  );
  if (!value) return null;
  const truncated =
    value.length > 50 ? `${value.substring(0, 50)}...` : value;
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
      <FormDetailLogSapico
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={selectedData}
      />
    </>
  );
};

export const columns: ColumnDef<log_sapico>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "nama_file", header: "Nama File" },
  {
    accessorKey: "response",
    header: "Response",
    cell: (info) => (
      <TruncatedCell
        value={info.getValue() as string}
        row={{ original: info.row.original }}
      />
    ),
  },
  { accessorKey: "tanggal", header: "Tanggal" },
  {
    accessorKey: "url",
    header: "URL",
    cell: (info) => (
      <TruncatedCell
        value={info.getValue() as string}
        row={{ original: info.row.original }}
      />
    ),
  },
  {
    id: "aksi",
    header: "Aksi",
    enableHiding: false,
    cell: (info) => <ActionComponent row={{ original: info.row.original }} />,
  },
];