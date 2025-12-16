"use client";
import { useState, useMemo, useEffect } from "react";
import { createInsertZYColumns } from "./columns-insert-generic"; 
import { createXmlColumns } from "./columns-xml-generic";
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
import { Input } from "@/features/core/components/ui/input";
import { LoaderCircleIcon, FileCode, CalendarIcon, Database, Plus, Minus } from "lucide-react";
import { unwrap } from "@/actions/use-action";
import { Calendar } from "@/features/core/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/features/core/components/ui/popover";
import { format } from "date-fns";
import { 
  InsertZYResponse, 
  GenerateXmlZYResponse,
  InsertZYResult,
  GenerateXmlZYResult
} from "@/types/def";

type ProcessStep = 'idle' | 'inserting' | 'generating' | 'completed';

interface ZYRevenueProcessProps {
  insertAction: (params: { start_date: string; dates: string[]; amounts: number[] }) => Promise<any>;
  generateXmlAction: (params: { start_date: string; end_date: string }) => Promise<any>;
}

export function ZyProcess({ 
  insertAction, 
  generateXmlAction 
}: ZYRevenueProcessProps) {
  const [step, setStep] = useState<ProcessStep>('idle');
  const [insertData, setInsertData] = useState<InsertZYResult[]>([]);
  const [xmlData, setXmlData] = useState<GenerateXmlZYResult[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [dailyAmounts, setDailyAmounts] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'insert' | 'xml'>('insert');
  const [showDailyInputs, setShowDailyInputs] = useState(false);

  const insertColumns = useMemo(() => createInsertZYColumns(), []);
  const xmlColumns = useMemo(() => createXmlColumns(), []);

  // Generate dates berdasarkan start_date & end_date (max 7 hari)
  const dateRange = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end && dates.length < 7) {
      dates.push(format(current, 'yyyy-MM-dd'));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

  // Inisialisasi dailyAmounts berdasarkan dateRange
  useEffect(() => {
    if (dateRange.length > 0) {
      setDailyAmounts(Array(dateRange.length).fill(0));
      setShowDailyInputs(true); // Auto show daily inputs
    } else {
      setDailyAmounts([]);
      setShowDailyInputs(false);
    }
  }, [dateRange.length]);

  // Statistics untuk ZY - Manual COGS Harian
  const insertStats = useMemo(() => {
    if (insertData.length === 0) return null;

    const totalAmount = insertData.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);

    return {
      totalAmount,
    };
  }, [insertData]);

  const xmlStats = useMemo(() => {
    if (xmlData.length === 0) return null;

    const success = xmlData.filter(x => x.status === 'success').length;
    const xmlCreated = xmlData.filter(x => x.status === 'xml_created').length;
    const skipped = xmlData.filter(x => x.status === 'skipped').length;
    const totalAmount = xmlData.reduce((sum, item) => sum + (item.total_amount || 0), 0);

    return { success, xmlCreated, skipped, totalAmount };
  }, [xmlData]);

  const insertTable = useReactTable({
    data: insertData,
    columns: insertColumns,
    getCoreRowModel: getCoreRowModel()
  });

  const xmlTable = useReactTable({
    data: xmlData,
    columns: xmlColumns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleDailyAmountChange = (index: number, value: string) => {
    const numValue = Number(value);
    const newAmounts = [...dailyAmounts];
    newAmounts[index] = isNaN(numValue) || numValue <= 0 ? 0 : numValue;
    setDailyAmounts(newAmounts);
  };

  const handleInsert = async () => {
    if (!startDate || dateRange.length === 0) {
      setError("Please select start date");
      return;
    }
    if (dateRange.length > 7) {
      setError("Maximum 7 days allowed");
      return;
    }
    if (dailyAmounts.some(amount => amount <= 0)) {
      setError("All daily amounts must be greater than 0");
      return;
    }

    setStep('inserting');
    setError(null);
    setInsertData([]);

    try {
      const response = await unwrap(
        insertAction({
          start_date: format(startDate, 'yyyy-MM-dd'),
          dates: dateRange,
          amounts: dailyAmounts
        })
      ) as InsertZYResponse;

      if (response?.results?.length) {
        setInsertData(response.results as InsertZYResult[]);
        setActiveTab('insert');
      } else {
        setError("No data returned from insert operation");
      }
    } catch (err: any) {
      setError(err.message || "Failed to insert ZY data");
      console.error("Error inserting ZY:", err);
    } finally {
      setStep('idle');
    }
  };

  const handleGenerateXML = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    if (startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }

    setStep('generating');
    setError(null);
    setXmlData([]);

    try {
      const response = await unwrap(
        generateXmlAction({
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        })
      ) as GenerateXmlZYResponse;

      if (response?.results?.length) {
        setXmlData(response.results as GenerateXmlZYResult[]);
        setActiveTab('xml');
      } else {
        setError("No data returned from XML generation");
      }
    } catch(err: any) {
      setError(err.message || "Failed to generate XML ZY");
      console.error("Error generating XML:", err);
    } finally {
      setStep('idle');
    }
  };

  const isProcessing = step === 'inserting' || step === 'generating';
  const hasValidDailyAmounts = dailyAmounts.length > 0 && dailyAmounts.every(amount => amount > 0);

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black-700">ZY COGS BPP DP PA-Imbl PrshnN</h1>
        </div>
      </div>

      {/* Date Selection & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 items-end">
        {/* Start Date */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium block mb-2">Start Date *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-12"
                disabled={isProcessing}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "do MMMM yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {/* ✅ FIXED: MiniCalendar props */}
              <Calendar value={startDate} onChange={setStartDate} />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium block mb-2">End Date *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-12"
                disabled={isProcessing}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "do MMMM yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {/* ✅ FIXED: MiniCalendar props */}
              <Calendar value={endDate} onChange={setEndDate} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date Range Info */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium block mb-2">
            Range: {dateRange.length} days {dateRange.length > 7 && "(Max 7)"}
          </label>
          <div className="text-sm text-gray-500">
            {dateRange.length > 0 && `${dateRange[0]} → ${dateRange[dateRange.length-1]}`}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-6 flex gap-2">
          <Button
            onClick={handleInsert}
            disabled={isProcessing || dateRange.length === 0 || !hasValidDailyAmounts}
            className="gap-2 h-12 flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          >
            {step === 'inserting' ? (
              <>
                <LoaderCircleIcon className="animate-spin h-4 w-4" />
                Inserting...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Insert ZY
              </>
            )}
          </Button>

          <Button
            onClick={handleGenerateXML}
            disabled={isProcessing || !startDate || !endDate || startDate! > endDate!}
            className="gap-2 h-12 flex-1"
            variant="default"
          >
            {step === 'generating' ? (
              <>
                <LoaderCircleIcon className="animate-spin h-4 w-4" />
                Generating...
              </>
            ) : (
              <>
                <FileCode className="h-4 w-4" />
                Generate XML
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Daily Amounts Input (Max 7) - AUTO SHOW */}
      {showDailyInputs && dateRange.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
          {dateRange.map((date, index) => (
            <div key={date} className="space-y-1">
              <label className="text-xs font-medium text-gray-700 block">
                {format(new Date(date), 'MMM dd')}
              </label>
              <Input
                type="number"
                placeholder={`Day ${index + 1}`}
                value={dailyAmounts[index] || ''}
                onChange={(e) => handleDailyAmountChange(index, e.target.value)}
                className="h-10 text-sm"
                min={1}
                disabled={isProcessing}
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoaderCircleIcon className="animate-spin h-12 w-12 text-orange-500" />
          <p className="text-lg font-medium">
            {step === 'inserting' && `Inserting ZY COGS data for ${dateRange.length} days...`}
            {step === 'generating' && 'Generating XML files and posting to SAP...'}
          </p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      )}

      {/* Tabs */}
      {!isProcessing && (insertData.length > 0 || xmlData.length > 0) && (
        <div className="flex gap-2 mb-4 border-b">
          <Button
            variant={activeTab === 'insert' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('insert')}
            className="rounded-b-none"
          >
            Insert Results ({insertData.length})
          </Button>
          <Button
            variant={activeTab === 'xml' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('xml')}
            className="rounded-b-none"
          >
            XML Results ({xmlData.length})
          </Button>
        </div>
      )}

      {/* Insert Stats - Hanya Total COGS */}
      {!isProcessing && activeTab === 'insert' && insertStats && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
          <div className="p-6 border-2 border-orange-200 rounded-xl bg-orange-50">
            <p className="text-sm text-gray-600">Total COGS</p>
            <p className="text-2xl font-bold font-mono text-orange-700">
              Rp {insertStats.totalAmount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* XML Stats */}
      {!isProcessing && activeTab === 'xml' && xmlStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border rounded-lg bg-green-50">
            <p className="text-sm text-gray-600">Posted to SAP</p>
            <p className="text-2xl font-bold text-green-600">{xmlStats.success}</p>
          </div>
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-sm text-gray-600">XML Created</p>
            <p className="text-2xl font-bold text-blue-600">{xmlStats.xmlCreated}</p>
          </div>
          <div className="p-4 border rounded-lg bg-yellow-50">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold text-yellow-600">{xmlStats.skipped}</p>
          </div>
          <div className="p-4 border rounded-lg bg-purple-50">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-xl font-bold font-mono">
              Rp {xmlStats.totalAmount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* Tables */}
      {!isProcessing && activeTab === 'insert' && (
        <div className="rounded-md border mb-4">
          <Table>
            <TableHeader>
              {insertTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-white">
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
              {insertTable.getRowModel().rows.length ? (
                insertTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="bg-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={insertColumns.length} className="h-24 text-center bg-white">
                    No data. Click Insert ZY to process COGS data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!isProcessing && activeTab === 'xml' && (
        <div className="rounded-md border mb-4">
          <Table>
            <TableHeader>
              {xmlTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-white">
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
              {xmlTable.getRowModel().rows.length ? (
                xmlTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="bg-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={xmlColumns.length} className="h-24 text-center bg-white">
                    No data. Click Generate XML to create XML files.
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
