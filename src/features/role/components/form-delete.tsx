/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { deleteRole } from "@/actions/master/role/role";
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
import { Role } from "@/types/def";
import React, { useCallback } from "react";
import { mutate } from "swr";

interface FormDeleteRoleProps {
    open: boolean;
    onOpenModal: (open: boolean) => void;
    data: Role;
}
    
const DeleteRole: React.FC<FormDeleteRoleProps> = ({ 
  open, 
  onOpenModal,
  data
}) => {
  const { toast } = useToast();
  
  const onHandleDelete = useCallback(async () => {
    try {
      const res = await deleteRole((data?.id));

      if (res.success) {
        toast({
          title: "Berhasil",
          description: `Role ${data?.roleName} berhasil dihapus`,
        });

        mutate(
          (key) => typeof key === "string" && key.startsWith(`roleManage-`)
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
  }, [data.id, data.roleName, onOpenModal, toast]);
    return (
      <AlertDialog open={open} onOpenChange={onOpenModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin ingin menghapus role ini?
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

export default DeleteRole;