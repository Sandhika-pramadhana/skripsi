"use client";
import { callback_registrations } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/features/core/components/ui/button";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import FormDetailCallbackMandiri from "./form-detail";

// Component untuk tombol detail per-row
const ActionComponent: React.FC<{ row: { original: callback_registrations } }> = ({ row }) => {
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
      <FormDetailCallbackMandiri
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={row.original}
      />
    </>
  );
};

// Helper render cell panjang untuk status_message
const TruncatedCell: React.FC<{
  value: string | undefined;
  row: { original: callback_registrations };
}> = ({ value, row }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<callback_registrations | undefined>(undefined);
  
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
      <FormDetailCallbackMandiri
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={selectedData}
      />
    </>
  );
};

export const columns: ColumnDef<callback_registrations>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "uniq_id",
    header: "Unique ID",
  },
  {
    accessorKey: "location_id",
    header: "Location ID",
  },
  {
    accessorKey: "nopend",
    header: "No Pend",
  },
  {
    accessorKey: "api_key",
    header: "API Key",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "status_id",
    header: "Status ID",
  },
  {
    accessorKey: "status_message",
    header: "Status Message",
    cell: (info) => (
      <TruncatedCell 
        value={info.getValue() as string | undefined} 
        row={{ original: info.row.original }} 
      />
    ),
  },
  {
    accessorKey: "payload",
    header: "Payload",
    cell: (info) => {
      const payload = info.getValue() as Record<string, any> | null | undefined;
      if (!payload) return "-";
      return <pre className="max-w-xs truncate">{JSON.stringify(payload)}</pre>;
    },
  },
  {
    header: "Aksi",
    enableHiding: false,
    cell: (info) => <ActionComponent row={{ original: info.row.original }} />,
  },
];