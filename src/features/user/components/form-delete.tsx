/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { deleteUser } from "@/actions/master/user/user";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/features/core/components/ui/alert-dialog";
import { useToast } from "@/features/core/hooks/use-toast";
import { User } from "@/types/def";
import React, { useCallback } from "react";
import { mutate } from "swr";

interface FormDeleteUsersProps {
    open: boolean;
    onOpenModal: (open: boolean) => void;
    data: User;
}
    
const DeleteUser: React.FC<FormDeleteUsersProps> = ({ 
  open, 
  onOpenModal,
  data
}) => {
  const { toast } = useToast();
  
  const onHandleDelete = useCallback(async () => {
    try {
      const res = await deleteUser((data?.id));

      if (res.success) {
        toast({
          title: "Berhasil",
          description: `User ${data?.name} berhasil dihapus`,
        });

        mutate(
          (key) => typeof key === "string" && key.startsWith(`userManage-`)
        );

        onOpenModal(false);
      } else {
        toast({
          title: "Gagal",
          description: "Data gagal dihapus",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menghapus data",
        variant: "destructive",
      });
    }
  }, [data.id, data.name, onOpenModal, toast]);
    return (
      <AlertDialog open={open} onOpenChange={onOpenModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin ingin menghapus user ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
            className="bg-[#003366]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onHandleDelete();
            }}
          >Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

export default DeleteUser;