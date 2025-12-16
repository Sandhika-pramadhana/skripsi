"use client";

import { Button } from '@/features/core/components/ui/button';
import { Input } from '@/features/core/components/ui/input';
import { Label } from '@/features/core/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/features/core/components/ui/popover';
import { CalendarSearchIcon, DeleteIcon, FilterIcon, CpuIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface FilterCallbacksRegistrationsSectionProps {
  startDate: string; 
  endDate: string;
  username: string; 
  statusId: string; 
  onDateChange: (start: string, end: string) => void;
  onUsernameChange: (username: string) => void;
  onStatusIdChange: (statusId: string) => void;
  onReset: () => void;
}

export function FilterCallbacksRegistrationsSection({
  onDateChange,
  onUsernameChange,
  onStatusIdChange,
  startDate,
  endDate,
  username,
  statusId,
  onReset,
}: FilterCallbacksRegistrationsSectionProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [localUsername, setLocalUsername] = useState(username);
  const [localStatusId, setLocalStatusId] = useState(statusId);

  const startRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
    setLocalUsername(username);
    setLocalStatusId(statusId);
  }, [startDate, endDate, username, statusId]);

  const handleStartChange = (value: string) => {
    setLocalStart(value);
    onDateChange(value, localEnd);
  };

  const handleEndChange = (value: string) => {
    setLocalEnd(value);
    onDateChange(localStart, value);
  };

  const handleUsernameChange = (value: string) => {
    setLocalUsername(value);
    onUsernameChange(value);
  };

  const handleStatusIdChange = (value: string) => {
    setLocalStatusId(value);
    onStatusIdChange(value);
  };

  const handleReset = () => {
    setLocalStart('');
    setLocalEnd('');
    setLocalUsername('');
    setLocalStatusId('');
    onReset();
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
            {/* Username Filter */}
            <div className="flex gap-1 items-center">
              <CpuIcon size={18} />
              <h4 className="font-medium leading-none">
                <b>Username</b>
              </h4>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="username" className="w-20 text-right">
                Username
              </Label>
              <Input
                type="text"
                id="username"
                placeholder="Cari username..."
                value={localUsername}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="flex-1 h-8"
              />
            </div>

            {/* Status ID Filter */}
            <div className="flex gap-1 items-center">
              <CpuIcon size={18} />
              <h4 className="font-medium leading-none">
                <b>Status</b>
              </h4>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="status-id" className="w-20 text-right">
                Status
              </Label>
              <Input
                type="text"
                id="status-id"
                placeholder="Cari status..."
                value={localStatusId}
                onChange={(e) => handleStatusIdChange(e.target.value)}
                className="flex-1 h-8"
              />
            </div>

            {/* Date Filter */}
            <div className="flex gap-1 items-center">
              <CalendarSearchIcon size={18} />
              <h4 className="font-medium leading-none">
                <b>Tanggal</b>
              </h4>
            </div>
            <div className="grid gap-2">
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
