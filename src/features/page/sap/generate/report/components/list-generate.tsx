"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { columns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/core/components/ui/table";
import { Button } from "@/features/core/components/ui/button";
import {
  LoaderCircleIcon,
  FileSpreadsheet,
  CalendarIcon,
  Database,
} from "lucide-react";
import { unwrap } from "@/actions/use-action";
import { generateSap, syncRevenue } from "@/actions/sap/generate/generate";
import { Calendar } from "@/features/core/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/features/core/components/ui/popover";
import { format, getDate, differenceInDays } from "date-fns";
import {
  ApiDayData,
  ApiWeekData,
  LogSapico,
  ApiResponse,
  SyncRevenueResult,
} from "@/types/def";

export function Generate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [weeklyData, setWeeklyData] = useState<ApiWeekData[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Sync dates - NOW ALLOW UNDEFINED for "Pick a date"
  const [syncStartDate, setSyncStartDate] = useState<Date | undefined>();
  const [syncEndDate, setSyncEndDate] = useState<Date | undefined>();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<SyncRevenueResult | null>(null);

  // AUTO HIDE NOTIF - 2 DETIK
  useEffect(() => {
    if (syncResult && syncResult.success) {
      const timer = setTimeout(() => {
        setSyncResult(null);
      }, 2000); // 2 detik

      return () => clearTimeout(timer);
    }
  }, [syncResult]);

  const tableOptions = [
    { id: "history", label: "History Trx Agent" },
    { id: "log", label: "Log Trx Agent" },
    { id: "partner", label: "Partner Trx" },
  ];

  // Extract year, month, startDay, endDay from sync dates + MAX 5 DAYS VALIDATION
  const syncParams = useMemo(() => {
    if (!syncStartDate || !syncEndDate) return null;
    
    const year = syncStartDate.getFullYear();
    const month = syncStartDate.getMonth() + 1;
    const startDay = getDate(syncStartDate);
    const endDay = getDate(syncEndDate);
    
    // Must be same month/year
    if (syncStartDate.getFullYear() !== syncEndDate.getFullYear() || 
        syncStartDate.getMonth() !== syncEndDate.getMonth()) {
      return null;
    }
    
    // MAX 5 DAYS LIMIT
    const daysDiff = differenceInDays(syncEndDate, syncStartDate);
    if (daysDiff > 5) {
      return null;
    }
    
    return { year, month, startDate: startDay, endDate: endDay };
  }, [syncStartDate, syncEndDate]);

  const calculateDailyPPN = useCallback((gross: number): string => {
    const ppn = gross * 0.0991;
    return new Intl.NumberFormat("id-ID").format(Math.round(ppn));
  }, []);

  const calculateDailyDPP = useCallback((gross: number): string => {
    const dpp = gross * (1 - 0.0991);
    return new Intl.NumberFormat("id-ID").format(Math.round(dpp));
  }, []);

  const mapToLogSapico = useCallback(
    (days: ApiDayData[]): LogSapico[] => {
      return days.map((day, index) => {
        const grossNum = Number(day.gross_revenue?.replace(/[^\d]/g, "") || 0);
        return {
          ...day,
          id: index + 1,
          nama_file: "",
          response: "",
          tanggal: day.date,
          url: "",
          ppn: calculateDailyPPN(grossNum),
          dpp: calculateDailyDPP(grossNum),
        };
      });
    },
    [calculateDailyPPN, calculateDailyDPP]
  );

  // FIXED: Accept LogSapico[] directly
  const calculateWeekSummary = useCallback(
    (data: LogSapico[]): {
      dpp: string;
      gross_revenue: string;
      ppn: string;
    } => {
      const totalGross = data.reduce((sum, item) => {
        return sum + Number(item.gross_revenue?.replace(/[^\d]/g, "") || 0);
      }, 0);

      const totalPPN = totalGross * 0.0991;
      const totalDPP = totalGross - totalPPN;

      return {
        dpp: new Intl.NumberFormat("id-ID").format(Math.round(totalDPP)),
        gross_revenue: new Intl.NumberFormat("id-ID").format(
          Math.round(totalGross)
        ),
        ppn: new Intl.NumberFormat("id-ID").format(Math.round(totalPPN)),
      };
    },
    []
  );

  // FLAT ARRAY - SEMUA DAYS DARI SEMUA WEEK (NO WEEK GROUPING)
  const allDaysData = useMemo(() => {
    const allDays: ApiDayData[] = [];
    weeklyData.forEach(week => {
      if (week.days) {
        allDays.push(...week.days);
      }
    });
    return mapToLogSapico(allDays);
  }, [weeklyData, mapToLogSapico]);

  // FIXED: Use calculateWeekSummary directly with allDaysData (LogSapico[])
  const totalSummary = useMemo(() => {
    if (allDaysData.length === 0) return null;
    return calculateWeekSummary(allDaysData);
  }, [allDaysData, calculateWeekSummary]);

  const table = useReactTable({
    data: allDaysData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setWeeklyData([]);

    try {
      const response = (await unwrap(
        generateSap({
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        })
      )) as ApiResponse;

      if (response && response.weeks && response.weeks.length > 0) {
        setWeeklyData(response.weeks);
      } else {
        setError("No data returned from the server");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate revenue data");
      console.error("Error generating revenue:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSync = async () => {
    if (
      !syncStartDate || 
      !syncEndDate ||
      !syncParams ||
      syncParams.startDate > syncParams.endDate ||
      selectedTables.length === 0
    ) {
      setError("Pilih tanggal dalam bulan yang sama (maksimal 5 hari) dan minimal 1 tabel");
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const result = (await unwrap(
        syncRevenue({
          year: syncParams.year,
          month: syncParams.month,
          startDate: syncParams.startDate,
          endDate: syncParams.endDate,
          tables: selectedTables,
        })
      )) as SyncRevenueResult;

      if (result.success) {
        setSyncResult(result);
      } else {
        throw new Error(result.message || "Sync failed");
      }
    } catch (err: any) {
      setError(`❌ Gagal sync: ${err.message}`);
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle calendar change for sync
  const handleSyncStartChange = (date: Date | undefined) => {
    setSyncStartDate(date);
  };

  const handleSyncEndChange = (date: Date | undefined) => {
    setSyncEndDate(date);
  };

  // SAFE HELPER FUNCTION - No more undefined errors!
  const getInsertedCount = (tableId: string): number => {
    if (!syncResult) return 0;
    switch(tableId) {
      case 'history': return syncResult.inserted.history_trx_agent || 0;
      case 'log': return syncResult.inserted.log_trx_agent || 0;
      case 'partner': return syncResult.inserted.partner_trx_request || 0;
      default: return 0;
    }
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 pb-6 border mt-3 rounded-lg shadow-sm bg-white max-w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Generate Revenue Report</h1>
      </div>

      {/* Sync Success Notification - AUTO HIDE 2 DETIK */}
      {syncResult && syncResult.success && !error && (
        <div className="mb-4 flex justify-between items-center px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-emerald-800">
              ✅ Sync {syncResult.periode} {syncResult.dateRange} selesai
            </span>
            <div className="text-xs text-emerald-700 mt-1 space-y-0.5">
              {selectedTables.map((tableId) => {
                const tableLabel = tableOptions.find(t => t.id === tableId)?.label || tableId;
                const count = getInsertedCount(tableId);
                return (
                  <div key={tableId}>
                    • {tableLabel}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT BARU - Generate + Sync dalam SATU ROW KOMPAK */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 w-full">
        
        {/* GENERATE SECTION - KOMPAK */}
        <div className="flex flex-col gap-4 lg:gap-3 flex-1">
          <label className="text-sm font-medium">Generate Report</label>
          <div className="flex gap-3 items-end flex-wrap">
            {/* Start Date */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] max-w-xs">
              <label className="text-xs font-medium text-gray-500">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 justify-start text-left font-normal"
                    disabled={isGenerating || isSyncing}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "do MMMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar value={startDate} onChange={setStartDate} />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] max-w-xs">
              <label className="text-xs font-medium text-gray-500">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 justify-start text-left font-normal"
                    disabled={isGenerating || isSyncing}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "do MMMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar value={endDate} onChange={setEndDate} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Generate Button - LEBIH PANJANG */}
            <div className="flex items-end flex-shrink-0">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isSyncing || !startDate || !endDate}
                className="gap-2 h-10 px-6 min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <LoaderCircleIcon className="animate-spin h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* SYNC SECTION - KOMPAK DI SEBELAH KANAN */}
        <div className="flex flex-col gap-4 lg:gap-3 flex-shrink-0 min-w-[420px]">
          <label className="text-sm font-medium">Sinkronisasi (Max 5 hari)</label>
          <div className="flex gap-2.5 items-end flex-wrap">
            {/* Sync Dates */}
            <div className="flex gap-2 items-end flex-1 min-w-0">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
                <label className="text-xs font-medium text-gray-500">Start</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal"
                      disabled={isSyncing || isGenerating}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {syncStartDate ? format(syncStartDate, "do MMMM yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar value={syncStartDate} onChange={handleSyncStartChange} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
                <label className="text-xs font-medium text-gray-500">End</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal"
                      disabled={isSyncing || isGenerating}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {syncEndDate ? format(syncEndDate, "do MMMM yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar value={syncEndDate} onChange={handleSyncEndChange} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Table Select */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 text-sm px-3 min-w-[140px] flex items-center justify-between"
                  disabled={isSyncing || isGenerating}
                >
                  <span className="truncate">
                    {selectedTables.length === tableOptions.length
                      ? "Semua tabel"
                      : selectedTables.length === 0
                      ? "Pilih tabel"
                      : tableOptions
                          .filter((t) => selectedTables.includes(t.id))
                          .map((t) => t.label)
                          .join(", ")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="flex flex-col gap-1">
                  {tableOptions.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={selectedTables.includes(opt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTables([...selectedTables, opt.id]);
                          } else {
                            setSelectedTables(
                              selectedTables.filter((t) => t !== opt.id)
                            );
                          }
                        }}
                        disabled={isSyncing}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Sync Button - LEBIH PANJANG */}
            <Button
              onClick={handleSync}
              disabled={
                isSyncing ||
                !syncStartDate || 
                !syncEndDate ||
                !syncParams ||
                selectedTables.length === 0
              }
              className="gap-2 h-10 px-4 text-sm min-w-[120px]"
              variant="outline"
            >
              {isSyncing ? (
                <>
                  <LoaderCircleIcon className="animate-spin h-4 w-4" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Sync {selectedTables.length}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoaderCircleIcon className="animate-spin h-12 w-12 text-blue-500" />
          <p className="text-lg font-medium">Generating revenue data...</p>
          <p className="text-sm text-gray-500">
            This may take a few moments
          </p>
        </div>
      )}

      {/* TOTAL SUMMARY - SELURUH DATA */}
      {!isGenerating && totalSummary && weeklyData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border rounded-xl bg-green-50">
            <p className="text-sm text-green-700 font-medium">Total DPP</p>
            <p className="text-3xl font-bold text-green-900 mt-1">
              Rp {totalSummary.dpp}
            </p>
          </div>
          <div className="p-6 border rounded-xl bg-blue-50">
            <p className="text-sm text-blue-700 font-medium">Total Gross Revenue</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">
              Rp {totalSummary.gross_revenue}
            </p>
          </div>
          <div className="p-6 border rounded-xl bg-yellow-50">
            <p className="text-sm text-yellow-700 font-medium">Total PPN</p>
            <p className="text-3xl font-bold text-yellow-900 mt-1">
              Rp {totalSummary.ppn}
            </p>
          </div>
        </div>
      )}

      {/* Data Table - FLAT LIST SEMUA DATA (NO WEEK GROUPING) */}
      {!isGenerating && (
        <div className="rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
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
              {table.getRowModel().rows.length ? (
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
                    {weeklyData.length === 0
                      ? "No data. Click Generate to create revenue report."
                      : "No data available for selected period."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}

export default Generate;
