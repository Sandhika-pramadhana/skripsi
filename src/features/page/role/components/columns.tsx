/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { Button } from "@/features/core/components/ui/button";
import { Role } from "@/types/def";
export type { Role } from "@/types/def";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { CircleAlert, PenIcon, Trash } from "lucide-react";
import FormDeleteRoleProps from "./form-delete";
import FormRole from "./form";
import FormDetailRoleProps from "./form-detail";

const ActionComponent: React.FC<CellContext<Role, unknown>> = ({
    row,
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [openDetailRole, setOpenDetailRole] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
      const roleName = Cookies.get('roleName') || 'client';
      setUserRole(roleName.toLowerCase());
    }, []);

    const hasCrudPermissions = userRole === 'superadmin';
    
    return (
        <>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setOpenDetailRole(true)}
                    title="View Details"
                >
                    <CircleAlert size={16} />
                </Button>
                {hasCrudPermissions && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setOpen(true)}
                    title="Edit Role"
                >
                    <PenIcon size={16} />
                </Button>
                )}
                {hasCrudPermissions && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setOpenDelete(true)}
                    title="Delete Role"
                >
                    <Trash size={16} />
                </Button>
                )}
            </div>
            
            {hasCrudPermissions && (
            <FormRole
                open={open}
                onOpenModal={setOpen}
                data={row.original}
                isEdit={true}
            />
            )}
            <FormDetailRoleProps
                open={openDetailRole}
                onOpenModal={setOpenDetailRole}
                data={row.original}
            />
            {hasCrudPermissions && (
            <FormDeleteRoleProps
                open={openDelete}
                onOpenModal={setOpenDelete}
                data={row.original}
            />
            )}
        </>
    );
};

export const columns: ColumnDef<Role>[] = [
    {
        id: "index",
        header: "No",
        enableHiding: false,
        cell: ({ row }) => {
            return <div className="font-medium">{row.index + 1}</div>;
        },
    },
    {
        accessorKey: "roleName",
        header: "Nama Role",
        cell: ({ row }) => {
            const roleName = row.getValue("roleName") as string;
            return (
                <div className="font-medium text-gray-900">
                    {roleName || "-"}
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Aksi",
        enableHiding: false,
        enableSorting: false,
        cell: ActionComponent,
    }
];