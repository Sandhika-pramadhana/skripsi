'use client';

import { useEffect, useState, Fragment } from "react";
import Cookies from 'js-cookie';
import { columns } from "./columns";
import {
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  PaginationState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/core/components/ui/table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  Rows3,
  Users2,   // ✅ perbaikan import
  Plus,
} from "lucide-react";

import { useLocalStorage } from "@uidotdev/usehooks";
import { Button } from "@/features/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/features/core/components/ui/dropdown-menu";
import { getUsers } from "@/actions/master/user/user";
import useSWR from "swr";
import { unwrap } from "@/actions/use-action";
import FormUser from "./form";

type Preference = {
  columnVisibility: VisibilityState | null;
};
const preferenceInit: Preference = {
  columnVisibility: null,
};

export function ListUsers() {
  const [preference, savePreference] = useLocalStorage<Preference>(
    "list-transaction-preference",
    preferenceInit
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [open, setOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // Get user role from cookies
    const roleName = Cookies.get("roleName") || "client";
    setUserRole(roleName.toLowerCase());
  }, []);

  const {
    data: userManage,
    isLoading,
  } = useSWR(
    `userManage-${JSON.stringify(pagination)}`,
    async () => {
      try {
        return await unwrap(
          getUsers({
            page: pagination.pageIndex + 1,
            page_size: pagination.pageSize,
          })
        );
      } catch (error) {
        throw error;
      }
    },
    {
      keepPreviousData: true,
    }
  );

  const table = useReactTable({
    data: userManage?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      columnVisibility,
    },
    manualPagination: true,
  });

  // 🔧 Restore dari localStorage sekali saat mount
  useEffect(() => {
    if (preference.columnVisibility) {
      setColumnVisibility(preference.columnVisibility);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔧 Simpan ke localStorage hanya kalau beda
  useEffect(() => {
    if (
      JSON.stringify(preference.columnVisibility) !==
      JSON.stringify(columnVisibility)
    ) {
      savePreference((prev) => ({
        ...prev,
        columnVisibility,
      }));
    }
  }, [columnVisibility, preference.columnVisibility, savePreference]);

  // Check if user has CRUD permissions
  const hasCrudPermissions = userRole === "superadmin";
  const hasViewPermissions = userRole === "superadmin" || userRole === "admin";

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Daftar Data User</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {hasCrudPermissions && (
          <Button
            variant="outline"
            className="bg-[#003366] text-white hover:bg-[#275d94] hover:text-white"
            onClick={() => setOpen(true)}
          >
            <Plus /> Tambah User
          </Button>
        )}
        {!hasCrudPermissions && <div></div>}
        <div className="flex items-center w-full justify-between gap-4">
          {/* Input Search */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Rows3 /> Tampilkan Kolom{" "}
                <ChevronDownIcon size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {table.getAllLeafColumns().map((column) => {
                if (!column.getCanHide()) {
                  return null;
                }

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    id={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={() => column.toggleVisibility()}
                  >
                    {column.columnDef.header as string}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* End of Controls */}

      {!hasViewPermissions && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Users2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Akses Terbatas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Anda tidak memiliki akses untuk melihat data user.
            </p>
          </div>
        </div>
      )}

      {hasViewPermissions && (
        <>
          <div className="rounded-md border mb-4">
            <Table className="max-h-[calc(100dvh-18rem)] custom-scrollbar">
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <LoaderCircleIcon className="animate-spin" />
                        <p>Loading...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <footer>
            <div className="flex items-center justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon /> Sebelumnya
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon /> Selanjutnya
              </Button>
            </div>
          </footer>
        </>
      )}

      {hasCrudPermissions && (
        <FormUser open={open} onOpenModal={setOpen} isEdit={false} />
      )}
    </main>
  );
}

export default ListUsers;
