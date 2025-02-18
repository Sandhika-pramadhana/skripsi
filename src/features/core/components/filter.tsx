/* eslint-disable no-unused-vars */
import { Button } from '@/features/core/components/ui/button';
import { Input } from '@/features/core/components/ui/input';
import { Label } from '@/features/core/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/features/core/components/ui/popover';
import { DeleteIcon, CalendarSearchIcon } from 'lucide-react';
import React from 'react';

interface FilterDateSectionProps {
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
    onReset: () => void;
}

export function FilterDateSection({ onDateChange, startDate, endDate, onReset }: FilterDateSectionProps) {
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline"><CalendarSearchIcon/>Filter Tanggal</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="start-date">Mulai</Label>
                        <Input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => onDateChange(e.target.value, endDate)}
                            className="col-span-2 h-8"
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="end-date">Selesai</Label>
                        <Input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => onDateChange(startDate, e.target.value)}
                            className="col-span-2 h-8"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end right-0">
                    <Button onClick={onReset} variant="outline" className="bg-red-500 text-white hover:bg-red-400 hover:text-white">
                        Reset<DeleteIcon/>
                    </Button>
                </div>
            </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
