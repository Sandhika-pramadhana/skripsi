"use client";
import { useState, useCallback, useMemo } from "react";
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
import { format } from "date-fns";
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
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [error, setError] = useState<string | null>(null);

  // Sync states
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedTables, setSelectedTables] = useState<string[]>([]); // default: belum pilih apa-apa
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState<{
    periode: string;
    tables: string[];
  } | null>(null);

  const tableOptions = [
    { id: "history", label: "History Trx Agent" },
    { id: "log", label: "Log Trx Agent" },
    { id: "partner", label: "Partner Trx" },
  ];

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

  const calculateWeekSummary = useCallback(
    (days: ApiDayData[]): {
      dpp: string;
      gross_revenue: string;
      ppn: string;
    } => {
      const totalGross = days.reduce((sum, day) => {
        return sum + Number(day.gross_revenue?.replace(/[^\d]/g, "") || 0);
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

  const currentData = useMemo(() => {
    if (selectedWeek !== null && weeklyData[selectedWeek]?.days) {
      return mapToLogSapico(weeklyData[selectedWeek].days!);
    }
    return [];
  }, [selectedWeek, weeklyData, mapToLogSapico]);

  const currentWeekSummary = useMemo(() => {
    if (selectedWeek !== null && weeklyData[selectedWeek]?.days) {
      return calculateWeekSummary(weeklyData[selectedWeek].days!);
    }
    return null;
  }, [selectedWeek, weeklyData, calculateWeekSummary]);

  const table = useReactTable({
    data: currentData,
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
    setSelectedWeek(null);

    try {
      const response = (await unwrap(
        generateSap({
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        })
      )) as ApiResponse;

      if (response && response.weeks && response.weeks.length > 0) {
        setWeeklyData(response.weeks);
        const firstWeekIndex = response.weeks.findIndex(
          (w) => w.week && w.days
        );
        setSelectedWeek(firstWeekIndex >= 0 ? firstWeekIndex : null);
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
    if (!year || !month || selectedTables.length === 0) {
      setError("Year, month, dan minimal 1 tabel wajib dipilih");
      return;
    }

    setIsSyncing(true);
    setError(null);
    setCurrentTableIndex(0);
    setLastSyncResult(null);

    try {
      let periode = `${year}_${month.toString().padStart(2, "0")}`;

      for (let i = 0; i < selectedTables.length; i++) {
        const tableName = selectedTables[i];
        setCurrentTableIndex(i + 1);

        const result = (await unwrap(
          syncRevenue({ year, month, tables: [tableName] } as any)
        )) as SyncRevenueResult;

        if (result.periode) {
          periode = result.periode;
        }

        console.log(`${tableName} sync result:`, result);
      }

      setLastSyncResult({
        periode,
        tables: [...selectedTables],
      });
    } catch (err: any) {
      setError(
        `❌ Gagal sync ${
          selectedTables[currentTableIndex - 1] || "tabel"
        }: ${err.message}`
      );
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
      setCurrentTableIndex(0);
    }
  };

  const weekButtons = useMemo(() => {
    return weeklyData
      .map((week, index) => {
        if (week.summary_month || !week.week) return null;
        return (
          <Button
            key={index}
            variant={selectedWeek === index ? "default" : "outline"}
            onClick={() => setSelectedWeek(index)}
            size="sm"
          >
            {week.week}
          </Button>
        );
      })
      .filter(Boolean) as JSX.Element[];
  }, [weeklyData, selectedWeek]);

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Generate Revenue Report</h1>
      </div>

      {/* Notifikasi sukses sync */}
      {lastSyncResult && !error && (
        <div className="mb-4 flex justify-between items-center px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-emerald-800">
              Sync {lastSyncResult.periode} selesai
            </span>
            <span className="text-xs text-emerald-700">
              Tabel: {lastSyncResult.tables.join(", ")}. Semua berhasil
              disinkronkan.
            </span>
          </div>
          <button
            onClick={() => setLastSyncResult(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Date Selection + Sync */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-end">
        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
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
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
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

        {/* Generate Button */}
        <div className="flex items-end">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isSyncing || !startDate || !endDate}
            className="gap-2"
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

        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Sinkronisasi Sapfico</label>
          <div className="flex flex-row gap-2 items-center">
            {/* Year */}
            <input
              type="number"
              className="border rounded px-2 py-1 w-24 h-9 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={isSyncing || isGenerating}
              placeholder="2025"
            />

            {/* Month */}
            <select
              className="border rounded px-2 py-1 w-20 h-9 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              disabled={isSyncing || isGenerating}
            >
              <option value={1}>01</option>
              <option value={2}>02</option>
              <option value={3}>03</option>
              <option value={4}>04</option>
              <option value={5}>05</option>
              <option value={6}>06</option>
              <option value={7}>07</option>
              <option value={8}>08</option>
              <option value={9}>09</option>
              <option value={10}>10</option>
              <option value={11}>11</option>
              <option value={12}>12</option>
            </select>

            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 text-sm flex items-center justify-between min-w-[220px]"
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
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 text-sm"
                    >
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

            
            <Button
              onClick={handleSync}
              disabled={isSyncing || selectedTables.length === 0}
              className="gap-2 h-9 text-sm"
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
                  Sync {selectedTables.length} Tabel
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

      {/* Week Selector */}
      {!isGenerating && weekButtons.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">{weekButtons}</div>
      )}

      {/* Week Summary */}
      {!isGenerating && currentWeekSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border rounded-xl bg-green-50">
            <p className="text-sm text-green-700 font-medium">DPP</p>
            <p className="text-3xl font-bold text-green-900 mt-1">
              Rp {currentWeekSummary.dpp}
            </p>
          </div>
          <div className="p-6 border rounded-xl bg-blue-50">
            <p className="text-sm text-blue-700 font-medium">Gross Revenue</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">
              Rp {currentWeekSummary.gross_revenue}
            </p>
          </div>
          <div className="p-6 border rounded-xl bg-yellow-50">
            <p className="text-sm text-yellow-700 font-medium">PPN</p>
            <p className="text-3xl font-bold text-yellow-900 mt-1">
              Rp {currentWeekSummary.ppn}
            </p>
          </div>
        </div>
      )}

      {/* Data Table */}
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
                      : "Select a week to view details."}
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
