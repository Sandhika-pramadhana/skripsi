'use client';

import { unwrap } from "@/actions/use-action";
import useSWR from "swr";
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
import { Input } from "@/features/core/components/ui/input";
import { Button } from "@/features/core/components/ui/button";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  Rows3,
  SearchIcon,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/features/core/components/ui/dropdown-menu";
import { getListTransaction } from "@/actions/trx/trx";
import { FilterSection } from "./filter";

type Preference = {
  columnVisibility: VisibilityState | null;
};
const preferenceInit = {
  columnVisibility: null,
};

export function ListTransaction() {
  const [preference, savePreference] = useLocalStorage<Preference>("list-transaction-preference",preferenceInit);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState('');
  const termDebounced = useDebounce(term, 400);
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const resetAllFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('');
    setTerm('');
  };

  const {
    data: listTransaction,
    isLoading,
  } = useSWR(
    `listTransaction-${termDebounced}-${status}-${startDate}-${endDate}-${JSON.stringify(pagination)}`,
    async () => {
      try {
        const queryTerm = status && termDebounced ? `${status} ${termDebounced}` : status ? status : termDebounced;
        return await unwrap(getListTransaction({
          page: pagination.pageIndex + 1,
          size: pagination.pageSize,
          term: queryTerm,
          startDate: startDate,
          endDate: endDate,
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
    data: listTransaction?.items || [],
    columns,
    rowCount: listTransaction?.pagination?.total || 0,
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
  }, [termDebounced, status, table]);

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Daftar Data Transaksi</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-96 shrink-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              className="flex h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-gray-100/50 placeholder-gray-300 appearance-none pl-8 dark:bg-gray-800/50 dark:placeholder-gray-300"
              placeholder="Cari data kiriman..."
              onChange={(e) => {
                e.preventDefault();
                setTerm(e.target.value);
              }}
              value={term}
            />
          </div>
        </div>
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

          {/* Filer Tabel */}
          <FilterSection
            startDate={startDate}
            endDate={endDate}
            status={status}
            onDateChange={handleDateChange}
            onStatusChange={(newStatus) => {
              setStatus(newStatus);
              setTerm("");
            }}
            onReset={resetAllFilters}
          />

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
    </main>
  );
}

export default ListTransaction;
