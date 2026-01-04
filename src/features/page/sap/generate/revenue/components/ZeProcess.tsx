"use client";
import { useState, useMemo } from "react";
import { createInsertZEColumns } from "./columns-insert-generic";
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
import { 
  LoaderCircleIcon, 
  FileSpreadsheet, 
  CalendarIcon, 
  Database, 
  FileCode,
  Server,
  Cloud 
} from "lucide-react";
import { unwrap } from "@/actions/use-action";
import { Calendar } from "@/features/core/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/features/core/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/core/components/ui/select";
import { format } from "date-fns";
import { 
  InsertZEResponse, 
  GenerateXmlZEResponse,
  InsertZEResult,
  GenerateXmlZEResult 
} from "@/types/def";

type ProcessStep = 'idle' | 'inserting' | 'generating' | 'completed';

interface ZERevenueProcessProps {
  insertAction: (params: { start_date: string; end_date: string }) => Promise<any>;
  generateXmlAction: (params: { 
    start_date: string; 
    end_date: string; 
    environment?: 'sandbox' | 'production' 
  }) => Promise<any>;
}

export function ZERevenueProcess({ 
  insertAction, 
  generateXmlAction 
}: ZERevenueProcessProps) {
  const [step, setStep] = useState<ProcessStep>('idle');
  const [insertData, setInsertData] = useState<InsertZEResult[]>([]);
  const [xmlData, setXmlData] = useState<GenerateXmlZEResult[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'insert' | 'xml'>('insert');

  const insertColumns = useMemo(() => createInsertZEColumns(), []);
  const xmlColumns = useMemo(() => createXmlColumns(), []);

  // Statistik untuk ZE dengan perubahan nama dan nilai
  const insertStats = useMemo(() => {
    if (insertData.length === 0) return null;
    
    const totalDppIndirect = insertData.reduce((sum, item) => {
      const value = Number(item.dpp || 0);
      return sum + value;
    }, 0);
    
    // Ambil nilai total_indirect sebagai Gross Revenue
    const grossRevenue = insertData.reduce((sum, item) => {
      const value = Number(item.total_indirect || 0);
      return sum + value;
    }, 0);
    
    return {
      totalDppIndirect,
      grossRevenue, // menggantikan totalPpnIndirect
      totalDpp: totalDppIndirect,
      totalPpn: grossRevenue
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

  // Tables
  const insertTable = useReactTable({
    data: insertData,
    columns: insertColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const xmlTable = useReactTable({
    data: xmlData,
    columns: xmlColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleInsert = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }

    setStep('inserting');
    setError(null);
    setInsertData([]);
    
    try {
      const response = await unwrap(
        insertAction({
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        })
      ) as InsertZEResponse;

      if (response && response.results && response.results.length > 0) {
        setInsertData(response.results as InsertZEResult[]);
        setActiveTab('insert');
      } else {
        setError("No data returned from insert operation");
      }
    } catch (err: any) {
      setError(err.message || "Failed to insert ZE data");
      console.error("Error inserting ZE:", err);
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
          environment, // ✅ Pass environment
        })
      ) as GenerateXmlZEResponse;

      if (response && response.results && response.results.length > 0) {
        setXmlData(response.results as GenerateXmlZEResult[]);
        setActiveTab('xml');
      } else {
        setError("No data returned from XML generation");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate XML ZE");
      console.error("Error generating XML:", err);
    } finally {
      setStep('idle');
    }
  };

  const handleProcessBoth = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }

    setError(null);
    setInsertData([]);
    setXmlData([]);
    
    try {
      // Step 1: Insert
      setStep('inserting');
      const insertResponse = await unwrap(
        insertAction({
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        })
      ) as InsertZEResponse;

      if (insertResponse && insertResponse.results) {
        setInsertData(insertResponse.results as InsertZEResult[]);
      }

      // Step 2: Send Data
      setStep('generating');
      const xmlResponse = await unwrap(
        generateXmlAction({
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          environment, // ✅ Pass environment
        })
      ) as GenerateXmlZEResponse;

      if (xmlResponse && xmlResponse.results) {
        setXmlData(xmlResponse.results as GenerateXmlZEResult[]);
        setActiveTab('xml');
      }

      setStep('completed');
    } catch (err: any) {
      setError(err.message || "Failed to process ZE");
      console.error("Error processing ZE:", err);
      setStep('idle');
    }
  };

  const isProcessing = step === 'inserting' || step === 'generating';

  return (
    <main className="p-12 pb-4 border mt-3 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ZE Revenue Agen Pihak Ketiga</h1>
      </div>

      {/* Date Selection & Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
                disabled={isProcessing}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "do MMMM yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {/* ✅ FIXED: MiniCalendar props - SAMBIL ZD */}
              <Calendar value={startDate} onChange={setStartDate} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
                disabled={isProcessing}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "do MMMM yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {/* ✅ FIXED: MiniCalendar props - SAMBIL ZD */}
              <Calendar value={endDate} onChange={setEndDate} />
            </PopoverContent>
          </Popover>
        </div>

        {/* ✅ ENVIRONMENT SELECTOR */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Environment</label>
          <Select value={environment} onValueChange={(value: 'sandbox' | 'production') => setEnvironment(value)} disabled={isProcessing}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Sandbox
                </div>
              </SelectItem>
              <SelectItem value="production">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Production
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            onClick={handleInsert}
            disabled={isProcessing || !startDate || !endDate}
            className="gap-2"
            variant="default"
          >
            {step === 'inserting' ? (
              <>
                <LoaderCircleIcon className="animate-spin h-4 w-4" />
                Inserting...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Insert ZE
              </>
            )}
          </Button>

          <Button
            onClick={handleGenerateXML}
            disabled={isProcessing || !startDate || !endDate}
            className="gap-2"
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
                Send Data
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoaderCircleIcon className="animate-spin h-12 w-12 text-blue-500" />
          <p className="text-lg font-medium">
            {step === 'inserting' && "Inserting ZE data to database..."}
            {step === 'generating' && `Generating XML files and posting to SAP (${environment.toUpperCase()})...`}
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

      {/* Environment Badge */}
      {!isProcessing && xmlData.length > 0 && (
        <div className="mb-4 p-2 bg-gray-50 border rounded-md flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            environment === 'sandbox' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {environment.toUpperCase()} Environment
          </div>
        </div>
      )}

      {/* Insert Stats - ZE dengan Gross Revenue */}
      {!isProcessing && activeTab === 'insert' && insertStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-sm text-gray-600">Total DPP Indirect</p>
            <p className="text-xl font-bold font-mono">
              Rp {(insertStats.totalDppIndirect || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-green-50">
            <p className="text-sm text-gray-600">Total Gross Revenue</p>
            <p className="text-xl font-bold font-mono">
              Rp {(insertStats.grossRevenue || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* XML Stats */}
      {!isProcessing && activeTab === 'xml' && xmlStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border rounded-lg bg-green-50">
            <p className="text-sm text-gray-600">Posted to SAP</p>
            <p className="text-2xl font-bold text-green-600">
              {xmlStats.success}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-sm text-gray-600">XML Created</p>
            <p className="text-2xl font-bold text-blue-600">
              {xmlStats.xmlCreated}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-yellow-50">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold text-yellow-600">
              {xmlStats.skipped}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-purple-50">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-xl font-bold font-mono">
              Rp {xmlStats.totalAmount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* Insert Data Table */}
      {!isProcessing && activeTab === 'insert' && (
        <div className="rounded-md border mb-4">
          <Table>
            <TableHeader>
              {insertTable.getHeaderGroups().map((headerGroup) => (
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
              {insertTable.getRowModel().rows.length ? (
                insertTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={insertColumns.length} className="h-24 text-center">
                    No data. Click Insert ZE to process data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* XML Data Table */}
      {!isProcessing && activeTab === 'xml' && (
        <div className="rounded-md border mb-4">
          <Table>
            <TableHeader>
              {xmlTable.getHeaderGroups().map((headerGroup) => (
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
              {xmlTable.getRowModel().rows.length ? (
                xmlTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={xmlColumns.length} className="h-24 text-center">
                    No data. Click Send Data to create XML files.
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
