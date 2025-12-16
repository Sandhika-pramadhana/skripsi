"use client";

import { columns } from "./column";
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
import { getListTransactionMandiri } from "@/actions/prod/mandiri/transaction-mandiri/transaction";
import { FilterTransactionMandiri } from "./filter";
import { transaction_mandiri } from "@/types/def";

type Preference = {
  columnVisibility: VisibilityState | null;
};

const preferenceInit: Preference = {
  columnVisibility: null,
};

export function ListTransactionsMandiri() {
  const [preference, savePreference] = useLocalStorage<Preference>(
    "list-transactions-mandiri-preference",
    preferenceInit
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [term, setTerm] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [userId, setUserId] = useState("");
  const [productName, setProductName] = useState("");
  const [statusName, setStatusName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const initializedFromPreferences = useRef(false);
  const lastSavedVisibility = useRef("");

  const termDebounced = useDebounce(term, 400);
  const transactionIdDebounced = useDebounce(transactionId, 400);
  const userIdDebounced = useDebounce(userId, 400);
  const productNameDebounced = useDebounce(productName, 400);
  const statusNameDebounced = useDebounce(statusName, 400);
  const categoryNameDebounced = useDebounce(categoryName, 400);
  const paymentTypeDebounced = useDebounce(paymentType, 400);
  const minAmountDebounced = useDebounce(minAmount, 400);
  const maxAmountDebounced = useDebounce(maxAmount, 400);

  const handleDateChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleTransactionIdChange = useCallback((id: string) => {
    setTransactionId(id);
  }, []);

  const handleUserIdChange = useCallback((id: string) => {
    setUserId(id);
  }, []);

  const handleProductNameChange = useCallback((name: string) => {
    setProductName(name);
  }, []);

  const handleStatusChange = useCallback((name: string) => {
    setStatusName(name);
  }, []);

  const handleCategoryChange = useCallback((name: string) => {
    setCategoryName(name);
  }, []);

  const handlePaymentTypeChange = useCallback((type: string) => {
    setPaymentType(type);
  }, []);

  const handleMinAmountChange = useCallback((min: string) => {
    setMinAmount(min);
  }, []);
  
  const handleMaxAmountChange = useCallback((max: string) => {
    setMaxAmount(max);
  }, []);

  const resetAllFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setTerm("");
    setTransactionId("");
    setUserId("");
    setProductName("");
    setStatusName("");
    setCategoryName("");
    setPaymentType("");
    setMinAmount("");
    setMaxAmount("");
  }, []);

  // Initialize column visibility from preferences
  useEffect(() => {
    if (preference.columnVisibility && !initializedFromPreferences.current) {
      setColumnVisibility(preference.columnVisibility);
      initializedFromPreferences.current = true;
      lastSavedVisibility.current = JSON.stringify(preference.columnVisibility);
    }
  }, [preference.columnVisibility]);

  // Save column visibility changes
  useEffect(() => {
    const currentVisibilityString = JSON.stringify(columnVisibility);
    if (
      initializedFromPreferences.current &&
      currentVisibilityString !== lastSavedVisibility.current &&
      Object.keys(columnVisibility).length > 0
    ) {
      savePreference((prev) => ({
        ...prev,
        columnVisibility: columnVisibility,
      }));
      lastSavedVisibility.current = currentVisibilityString;
    }
  }, [columnVisibility, savePreference]);

  const shouldResetPagination = useMemo(
    () =>
      [
        termDebounced,
        transactionIdDebounced,
        userIdDebounced,
        productNameDebounced,
        statusNameDebounced,
        categoryNameDebounced,
        paymentTypeDebounced,
        minAmountDebounced,
        maxAmountDebounced,
        startDate,
        endDate,
      ].join("|"),
    [
      termDebounced,
      transactionIdDebounced,
      userIdDebounced,
      productNameDebounced,
      statusNameDebounced,
      categoryNameDebounced,
      paymentTypeDebounced,
      minAmountDebounced,
      maxAmountDebounced,
      startDate,
      endDate,
    ]
  );

  const prevResetKey = useRef(shouldResetPagination);
  useEffect(() => {
    if (prevResetKey.current !== shouldResetPagination) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      prevResetKey.current = shouldResetPagination;
    }
  }, [shouldResetPagination]);

  const swrKey = useMemo(
    () =>
      `listTransactionsMandiri-${termDebounced}-${transactionIdDebounced}-${userIdDebounced}-${productNameDebounced}-${statusNameDebounced}-${categoryNameDebounced}-${paymentTypeDebounced}-${minAmountDebounced}-${maxAmountDebounced}-${startDate}-${endDate}-${pagination.pageIndex}-${pagination.pageSize}`,
    [
      termDebounced,
      transactionIdDebounced,
      userIdDebounced,
      productNameDebounced,
      statusNameDebounced,
      categoryNameDebounced,
      paymentTypeDebounced,
      minAmountDebounced,
      maxAmountDebounced,
      startDate,
      endDate,
      pagination.pageIndex,
      pagination.pageSize,
    ]
  );

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useSWR(
    swrKey,
    async () => {
      // Combine all search terms into one term parameter
      const searchTerms = [
        termDebounced,
        transactionIdDebounced,
        userIdDebounced,
        productNameDebounced,
        statusNameDebounced,
        categoryNameDebounced,
        paymentTypeDebounced,
      ].filter(Boolean);

      // Add date filters to search terms if present
      if (startDate) searchTerms.push(`startDate:${startDate}`);
      if (endDate) searchTerms.push(`endDate:${endDate}`);
      if (minAmountDebounced) searchTerms.push(`minAmount:${minAmountDebounced}`);
      if (maxAmountDebounced) searchTerms.push(`maxAmount:${maxAmountDebounced}`);

      const combinedTerm = searchTerms.join(" ");

      const res = await unwrap(
        getListTransactionMandiri({
          page: pagination.pageIndex + 1,
          page_size: pagination.pageSize,
          term: combinedTerm || undefined,
        })
      );
      return res;
    },
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching transactions:", error);
      },
    }
  );

  const allData: transaction_mandiri[] = apiResponse?.items ?? [];
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
    setPagination((prev) => ({
      ...prev,
      pageIndex: pageNumber - 1,
    }));
  }, []);

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Daftar Transaksi Mandiri</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-96 shrink-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Cari transaksi..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="flex h-10 rounded-md border border-input px-3 py-2 text-sm pl-8 w-full"
            />
          </div>

          <Select value={String(pagination.pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((limit) => (
                <SelectItem key={limit} value={String(limit)}>
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
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(value)}
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <FilterTransactionMandiri
            transactionId={transactionId}
            userId={userId}
            productName={productName}
            statusName={statusName}
            categoryName={categoryName}
            paymentType={paymentType} 
            startDate={startDate}
            endDate={endDate}
            minAmount={minAmount}
            maxAmount={maxAmount}
            onTransactionIdChange={handleTransactionIdChange}
            onUserIdChange={handleUserIdChange}
            onProductNameChange={handleProductNameChange}
            onStatusNameChange={handleStatusChange}  
            onCategoryNameChange={handleCategoryChange}  
            onPaymentTypeChange={handlePaymentTypeChange}
            onDateChange={handleDateChange}
            onMinAmountChange={handleMinAmountChange}  
            onMaxAmountChange={handleMaxAmountChange}  
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
          <TableHeader className="sticky top-0 z-1 bg-white shadow-sm">
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
                  <span className="ml-2">Loading...</span>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
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

      {/* Footer: Total & Numbered Pagination */}
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

export default ListTransactionsMandiri;
