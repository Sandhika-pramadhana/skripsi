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
      const res = await deleteUser(data?.id);
      if (res.success) {
        toast({
          title: "Berhasil",
          description: `User ${data?.name} dengan role ${data?.roleName || '-'} berhasil dihapus`,
        });
        // Mutate both user and role cache keys
        mutate(
          (key) => typeof key === "string" && (
            key.startsWith("userManage-") || 
            key.startsWith("roleManage-")
          )
        );
        onOpenModal(false);
      } else {
        toast({
          title: "Gagal",
          description: res.message || "Data gagal dihapus",
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
  }, [data?.id, data?.name, data?.roleName, onOpenModal, toast]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus User?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus user <strong>{data?.name}</strong>
            {data?.roleName && ` dengan role ${data.roleName}`}? 
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onHandleDelete();
            }}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUser;