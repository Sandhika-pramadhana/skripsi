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
  LoaderCircleIcon,
  Rows3,
  SearchIcon,
} from "lucide-react";
import { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/features/core/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/core/components/ui/select";
import { getListTransaction } from "@/actions/trx/trx";
import { FilterSection } from "./filter";

type Preference = {
  columnVisibility: VisibilityState | null;
};

const preferenceInit: Preference = {
  columnVisibility: null,
};

export function ListTransaction() {
  const [preference, savePreference] = useLocalStorage<Preference>(
    "list-transaction-preference",
    preferenceInit
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10, // default awal
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState('');
  const [isPreferenceInitialized, setIsPreferenceInitialized] = useState(false);

  const termDebounced = useDebounce(term, 400);

  const handleDateChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const resetAllFilters = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setStatus('');
    setTerm('');
  }, []);

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
    setTerm("");
  }, []);

  // SWR key pakai pagination
  const swrKey = `listTransaction-${termDebounced}-${status}-${startDate}-${endDate}-${pagination.pageIndex}-${pagination.pageSize}`;

  const {
    data: listTransaction,
    isLoading,
  } = useSWR(
    swrKey,
    async () => {
      const queryTerm = status && termDebounced 
        ? `${status} ${termDebounced}` 
        : status 
          ? status 
          : termDebounced;

      const res = await unwrap(getListTransaction({
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
        term: queryTerm,
        startDate: startDate,
        endDate: endDate,
      }));
      return res;
    },
    { keepPreviousData: true }
  );

  const allData = listTransaction?.items ?? [];
  const totalItems = listTransaction?.pagination?.total ?? 0;

  const currentPageData = allData;

  const totalPages = Math.ceil(totalItems / pagination.pageSize);

  const tableConfig = useMemo(() => ({
    data: currentPageData,
    columns,
    rowCount: totalItems,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      pagination,
      columnVisibility,
    },
    manualPagination: true,
  }), [currentPageData, totalItems, pagination, columnVisibility]);

  const table = useReactTable(tableConfig);

  // init columnVisibility dari preference
  useEffect(() => {
    if (preference.columnVisibility && !isPreferenceInitialized) {
      setColumnVisibility(preference.columnVisibility);
      setIsPreferenceInitialized(true);
    } else if (!preference.columnVisibility && !isPreferenceInitialized) {
      setIsPreferenceInitialized(true);
    }
  }, [preference.columnVisibility, isPreferenceInitialized]);

  // simpan preference kolom
  useEffect(() => {
    if (isPreferenceInitialized) {
      const timeoutId = setTimeout(() => {
        savePreference((prev) => ({
          ...prev,
          columnVisibility,
        }));
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [columnVisibility, isPreferenceInitialized]);

  // reset ke halaman pertama tiap filter berubah
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [termDebounced, status, startDate, endDate]);

  // pagination numbers
  const currentPage = pagination.pageIndex + 1;
  const pages = useMemo<(number | string)[]>(() => {
    const list: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
      return list;
    }
    list.push(1);
    if (currentPage > 4) list.push("...");
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) list.push(i);
    if (currentPage < totalPages - 3) list.push("...");
    if (totalPages > 1) list.push(totalPages);
    return list;
  }, [currentPage, totalPages]);

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Daftar Data Transaksi</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-96 shrink-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari data kiriman..."
              onChange={(e) => setTerm(e.target.value)}
              value={term}
              className="pl-8"
            />
          </div>

          {/* Dropdown pilih page size */}
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              const newSize = Number(value);
              setPagination({
                pageIndex: 0,
                pageSize: newSize,
              });
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((limit) => (
                <SelectItem key={limit} value={limit.toString()}>
                  {limit} / Show
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Rows3 /> Tampilkan Kolom <ChevronDownIcon size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {table.getAllLeafColumns().map((column) => {
                if (!column.getCanHide()) return null;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={() => column.toggleVisibility()}
                  >
                    {column.columnDef.header as string}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <FilterSection
            startDate={startDate}
            endDate={endDate}
            status={status}
            onDateChange={handleDateChange}
            onStatusChange={handleStatusChange}
            onReset={resetAllFilters}
          />
        </div>
      </div>

      <div className="rounded-md border mb-4">
        <Table className="max-h-[calc(100dvh-18rem)] custom-scrollbar">
          <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <LoaderCircleIcon className="animate-spin mx-auto" />
                  <p>Loading...</p>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

      {/* Footer */}
      <footer>
        <div className="flex flex-col items-center gap-2 mb-4">
          <p className="text-sm text-gray-600">
            Total data: {totalItems} | Menampilkan {(pagination.pageIndex * pagination.pageSize) + 1} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))
                }
              >
                &lt; Back
              </Button>

              {pages.map((p, idx) =>
                typeof p === "number" ? (
                  <Button
                    key={idx}
                    size="sm"
                    variant={p === currentPage ? "default" : "outline"}
                    onClick={() => setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))}
                  >
                    {p}
                  </Button>
                ) : (
                  <span key={idx} className="px-2 select-none">{p}</span>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1) }))
                }
              >
                Next &gt;
              </Button>
            </div>
          )}
        </div>
      </footer>
    </main>
  );
}

export default ListTransaction;
