import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/core/components/ui/alert-dialog";
import { AlertCircleIcon } from "lucide-react";

export const AlertSession = () => {
  const [open] = useState(false);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex gap-2 items-center">
              <AlertCircleIcon /> Session Habis
            </div>
          </AlertDialogTitle>

          <AlertDialogDescription className="text-base">
            Session Anda habis, silahkan masuk kembali untuk mengakses halaman
            ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};