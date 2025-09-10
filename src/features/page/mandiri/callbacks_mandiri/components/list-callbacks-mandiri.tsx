"use client";

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
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/features/core/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/core/components/ui/select";

import useSWR from "swr";
import { unwrap } from "@/actions/use-action";
import { getListCallbacksMandiri } from "@/actions/callbacks-mandiri/callbacks";
import { FilterCallbacksMandiriSection } from "./filter";

type Preference = {
  columnVisibility: VisibilityState | null;
};
const preferenceInit = {
  columnVisibility: null,
};

export function ListCallbacksMandiri() {
  const [preference, savePreference] = useLocalStorage<Preference>(
    "list-callbacks-mandiri-preference",
    preferenceInit
  );
  
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [term, setTerm] = useState("");
  const [typeName, setTypeName] = useState("");
  
  // Use refs to track if we've initialized from preferences
  const initializedFromPreferences = useRef(false);
  const lastSavedVisibility = useRef<string>("");
  
  const termDebounced = useDebounce(term, 400);
  const typeNameDebounced = useDebounce(typeName, 400);

  const handleDateChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleTypeNameChange = useCallback((name: string) => {
    setTypeName(name);
  }, []);

  const resetAllFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setTerm("");
    setTypeName("");
  }, []);

  // Initialize column visibility from preferences only once
  useEffect(() => {
    if (
      preference.columnVisibility && 
      !initializedFromPreferences.current
    ) {
      setColumnVisibility(preference.columnVisibility);
      initializedFromPreferences.current = true;
      lastSavedVisibility.current = JSON.stringify(preference.columnVisibility);
    }
  }, [preference.columnVisibility]);

  // Save column visibility changes (with debouncing via ref comparison)
  useEffect(() => {
    const currentVisibilityString = JSON.stringify(columnVisibility);
    
    if (
      initializedFromPreferences.current &&
      currentVisibilityString !== lastSavedVisibility.current &&
      Object.keys(columnVisibility).length > 0 // Only save if we have actual visibility data
    ) {
      savePreference((prev) => ({ ...prev, columnVisibility }));
      lastSavedVisibility.current = currentVisibilityString;
    }
  }, [columnVisibility, savePreference]);

  // Reset pagination when filters change (memoized to prevent unnecessary re-renders)
  const shouldResetPagination = useMemo(
    () => [termDebounced, typeNameDebounced, startDate, endDate].join("|"),
    [termDebounced, typeNameDebounced, startDate, endDate]
  );

  const prevResetKey = useRef(shouldResetPagination);
  useEffect(() => {
    if (prevResetKey.current !== shouldResetPagination) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      prevResetKey.current = shouldResetPagination;
    }
  }, [shouldResetPagination]);

  // SWR key (memoized)
  const swrKey = useMemo(() => 
    `listCallbacksMandiri-${termDebounced}-${typeNameDebounced}-${startDate}-${endDate}-${pagination.pageIndex}-${pagination.pageSize}`,
    [termDebounced, typeNameDebounced, startDate, endDate, pagination.pageIndex, pagination.pageSize]
  );

  const { data: apiResponse, isLoading, error } = useSWR(
    swrKey,
    async () => {
      const combinedTerm = [termDebounced, typeNameDebounced]
        .filter(Boolean)
        .join(" ");

      const res = await unwrap(
        getListCallbacksMandiri({
          page: pagination.pageIndex + 1, // 0-based → 1-based
          page_size: pagination.pageSize,
          term: combinedTerm,
          startDate,
          endDate,
        })
      );
      return res;
    },
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching callbacks:", error);
      },
    }
  );

  const allData = apiResponse?.items ?? [];
  const totalItems = apiResponse?.pagination?.total_data ?? 0;
  const totalPages = apiResponse?.pagination?.total_page ?? 1;

  const table = useReactTable({
    data: allData,
    columns,
    rowCount: totalItems,
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

  // Memoized pagination logic
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

  // Memoized handlers to prevent unnecessary re-renders
  const handlePageSizeChange = useCallback((value: string) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: Number(value),
      pageIndex: 0,
    }));
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.max(0, prev.pageIndex - 1),
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
    }));
  }, [totalPages]);

  const handlePageClick = useCallback((pageNumber: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: pageNumber - 1 }));
  }, []);

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Daftar Callbacks Mandiri</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-96 shrink-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Cari callbacks..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="flex h-10 rounded-md border border-input px-3 py-2 text-sm pl-8 w-full"
            />
          </div>

          {/* Dropdown page size */}
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[100px]">
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
                <Rows3 /> Tampilkan Kolom{" "}
                <ChevronDownIcon size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {table.getAllLeafColumns().map(
                (column) =>
                  column.getCanHide() && (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={() => column.toggleVisibility()}
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <FilterCallbacksMandiriSection
            startDate={startDate}
            endDate={endDate}
            typeName={typeName}
            onDateChange={handleDateChange}
            onTypeNameChange={handleTypeNameChange}
            onReset={resetAllFilters}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error loading data: {error.message}
        </div>
      )}

      <div className="rounded-md border mb-4">
        <Table className="max-h-[calc(100dvh-18rem)] custom-scrollbar">
          <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                  <LoaderCircleIcon className="animate-spin mx-auto" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
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

      {/* Footer: Total & Pagination */}
      <footer>
        <div className="flex flex-col items-center gap-2 mb-4">
          <p className="text-sm text-gray-600">
            Total data: {totalItems} | Menampilkan{" "}
            {totalItems > 0
              ? `${pagination.pageIndex * pagination.pageSize + 1} - ${Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  totalItems
                )}`
              : "0"}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={handlePreviousPage}
              >
                &lt; Back
              </Button>

              {pages.map((p, idx) =>
                typeof p === "number" ? (
                  <Button
                    key={idx}
                    size="sm"
                    variant={p === currentPage ? "default" : "outline"}
                    className={p === currentPage ? "bg-black text-white" : ""}
                    onClick={() => handlePageClick(p)}
                  >
                    {p}
                  </Button>
                ) : (
                  <span key={idx} className="px-2 select-none">
                    {p}
                  </span>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
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

export default ListCallbacksMandiri;