"use client";

import { useState } from "react";
import type {
  transaction_mandiri,
  TransactionItem_mandiri,
  TransactionFee_mandiri,
} from "@/types/def";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/features/core/components/ui/button";
import FormDetailTransactionMandiri from "./form-detail";
import { getTransactionMandiriById } from "@/actions/prod/mandiri/transaction-mandiri/transaction";
import { InfoIcon } from "lucide-react";

const ActionComponent: React.FC<{ row: { original: transaction_mandiri } }> = ({
  row,
}) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<{
    transaction: transaction_mandiri;
    items: TransactionItem_mandiri[];
    fees: TransactionFee_mandiri | null;
  } | null>(null);

  const handleDetailClick = async () => {
    setLoading(true);
    try {
      const result = await getTransactionMandiriById(row.original.id);

      if (!result.success) {
        console.error("Error:", result.message);
        return;
      }

      if (!result.data) {
        console.error("Data transaction tidak ditemukan.");
        return;
      }

      const { transaction, items, fees } = result.data;
      setDetailData({ transaction, items, fees });
      setOpenDetail(true);
    } catch (error) {
      console.error("Error fetching transaction detail:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 bg-transparent hover:bg-transparent shadow-none"
        onClick={handleDetailClick}
        disabled={loading}
      >
        {loading ? (
          "Loading..."
        ) : (
          <>
            <InfoIcon className="w-4 h-4" />
            <span>Detail</span>
          </>
        )}
      </Button>

      <FormDetailTransactionMandiri
        open={openDetail}
        onOpenChange={setOpenDetail}
        data={detailData?.transaction}
        items={detailData?.items || []}
        fees={detailData?.fees || null}
      />
    </>
  );
};

export const columns: ColumnDef<transaction_mandiri>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "user_id", header: "User ID" },
  { accessorKey: "location_id", header: "Location ID" },
  { accessorKey: "transaction_date", header: "Transaction Date" },
  { accessorKey: "category_id", header: "Category ID" },
  { accessorKey: "category_name", header: "Category Name" },
  { accessorKey: "item_type_id", header: "Item Type ID" },
  { accessorKey: "item_type_name", header: "Item Type Name" },
  { accessorKey: "product_id", header: "Product ID" },
  { accessorKey: "product_name", header: "Product Name" },
  { accessorKey: "estimation", header: "Estimation" },
  { accessorKey: "payment_type_id", header: "Payment Type ID" },
  { accessorKey: "payment_type_name", header: "Payment Type Name" },
  { accessorKey: "connote_code", header: "Connote Code" },
  { accessorKey: "status_id", header: "Status ID" },
  { accessorKey: "status_name", header: "Status Name" },
  { accessorKey: "awb_url", header: "AWB URL" },
  { accessorKey: "is_bagging", header: "Is Bagging" },
  { accessorKey: "created_at", header: "Created At" },
  { accessorKey: "updated_at", header: "Updated At" },
  { accessorKey: "agent_id", header: "Agent ID" },
  { accessorKey: "account_number", header: "Account Number" },
  { accessorKey: "posdigi_product_id", header: "Posdigi Product ID" },
  { accessorKey: "bill_amount", header: "Bill Amount" },
  { accessorKey: "fee_amount", header: "Fee Amount" },
  { accessorKey: "ref_id", header: "Ref ID" },
  { accessorKey: "receipt_number", header: "Receipt Number" },
  { accessorKey: "connote_id", header: "Connote ID" },
  { accessorKey: "payment_status_id", header: "Payment Status ID" },
  { accessorKey: "payment_status_name", header: "Payment Status Name" },

  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <ActionComponent row={row} />,
  },
];
