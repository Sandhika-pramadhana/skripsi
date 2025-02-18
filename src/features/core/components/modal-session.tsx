/* eslint-disable react/display-name */
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/core/components/ui/alert-dialog";
import { AlertSessionMethods } from '@/types/def';
import { AlertCircleIcon } from 'lucide-react';

export const AlertSession = forwardRef<AlertSessionMethods>((props, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false)
  }));

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex gap-2 items-center">
              <AlertCircleIcon/> Session Habis
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Session Anda habis, silahkan masuk kembali untuk mengakses halaman ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
});
