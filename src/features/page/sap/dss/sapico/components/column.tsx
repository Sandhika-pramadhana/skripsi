 "use client";
import { sapico } from "@/types/def";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/features/core/components/ui/button";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import FormDetailSapico from "./form-detail";


const ActionComponent: React.FC<{ row: { original: sapico } }> = ({ row }) => {
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

      <FormDetailSapico
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={row.original}
      />
    </>
  );
};


const TruncatedCell: React.FC<{
  value: string | undefined;
  row: { original: sapico };
}> = ({ value, row }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<sapico | undefined>(undefined);

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

      <FormDetailSapico
        open={openDetail}
        onOpenModal={setOpenDetail}
        data={selectedData}
      />
    </>
  );
};


export const columns: ColumnDef<sapico>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "tgl_trx", header: "Tanggal Transaksi" },
  { accessorKey: "id_number", header: "ID Number" },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "coa", header: "COA" },

  {
    accessorKey: "sgtxt",
    header: "SGTXT",
    cell: (info) => (
      <TruncatedCell
        value={info.getValue() as string}
        row={{ original: info.row.original }}
      />
    ),
  },

  {
    accessorKey: "ket",
    header: "Keterangan",
    cell: (info) => (
      <TruncatedCell
        value={info.getValue() as string}
        row={{ original: info.row.original }}
      />
    ),
  },

  { accessorKey: "flag", header: "Flag" },
  { accessorKey: "no_doc", header: "No Dokumen" },

  {
    accessorKey: "file",
    header: "File",
    cell: (info) => (
      <TruncatedCell
        value={info.getValue() as string}
        row={{ original: info.row.original }}
      />
    ),
  },

  { accessorKey: "tgl_hit", header: "Tanggal Hit" },

  {
    header: "Aksi",
    enableHiding: false,
    cell: (info) => <ActionComponent row={{ original: info.row.original }} />,
  },
];
