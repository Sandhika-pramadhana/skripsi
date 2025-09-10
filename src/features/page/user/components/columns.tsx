/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

"use client";

import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { Button } from "@/features/core/components/ui/button";
import { User } from "@/types/def";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { CircleAlert, PenIcon, Trash } from "lucide-react";
import FormDeleteUsersProps from "./form-delete";
import FormDetailUserProps from "./form-detail";
import FormUser from "./form";

const ActionComponent: React.FC<CellContext<User, unknown>> = ({
    row,
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [openDetailUser, setOpenDetailUser] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
      const roleName = Cookies.get('roleName') || 'client';
      setUserRole(roleName.toLowerCase());
    }, []);

    const hasCrudPermissions = userRole === 'superadmin';

    return (
        <>
            <div className="flex">
                <Button
                  variant={"link"}
                  className="flex gap-3"
                  onClick={() => setOpenDetailUser(true)}
                >
                  <CircleAlert className="mr-2" size={16} />
                </Button>

                {hasCrudPermissions && (
                <Button
                    variant={"link"}
                    className="flex gap-3"
                    onClick={() => setOpen(true)}
                    >
                    <PenIcon className="mr-2" size={16} />
                </Button>
                )}

                {hasCrudPermissions && (
                <Button
                    variant="link"
                    className="text-red-500"
                    onClick={() => {
                        setOpenDelete(true);
                    }}
                    >
                    <Trash className="mr-2" size={16} />
                </Button>
                )}
            </div>

            {hasCrudPermissions && (
            <FormUser
              open={open}
              onOpenModal={setOpen}
              data={row.original}
              isEdit={true}
            />
            )}

            <FormDetailUserProps
              open={openDetailUser}
              onOpenModal={setOpenDetailUser}
              data={row.original}
            />

            {hasCrudPermissions && (
            <FormDeleteUsersProps
              open={openDelete}
              onOpenModal={setOpenDelete}
              data={row.original}
            />
            )}
        </>
    );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "No",
  },
  {
    accessorKey: "name",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "roleName",
    header: "Role",
  },
  {
    header: "Aksi",
    enableHiding: false,
    cell: ActionComponent,
  }
];