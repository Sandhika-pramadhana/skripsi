"use client";

import React from "react";
import { Button } from "@/features/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/core/components/ui/dialog";
import { sapico } from "@/types/def";
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";

interface FormDetailSapicoProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: sapico;
}

const formatValue = (value: any) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    return (
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return String(value);
};

const FormDetailSapico: React.FC<FormDetailSapicoProps> = ({
  open,
  onOpenModal,
  data,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail SAPICO</DialogTitle>
        </DialogHeader>

        <div className="px-1 mt-3">
          <DescriptionList
            data={[
              { label: "ID", value: formatValue(data?.id) },
              { label: "Tanggal Transaksi", value: formatValue(data?.tgl_trx) },
              { label: "ID Number", value: formatValue(data?.id_number) },
              { label: "Amount", value: formatValue(data?.amount) },
              { label: "COA", value: formatValue(data?.coa) },
              { label: "SGTXT", value: formatValue(data?.sgtxt) },
              { label: "Keterangan", value: formatValue(data?.ket) },
              { label: "Flag", value: formatValue(data?.flag) },
              { label: "No Dokumen", value: formatValue(data?.no_doc) },
              { label: "File", value: formatValue(data?.file) },
              { label: "Tanggal Hit", value: formatValue(data?.tgl_hit) },
            ]}
            className={{ container: "mb-3" }}
          />
        </div>

        <DialogFooter className="py-1 mt-4">
          <Button variant="outline" onClick={() => onOpenModal(false)}>
            Kembali
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDetailSapico;
