import React from "react";
import { Button } from "@/features/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/core/components/ui/dialog";
import { LogApis } from "@/types/def";
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface FormDetailLogApiProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: LogApis;
}

const FormDetailLogApi: React.FC<FormDetailLogApiProps> = ({
  open,
  onOpenModal,
  data,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy (HH:mm:ss)", {
        locale: id,
      });
    } catch {
      return dateString;
    }
  };

  const formatJson = (value?: string) => {
    if (!value) return null;
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Log API</DialogTitle>
        </DialogHeader>
        <div className="px-1 mt-3">
          <DescriptionList
            data={[
              { label: "ID", 
                value: data?.id 
              },
              { label: "Nama Proses",
                 value: data?.process_name
              },
              { label: "Third Party", 
                value: data?.third_party_name 
              },
              {
                label: "Tanggal Request",
                value: data?.request_date
                  ? formatDate(data.request_date)
                  : "-",
              },
              {
                label: "Tanggal Response",
                value: data?.response_date
                  ? formatDate(data.response_date)
                  : "-",
              },
              { label: "Request URL", value: data?.request_url },
              { label: "Deskripsi", value: data?.description },
            ]}
            className={{ container: "mb-3" }}
          />

          {/* Request Header */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-2">Request Header:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {formatJson(data?.request_header) || "No request header"}
            </pre>
          </div>

          {/* Request Payload */}
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2">Request Payload:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {formatJson(data?.request_payload) || "No request payload"}
            </pre>
          </div>

          {/* Response Payload */}
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2">Response Payload:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {formatJson(data?.response_payload) || "No response payload"}
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

export default FormDetailLogApi;
