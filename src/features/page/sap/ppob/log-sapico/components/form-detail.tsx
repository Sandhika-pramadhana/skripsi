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
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";
import { log_sapico } from "@/types/def";

interface FormDetailLogSapicoProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: log_sapico;
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

const FormDetailLogSapico: React.FC<FormDetailLogSapicoProps> = ({
  open,
  onOpenModal,
  data,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Log SAPICO</DialogTitle>
        </DialogHeader>

        <div className="px-1 mt-3">
          <DescriptionList
            data={[
              { label: "ID", value: formatValue(data?.id) },
              { label: "Nama File", value: formatValue(data?.nama_file) },
              { label: "Response", value: formatValue(data?.response) },
              { label: "Tanggal", value: formatValue(data?.tanggal) },
              { label: "URL", value: formatValue(data?.url) },
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

export default FormDetailLogSapico;
