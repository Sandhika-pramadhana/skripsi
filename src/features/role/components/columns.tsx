/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use client";

import { Button } from "@/features/core/components/ui/button";
import { Role } from "@/types/def";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { CircleAlert, PenIcon, Trash } from "lucide-react";
import { useState } from "react";
import FormDeleteRoleProps from "./form-delete";
import FormRole from "./form";
import FormDetailRoleProps from "./form-detail";

const ActionComponent: React.FC<CellContext<Role, unknown>> = ({
    row,
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [openDetailRole, setOpenDetailRole] = useState<boolean>(false);

    return (
        <>
            <div className="flex">
                <Button
                  variant={"link"}
                  className="flex gap-3"
                  onClick={() => setOpenDetailRole(true)}
                >
                  <CircleAlert className="mr-2" size={16} />
                </Button>

                {/* <Button
                    variant={"link"}
                    className="flex gap-3"
                    onClick={() => setOpen(true)}
                    >
                    <PenIcon className="mr-2" size={16} />
                </Button>

                <Button
                    variant="link"
                    className="text-red-500"
                    onClick={() => {
                        setOpenDelete(true);
                    }}
                    >
                    <Trash className="mr-2" size={16} />
                </Button> */}
            </div>

            <FormRole
              open={open}
              onOpenModal={setOpen}
              data={row.original}
              isEdit={true}
            />

            <FormDetailRoleProps
              open={openDetailRole}
              onOpenModal={setOpenDetailRole}
              data={row.original}
            />

            <FormDeleteRoleProps
                open={openDelete}
                onOpenModal={setOpenDelete}
                data={row.original}
            />
        </>
    );
};

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "id",
    header: "No",
  },
  {
    accessorKey: "roleName",
    header: "Nama Role",
  },
  {
    header: "Aksi",
    enableHiding: false,
    cell: ActionComponent,
  }
];