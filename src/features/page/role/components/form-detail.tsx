/* eslint-disable no-unused-vars */
import React from "react";
import { Button } from "@/features/core/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/features/core/components/ui/dialog";
import { Role } from "@/types/def";
import { DescriptionList } from "@/features/core/components/ui/custom/description-list";

interface FormDetailRoleProps {
  open: boolean;
  onOpenModal: (open: boolean) => void;
  data?: Role;
}

const FormDetailRole: React.FC<FormDetailRoleProps> = ({
  open,
  onOpenModal,
  data,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detail Data Role</DialogTitle>
        </DialogHeader>
        <div className="px-1 mt-3">
        <DescriptionList
            data={[
                  {
                    label: "ID Role",
                    value: data?.id,
                  },
                  {
                    label: "Nama Role",
                    value: data?.roleName,
                  }
                ]}
            className={{ container: "mb-3" }}
        />
        </div>
        <DialogFooter className="py-1 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenModal(false)}
          >Kembali
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDetailRole;