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
import {
  transaction_mandiri,
  TransactionItem_mandiri,
  TransactionFee_mandiri,
} from "@/types/def";
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface FormDetailTransactionMandiriProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: transaction_mandiri;
  items?: TransactionItem_mandiri[];
  fees?: TransactionFee_mandiri | null;
}

const FormDetailTransactionMandiri: React.FC<FormDetailTransactionMandiriProps> = ({
  open,
  onOpenChange,
  data,
  items = [],
  fees = null,
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "d MMMM yyyy (HH:mm:ss)", { locale: id });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaction Mandiri</DialogTitle>
        </DialogHeader>

        {/* ======================= */}
        {/* TRANSACTION DETAIL */}
        {/* ======================= */}
        <DescriptionList
          data={[
            { label: "ID", value: data?.id },
            { label: "User ID", value: data?.user_id },
            { label: "Location ID", value: data?.location_id },
            { label: "Transaction Date", value: formatDate(data?.transaction_date) },

            { label: "Category ID", value: data?.category_id },
            { label: "Category Name", value: data?.category_name },

            { label: "Item Type ID", value: data?.item_type_id },
            { label: "Item Type Name", value: data?.item_type_name },

            { label: "Product ID", value: data?.product_id },
            { label: "Product Name", value: data?.product_name },

            { label: "Estimation", value: data?.estimation },
            { label: "Payment Type ID", value: data?.payment_type_id },
            { label: "Payment Type Name", value: data?.payment_type_name },

            { label: "Connote Code", value: data?.connote_code },

            { label: "Status ID", value: data?.status_id },
            { label: "Status Name", value: data?.status_name },

            { label: "AWB URL", value: data?.awb_url },
            { label: "Is Bagging", value: String(data?.is_bagging) },

            { label: "Created At", value: formatDate(data?.created_at) },
            { label: "Updated At", value: formatDate(data?.updated_at) },

            { label: "Agent ID", value: data?.agent_id },
            { label: "Account Number", value: data?.account_number },

            { label: "Posdigi Product ID", value: data?.posdigi_product_id },

            { label: "Bill Amount", value: data?.bill_amount },
            { label: "Fee Amount", value: data?.fee_amount },

            { label: "Ref ID", value: data?.ref_id },
            { label: "Receipt Number", value: data?.receipt_number },

            { label: "Connote ID", value: data?.connote_id },

            { label: "Payment Status ID", value: data?.payment_status_id },
            { label: "Payment Status Name", value: data?.payment_status_name },
          ]}
          className={{ container: "mb-3" }}
        />

        {/* ======================= */}
        {/* ITEMS */}
        {/* ======================= */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-lg">Transaction Items</h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada item.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Weight</th>
                  <th className="border p-2">Size</th>
                  <th className="border p-2">Diameter</th>
                  <th className="border p-2">Value</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Insurance</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="border p-2">{item.id}</td>
                    <td className="border p-2">{item.weight}</td>
                    <td className="border p-2">
                      {item.length} x {item.width} x {item.height}
                    </td>
                    <td className="border p-2">{item.diameter}</td>
                    <td className="border p-2">{item.value}</td>
                    <td className="border p-2">{item.description}</td>
                    <td className="border p-2">{String(item.is_insurance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

       {/* ======================= */}
{/* FEES */}
{/* ======================= */}
<div className="mt-6">
  <h2 className="font-semibold mb-2 text-lg">Transaction Fees</h2>

  {!fees ? (
    <p className="text-sm text-gray-500">Tidak ada data fee.</p>
  ) : (
    <table className="w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Fee Amount</th>
          <th className="border p-2">Insurance Amount</th>
          <th className="border p-2">Discount Amount</th>
          <th className="border p-2">Fee Tax Amount</th>
          <th className="border p-2">Insurance Tax Amount</th>
          <th className="border p-2">COD Value</th>
          <th className="border p-2">Total Amount</th>
          <th className="border p-2">Created At</th>
          <th className="border p-2">Updated At</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border p-2">{fees.fee_amount}</td>
          <td className="border p-2">{fees.insurance_amount}</td>
          <td className="border p-2">{fees.discount_amount}</td>
          <td className="border p-2">{fees.fee_tax_amount}</td>
          <td className="border p-2">{fees.insurance_tax_amount}</td>
          <td className="border p-2">{fees.cod_value}</td>
          <td className="border p-2">{fees.total_amount}</td>
          <td className="border p-2">{formatDate(fees.created_at)}</td>
          <td className="border p-2">{formatDate(fees.updated_at)}</td>
        </tr>
      </tbody>
    </table>
  )}
</div>
        <DialogFooter className="py-1 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kembali
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDetailTransactionMandiri;
