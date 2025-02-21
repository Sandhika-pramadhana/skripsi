'use client';

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
  Plus,
  Rows3,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Button } from "@/features/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/features/core/components/ui/dropdown-menu";
import { getAllUser } from "@/actions/master/user/user";
import useSWR from "swr";
import { unwrap } from "@/actions/use-action";
import FormUser from "./form";

type Preference = {
  columnVisibility: VisibilityState | null;
};
const preferenceInit = {
  columnVisibility: null,
};

export function ListUsers() {
  const [preference, savePreference] = useLocalStorage<Preference>("list-transaction-preference",preferenceInit);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [open, setOpen] = useState<boolean>(false);

  const {
    data: userManage,
    isLoading,
  } = useSWR(
    `userManage-${JSON.stringify(pagination)}`,
    async () => {
      try {
        return await unwrap(getAllUser({
          page: pagination.pageIndex + 1,
          size: pagination.pageSize,
        }));
      } catch (error) {
        throw error;
      }
    },
    {
      keepPreviousData: true,
    }
  );

  const table = useReactTable({
    data: userManage?.data.items || [],
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

  useEffect(() => {
    if (preference.columnVisibility) {
      setColumnVisibility(preference.columnVisibility);
    }
  }, [preference.columnVisibility]);

  useEffect(() => {
    savePreference((prev) => ({
      ...prev,
      columnVisibility,
    }));
  }, [columnVisibility, savePreference]);

  useEffect(() => {
    table.setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [table]);

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Daftar Data User</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <Button 
          variant="outline" className="bg-[#003366] text-white hover:bg-[#275d94] hover:text-white"
          onClick={() => setOpen(true)}
        >
          <Plus/>Tambah User
        </Button>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Rows3/> Tampilkan Kolom <ChevronDownIcon size={16} className="ml-1" />
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <LoaderCircleIcon className="animate-spin" />
                      <p>Loading...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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

      <FormUser
        open={open}
        onOpenModal={setOpen}
        isEdit={false}
      />
    </main>
  );
}

export default ListUsers;
