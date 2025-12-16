"use client";

import { Button } from "@/features/core/components/ui/button";
import { Input } from "@/features/core/components/ui/input";
import { Label } from "@/features/core/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/features/core/components/ui/popover";
import {
  CalendarSearchIcon,
  DeleteIcon,
  FilterIcon,
  CpuIcon,
  SearchIcon,
  HashIcon,
  UserIcon,
  TagIcon,
  DollarSignIcon,
  CreditCardIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

interface FilterTransactionMandiriProps {
  startDate: string;
  endDate: string;
  transactionId: string;
  userId: string;
  productName: string;
  statusName: string;
  categoryName: string;
  paymentType: string;
  minAmount: string;
  maxAmount: string;

  onDateChange: (start: string, end: string) => void;
  onTransactionIdChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onProductNameChange: (value: string) => void;
  onStatusNameChange: (value: string) => void;
  onCategoryNameChange: (value: string) => void;
  onPaymentTypeChange: (value: string) => void;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
  
  onReset: () => void;
}

export function FilterTransactionMandiri({
  startDate,
  endDate,
  transactionId,
  userId,
  productName,
  statusName,
  categoryName,
  paymentType,
  minAmount,
  maxAmount,

  onDateChange,
  onTransactionIdChange,
  onUserIdChange,
  onProductNameChange,
  onStatusNameChange,
  onCategoryNameChange,
  onPaymentTypeChange,
  onMinAmountChange,
  onMaxAmountChange,

  onReset,
}: FilterTransactionMandiriProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const [localTransactionId, setLocalTransactionId] = useState(transactionId);
  const [localUserId, setLocalUserId] = useState(userId);
  const [localProductName, setLocalProductName] = useState(productName);
  const [localStatusName, setLocalStatusName] = useState(statusName);
  const [localCategoryName, setLocalCategoryName] = useState(categoryName);
  const [localPaymentType, setLocalPaymentType] = useState(paymentType);
  const [localMinAmount, setLocalMinAmount] = useState(minAmount);
  const [localMaxAmount, setLocalMaxAmount] = useState(maxAmount);

  const startRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
    setLocalTransactionId(transactionId);
    setLocalUserId(userId);
    setLocalProductName(productName);
    setLocalStatusName(statusName);
    setLocalCategoryName(categoryName);
    setLocalPaymentType(paymentType);
    setLocalMinAmount(minAmount);
    setLocalMaxAmount(maxAmount);
  }, [startDate, endDate, transactionId, userId, productName, statusName, categoryName, paymentType, minAmount, maxAmount]);

  const handleReset = () => {
    setLocalStart("");
    setLocalEnd("");
    setLocalTransactionId("");
    setLocalUserId("");
    setLocalProductName("");
    setLocalStatusName("");
    setLocalCategoryName("");
    setLocalPaymentType("");
    setLocalMinAmount("");
    setLocalMaxAmount("");

    onReset();

    setTimeout(() => startRef.current?.focus(), 100);
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" /> Filter
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96">
          <div className="grid gap-4">
            {/* ===================== TRANSACTION ID ===================== */}
            <div className="flex items-center gap-1">
              <HashIcon size={18} />
              <h4 className="font-medium"><b>ID Transaksi</b></h4>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">ID</Label>
              <Input
                type="text"
                placeholder="Masukkan ID transaksi..."
                value={localTransactionId}
                onChange={(e) => {
                  setLocalTransactionId(e.target.value);
                  onTransactionIdChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            {/* ===================== USER ID ===================== */}
            <div className="flex items-center gap-1">
              <UserIcon size={18} />
              <h4 className="font-medium"><b>User</b></h4>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">User ID</Label>
              <Input
                type="text"
                placeholder="Cari user id..."
                value={localUserId}
                onChange={(e) => {
                  setLocalUserId(e.target.value);
                  onUserIdChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            {/* ===================== PRODUCT NAME ===================== */}
            <div className="flex items-center gap-1">
              <SearchIcon size={18} />
              <h4 className="font-medium"><b>Product</b></h4>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">Nama</Label>
              <Input
                type="text"
                placeholder="Nama produk..."
                value={localProductName}
                onChange={(e) => {
                  setLocalProductName(e.target.value);
                  onProductNameChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            {/* ===================== CATEGORY ===================== */}
            <div className="flex items-center gap-1">
              <CpuIcon size={18} />
              <h4 className="font-medium"><b>Kategori</b></h4>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">Kategori</Label>
              <Input
                type="text"
                placeholder="Kategori produk..."
                value={localCategoryName}
                onChange={(e) => {
                  setLocalCategoryName(e.target.value);
                  onCategoryNameChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            {/* ===================== STATUS ===================== */}
            <div className="flex items-center gap-1">
              <TagIcon size={18} />
              <h4 className="font-medium"><b>Status</b></h4>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">Status</Label>
              <Input
                type="text"
                placeholder="Status transaksi..."
                value={localStatusName}
                onChange={(e) => {
                  setLocalStatusName(e.target.value);
                  onStatusNameChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            {/* ===================== PAYMENT TYPE ===================== */}
            <div className="flex items-center gap-1">
              <CreditCardIcon size={18} />
              <h4 className="font-medium"><b>Tipe Pembayaran</b></h4>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">Tipe</Label>
              <Input
                type="text"
                placeholder="Tipe pembayaran..."
                value={localPaymentType}
                onChange={(e) => {
                  setLocalPaymentType(e.target.value);
                  onPaymentTypeChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            {/* ===================== AMOUNT RANGE ===================== */}
            <div className="flex items-center gap-1">
              <DollarSignIcon size={18} />
              <h4 className="font-medium"><b>Jumlah</b></h4>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">Min</Label>
              <Input
                type="number"
                placeholder="Jumlah minimum..."
                value={localMinAmount}
                onChange={(e) => {
                  setLocalMinAmount(e.target.value);
                  onMinAmountChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right">Max</Label>
              <Input
                type="number"
                placeholder="Jumlah maksimum..."
                value={localMaxAmount}
                onChange={(e) => {
                  setLocalMaxAmount(e.target.value);
                  onMaxAmountChange(e.target.value);
                }}
                className="h-8"
              />
            </div>

            {/* ===================== DATE FILTER ===================== */}
            <div className="flex gap-1 items-center mt-2">
              <CalendarSearchIcon size={18} />
              <h4 className="font-medium"><b>Tanggal</b></h4>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-4">
                <Label htmlFor="start" className="w-28 text-right">
                  Mulai
                </Label>
                <Input
                  type="date"
                  ref={startRef}
                  id="start"
                  value={localStart}
                  onChange={(e) => {
                    setLocalStart(e.target.value);
                    onDateChange(e.target.value, localEnd);
                  }}
                  className="h-8"
                />
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="end" className="w-28 text-right">
                  Selesai
                </Label>
                <Input
                  type="date"
                  id="end"
                  value={localEnd}
                  onChange={(e) => {
                    setLocalEnd(e.target.value);
                    onDateChange(localStart, e.target.value);
                  }}
                  className="h-8"
                />
              </div>
            </div>

            {/* ===================== RESET BUTTON ===================== */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="bg-red-500 text-white hover:bg-red-400"
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