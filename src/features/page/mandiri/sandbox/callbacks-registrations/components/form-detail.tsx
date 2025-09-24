"use client";

import React from "react";
import { Button } from "@/features/core/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/features/core/components/ui/dialog";
import { callback_registrations } from "@/types/def";
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";

interface FormDetailCallbackRegistrationsProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: callback_registrations;
}

const FormDetailCallbackRegistrations: React.FC<FormDetailCallbackRegistrationsProps> = ({
  open,
  onOpenModal,
  data,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Callback Registrations</DialogTitle>
        </DialogHeader>
        <div className="px-1 mt-3">
          <DescriptionList
            data={[
              { label: "ID", value: data?.id },
              { label: "Unique ID", value: data?.uniq_id },
              { label: "Location ID", value: data?.location_id || "-" },
              { label: "No Pend", value: data?.nopend || "-" },
              { label: "API Key", value: data?.api_key || "-" },
              { label: "Username", value: data?.username || "-" },
              { label: "Status ID", value: data?.status_id || "-" },
              { label: "Status Message", value: data?.status_message || "-" },
            ]}
            className={{ container: "mb-3" }}
          />

          {/* Payload */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-2">Payload:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {data?.payload ? JSON.stringify(data.payload, null, 2) : 'No payload data'}
            </pre>
          </div>
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

export default FormDetailCallbackRegistrations;
