/* eslint-disable no-unused-vars */
import React from "react";
import { Button } from "@/features/core/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/features/core/components/ui/dialog";
import { User } from "@/types/def";
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";
import { Badge } from "@/features/core/components/ui/badge";

interface FormDetailUserProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: User;
}

const FormDetailUser: React.FC<FormDetailUserProps> = ({
  open,
  onOpenModal,
  data,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail User</DialogTitle>
        </DialogHeader>
        <div className="px-1 mt-3">
          <DescriptionList
            data={[
              {
                label: "ID User",
                value: data?.id || "-",
              },
              {
                label: "Nama Lengkap",
                value: data?.name || "-",
              },
              {
                label: "Username",
                value: data?.username || "-",
              },
              {
                label: "Password",
                value: "********",
              },
              {
                label: "Role",
                value: data?.roleName || "-",
              }
            ]}
            className={{ container: "mb-3" }}
          />
        </div>
        <DialogFooter className="py-1 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenModal(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDetailUser;