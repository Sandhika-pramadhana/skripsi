"use client";

import { Button } from '@/features/core/components/ui/button';
import { Input } from '@/features/core/components/ui/input';
import { Label } from '@/features/core/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/features/core/components/ui/popover';
import { CalendarSearchIcon, DeleteIcon, FilterIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface FilterLogSapicoSectionProps {
  startDate: string;
  endDate: string;
  namaFileFilter: string;
  urlFilter: string;

  onDateChange: (start: string, end: string) => void;
  onNamaFileChange: (nama_file: string) => void;
  onUrlChange: (url: string) => void;
  onReset: () => void;
}

export function FilterLogSapicoSection({
  startDate,
  endDate,
  namaFileFilter,
  urlFilter,

  onDateChange,
  onNamaFileChange,
  onUrlChange,
  onReset,
}: FilterLogSapicoSectionProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [localNamaFile, setLocalNamaFile] = useState(namaFileFilter);
  const [localUrl, setLocalUrl] = useState(urlFilter);

  const startRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
    setLocalNamaFile(namaFileFilter);
    setLocalUrl(urlFilter);
  }, [startDate, endDate, namaFileFilter, urlFilter]);

  const handleStartChange = (value: string) => {
    setLocalStart(value);
    onDateChange(value, localEnd);
  };

  const handleEndChange = (value: string) => {
    setLocalEnd(value);
    onDateChange(localStart, value);
  };

  const handleNamaFileChange = (value: string) => {
    setLocalNamaFile(value);
    onNamaFileChange(value);
  };

  const handleUrlChange = (value: string) => {
    setLocalUrl(value);
    onUrlChange(value);
  };

  const handleReset = () => {
    setLocalStart('');
    setLocalEnd('');
    setLocalNamaFile('');
    setLocalUrl('');
    onReset();

    setTimeout(() => startRef.current?.focus(), 50);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <FilterIcon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Filter
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 space-y-4">
        
        {/* Nama File Filter */}
        <div className="space-y-2">
          <Label htmlFor="nama_file" className="text-sm font-medium">
            Nama File
          </Label>
          <Input
            id="nama_file"
            type="text"
            placeholder="Nama File"
            value={localNamaFile}
            onChange={(e) => handleNamaFileChange(e.target.value)}
            className="flex-1 h-8"
          />
        </div>

        {/* URL Filter */}
        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm font-medium">
            URL
          </Label>
          <Input
            id="url"
            type="text"
            placeholder="URL"
            value={localUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="flex-1 h-8"
          />
        </div>

        {/* Date Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <CalendarSearchIcon className="h-3.5 w-3.5" />
            Tanggal
          </Label>

          <div className="flex gap-2">
            <Input
              ref={startRef}
              type="date"
              value={localStart}
              onChange={(e) => handleStartChange(e.target.value)}
              className="flex-1 h-8"
            />
            <Input
              type="date"
              value={localEnd}
              onChange={(e) => handleEndChange(e.target.value)}
              className="flex-1 h-8"
            />
          </div>
        </div>

        {/* Reset Button */}
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
