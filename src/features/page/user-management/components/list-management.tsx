'use client';

import { useEffect, useState, Fragment } from "react";
import Cookies from 'js-cookie';
import { columns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
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
  Users2,
  Plus,
  Search,
} from "lucide-react";

import { useLocalStorage } from "@uidotdev/usehooks";
import { Button } from "@/features/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/features/core/components/ui/dropdown-menu";
import { Input } from "@/features/core/components/ui/input";
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
    "list-user-management-preference",
    preferenceInit
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [open, setOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const roleName = Cookies.get("roleName") || "client";
    setUserRole(roleName.toLowerCase());
  }, []);

  const {
    data: userManage,
    isLoading,
    error,
  } = useSWR(
    `userManage-${JSON.stringify(pagination)}-${searchQuery}`,
    async () => {
      try {
        return await unwrap(
          getUsers({
            page: pagination.pageIndex + 1,
            page_size: pagination.pageSize,
          })
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
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
    pageCount: -1,
  });

  // Restore dari localStorage sekali saat mount
  useEffect(() => {
    if (preference.columnVisibility) {
      setColumnVisibility(preference.columnVisibility);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simpan ke localStorage hanya kalau beda
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

  // Reset pagination when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchQuery]);

  // Check if user has CRUD permissions
  const hasCrudPermissions = userRole === "superadmin";
  const hasViewPermissions = userRole === "superadmin" || userRole === "admin";

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data user dan role dalam satu tempat
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          {hasCrudPermissions && (
            <Button
              variant="outline"
              className="bg-[#003366] text-white hover:bg-[#275d94] hover:text-white"
              onClick={() => setOpen(true)}
            >
              <Plus size={16} className="mr-2" /> Tambah User
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Cari nama atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Rows3 size={16} className="mr-2" /> Kolom
                <ChevronDownIcon size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
                        <TableHead key={header.id} className="font-semibold">
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
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <LoaderCircleIcon className="animate-spin text-[#003366]" size={32} />
                        <p className="text-sm text-gray-500">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm text-red-500">Gagal memuat data</p>
                        <p className="text-xs text-gray-500">Silakan coba lagi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-gray-50 transition-colors"
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
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users2 className="h-10 w-10 text-gray-300" />
                        <p className="text-sm text-gray-500">
                          {searchQuery
                            ? "Tidak ada hasil yang ditemukan"
                            : "Belum ada data user"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info & Controls */}
          <footer className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan{" "}
              <span className="font-medium text-gray-700">
                {userManage?.items?.length || 0}
              </span>{" "}
              user
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon size={16} className="mr-1" /> Sebelumnya
              </Button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm text-gray-700">
                  Halaman {pagination.pageIndex + 1}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Selanjutnya <ChevronRightIcon size={16} className="ml-1" />
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