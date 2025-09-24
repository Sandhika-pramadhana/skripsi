import React from "react";
import { Button } from "@/features/core/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/features/core/components/ui/dialog";
import { callbacks } from "@/types/def";
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface FormDetailCallbackProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: callbacks;
}

const FormDetailCallback: React.FC<FormDetailCallbackProps> = ({
  open,
  onOpenModal,
  data,
}) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'd MMMM yyyy (HH:mm:ss)', { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Callback Order</DialogTitle>
        </DialogHeader>
        <div className="px-1 mt-3">
          <DescriptionList
            data={[
              {
                label: "ID",
                value: data?.id,
              },
              {
                label: "Order ID",
                value: data?.order_id,
              },
              {
                label: "User ID",
                value: data?.user_id,
              },
              {
                label: "Tanggal Order",
                value: data?.order_date ? formatDate(data.order_date) : '-',
              },
              {
                label: "Tipe ID",
                value: data?.type_id,
              },
              {
                label: "Tipe Name",
                value: data?.type_name,
              },
              {
                label: "Jumlah Bayar",
                value: data?.paid_amount ? formatCurrency(data.paid_amount) : '-',
              },
              {
                label: "VA Number",
                value: data?.va_number || '-',
              },
              {
                label: "Tanggal Bayar",
                value: data?.paid_date ? formatDate(data.paid_date) : '-',
              },
              {
                label: "Status ID",
                value: data?.status_id || '-',
              },
              {
                label: "Status Name",
                value: data?.status_name || '-',
              },
              {
                label: "Status Message",
                value: data?.status_message || '-',
              }
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
          <Button 
            variant="outline" 
            onClick={() => onOpenModal(false)}
          >
            Kembali
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDetailCallback;