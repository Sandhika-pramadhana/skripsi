import { Button } from '@/features/core/components/ui/button';
import { Input } from '@/features/core/components/ui/input';
import { Label } from '@/features/core/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/features/core/components/ui/popover';
import { CalendarSearchIcon, DeleteIcon, FilterIcon, CpuIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface FilterLogApisSectionProps {
  startDate: string;
  endDate: string;
  processName: string;
  onDateChange: (start: string, end: string) => void;
  onProcessNameChange: (processName: string) => void;
  onReset: () => void;
}

export function FilterLogApisSection({
  onDateChange,
  onProcessNameChange,
  startDate,
  endDate,
  processName,
  onReset,
}: FilterLogApisSectionProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [localProcessName, setLocalProcessName] = useState(processName);

  const startRef = useRef<HTMLInputElement | null>(null);

  // Sync props -> state
  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
    setLocalProcessName(processName);
  }, [startDate, endDate, processName]);

  const handleStartChange = (value: string) => {
    setLocalStart(value);
    onDateChange(value, localEnd);
  };

  const handleEndChange = (value: string) => {
    setLocalEnd(value);
    onDateChange(localStart, value);
  };

  const handleProcessNameChange = (value: string) => {
    setLocalProcessName(value);
    onProcessNameChange(value);
  };

  const handleReset = () => {
    setLocalStart('');
    setLocalEnd('');
    setLocalProcessName('');
    onReset();
    // fokuskan kembali ke input Mulai setelah reset
    setTimeout(() => startRef.current?.focus(), 50);
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" /> Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            {/* Process Name Filter */}
            <div className="flex gap-1 items-center">
              <CpuIcon size={18} />
              <h4 className="font-medium leading-none">
                <b>Nama Proses</b>
              </h4>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="process-name" className="w-20 text-right">
                Proses
              </Label>
              <Input
                type="text"
                id="process-name"
                placeholder="Cari nama proses..."
                value={localProcessName}
                onChange={(e) => handleProcessNameChange(e.target.value)}
                className="flex-1 h-8"
              />
            </div>

            {/* Date Filter Title */}
            <div className="flex gap-1 items-center">
              <CalendarSearchIcon size={18} />
              <h4 className="font-medium leading-none">
                <b>Tanggal</b>
              </h4>
            </div>

            {/* Date inputs */}
            <div className="grid gap-2">
              {/* Mulai */}
              <div className="flex items-center gap-4">
                <Label htmlFor="start-date" className="w-20 text-right">
                  Mulai
                </Label>
                <Input
                  type="date"
                  id="start-date"
                  ref={startRef}
                  autoFocus
                  value={localStart}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="flex-1 h-8"
                />
              </div>

              {/* Selesai */}
              <div className="flex items-center gap-4">
                <Label htmlFor="end-date" className="w-20 text-right">
                  Selesai
                </Label>
                <Input
                  type="date"
                  id="end-date"
                  value={localEnd}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="flex-1 h-8"
                />
              </div>
            </div>

            {/* Reset button */}
            <div className="flex items-center justify-end">
              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-red-500 text-white hover:bg-red-400 hover:text-white"
              >
                Reset <DeleteIcon className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
