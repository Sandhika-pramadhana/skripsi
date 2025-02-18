/* eslint-disable no-unused-vars */
import { Button } from '@/features/core/components/ui/button';
import { Input } from '@/features/core/components/ui/input';
import { Label } from '@/features/core/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/features/core/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/features/core/components/ui/select';
import { CalendarSearchIcon, DeleteIcon, FilterIcon, ListCollapseIcon } from 'lucide-react';
import React from 'react';

interface FilterSectionProps {
    startDate: string;
    endDate: string;
    status: string;
    onDateChange: (start: string, end: string) => void;
    onStatusChange: (newStatus: string) => void;
    onReset: () => void;
}

export function FilterSection({ onDateChange, onStatusChange, startDate, endDate, status, onReset }: FilterSectionProps) {
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline"><FilterIcon/>Filter</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            <div className="grid gap-4">
                <div className="flex gap-1 items-center">
                    <CalendarSearchIcon size={18}/>
                    <h4 className="font-medium leading-none"><b>Tanggal</b></h4>
                </div>
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
                <div className="flex gap-1 items-center">
                    <ListCollapseIcon size={18}/>
                    <h4 className="font-medium leading-none"><b>Status Kiriman</b></h4>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="start-date">Status</Label>
                        <Select 
                            value={status}
                            onValueChange={(newStatus) => {
                                onStatusChange(newStatus);
                            }}
                        >
                            <SelectTrigger className="w-[185px]">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Status Transaksi</SelectLabel>
                                <SelectItem value="Pesanan Dibuat">Pesanan Dibuat</SelectItem>
                                <SelectItem value="Pesanan Terbayar">Pesanan Terbayar</SelectItem>
                                <SelectItem value="Kurir ditugaskan">Kurir ditugaskan</SelectItem>
                                <SelectItem value="Pickup berhasil">Pickup berhasil</SelectItem>
                                <SelectItem value="Dalam Proses Pengiriman">Dalam Proses Pengiriman</SelectItem>
                                <SelectItem value="Dalam Proses Pengantaran">Dalam Proses Pengantaran</SelectItem>
                                <SelectItem value="Kiriman tiba">Kiriman tiba</SelectItem>
                                <SelectItem value="Kurang bayar">Kurang bayar</SelectItem>
                                <SelectItem value="Pesanan Dibatalkan">Pesanan Dibatalkan</SelectItem>
                                <SelectItem value="Gagal antar">Gagal antar</SelectItem>                   
                                </SelectGroup>
                            </SelectContent>
                        </Select>
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
