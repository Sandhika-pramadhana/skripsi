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
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setOpenDetailUser(true)}
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
                        title="Edit User"
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
                        title="Delete User"
                    >
                        <Trash size={16} />
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
        id: "index",
        header: "No",
        enableHiding: false,
        cell: ({ row }) => {
            return <div className="font-medium">{row.index + 1}</div>;
        },
    },
    {
        accessorKey: "name",
        header: "Nama Lengkap",
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            return (
                <div className="font-medium text-gray-900">
                    {name || "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => {
            const username = row.getValue("username") as string;
            return (
                <div className="font-medium text-gray-900">
                    {username || "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "roleName",
        header: "Role",
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