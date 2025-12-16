"use client";

import { Button } from '@/features/core/components/ui/button';
import { Input } from '@/features/core/components/ui/input';
import { Label } from '@/features/core/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/features/core/components/ui/popover';
import { CalendarSearchIcon, DeleteIcon, FilterIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface FilterSapicoSectionProps {
  startDate: string;
  endDate: string;
  flagFilter: string;
  coaFilter: string;
  onDateChange: (start: string, end: string) => void;
  onFlagChange: (flag: string) => void;
  onCoaChange: (coa: string) => void;
  onReset: () => void;
}

export function FilterSapicoSection({
  onDateChange,
  onFlagChange,
  onCoaChange,
  startDate,
  endDate,
  flagFilter,
  coaFilter,
  onReset,
}: FilterSapicoSectionProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [localFlag, setLocalFlag] = useState(flagFilter);
  const [localCoa, setLocalCoa] = useState(coaFilter);

  const startRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
    setLocalFlag(flagFilter);
    setLocalCoa(coaFilter);
  }, [startDate, endDate, flagFilter, coaFilter]);

  const handleStartChange = (value: string) => {
    setLocalStart(value);
    onDateChange(value, localEnd);
  };

  const handleEndChange = (value: string) => {
    setLocalEnd(value);
    onDateChange(localStart, value);
  };

  const handleFlagChange = (value: string) => {
    setLocalFlag(value);
    onFlagChange(value);
  };

  const handleCoaChange = (value: string) => {
    setLocalCoa(value);
    onCoaChange(value);
  };

  const handleReset = () => {
    setLocalStart('');
    setLocalEnd('');
    setLocalFlag('');
    setLocalCoa('');
    onReset();
    setTimeout(() => startRef.current?.focus(), 50);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <FilterIcon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4">
        {/* Flag Filter */}
        <div className="space-y-2">
          <Label htmlFor="flag" className="text-sm font-medium">
            Flag
          </Label>
          <Input
            id="flag"
            type="text"
            placeholder="Flag"
            value={localFlag}
            onChange={(e) => handleFlagChange(e.target.value)}
            className="flex-1 h-8"
          />
        </div>

        {/* COA Filter */}
        <div className="space-y-2">
          <Label htmlFor="coa" className="text-sm font-medium">
            COA
          </Label>
          <Input
            id="coa"
            type="text"
            placeholder="COA"
            value={localCoa}
            onChange={(e) => handleCoaChange(e.target.value)}
            className="flex-1 h-8"
          />
        </div>

        {/* Date Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <CalendarSearchIcon className="h-3.5 w-3.5" />
            Tanggal Transaksi
          </Label>
          <div className="flex gap-2">
            <Input
              ref={startRef}
              type="date"
              placeholder="Mulai"
              value={localStart}
              onChange={(e) => handleStartChange(e.target.value)}
              className="flex-1 h-8"
            />
            <Input
              type="date"
              placeholder="Selesai"
              value={localEnd}
              onChange={(e) => handleEndChange(e.target.value)}
              className="flex-1 h-8"
            />
          </div>
        </div>

        {/* Reset button */}
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full h-8 gap-1"
        >
          <DeleteIcon className="h-3.5 w-3.5" />
          Reset
        </Button>
      </PopoverContent>
    </Popover>
  );
}