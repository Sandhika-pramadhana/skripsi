"use client";

import React from "react";
import { X } from "lucide-react"; 
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
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-20 p-6">
          <DialogTitle className="flex items-center justify-between">
            <span>Detail Log SAPICO</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 ml-2"
              onClick={() => onOpenModal(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
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

        {/* Fixed Footer */}
        <DialogFooter className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 z-20">
          <Button variant="outline" onClick={() => onOpenModal(false)}>
            Kembali
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDetailLogSapico;
