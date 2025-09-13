import React, { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/features/core/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/features/core/components/ui/chart";
import { getLatestTransactions } from '@/actions/trx/trx';
import { formatMonthYear } from '@/features/core/components/formatted';

const chartConfig = {
    jumlah: {
      label: "Jumlah",
    },
    paid: {
      label: "Total Paid",
      color: "hsl(var(--chart-1))",
    },
    booking: {
      label: "Total Booking",
      color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

const TodaySection = () => {
    const [bookingToday, setBookingToday] = useState(0);
    const [trxToday, setTrxToday] = useState(0);

  
    useEffect(() => {
      async function fetchLatestTransactions() {
        try {
          const todayDate = new Date().toISOString().split('T')[0];
          const latestData = await getLatestTransactions(todayDate);
          
          // Add null checks before accessing .count
          setBookingToday(latestData.latestBooking?.count ?? 0);
          setTrxToday(latestData.latestTransaction?.count ?? 0);
        } catch (error) {
          console.error('Error fetching transactions:', error);
          // Reset to 0 on error
          setBookingToday(0);
          setTrxToday(0);
        }
      }
  
      fetchLatestTransactions();
    }, []);
  
    const chartData = [
      { tipe: "paid", jumlah: trxToday, fill: "var(--color-paid)" },
      { tipe: "booking", jumlah: bookingToday, fill: "var(--color-booking)" },
    ];

  return (
    <Card className="flex flex-col col-span-1 w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Rekap Hari Ini</CardTitle>
        <CardDescription>{formatMonthYear(new Date().toLocaleDateString())}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Pie
              data={chartData}
              dataKey="jumlah"
              nameKey="tipe"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex justify-center items-center">
          <div className="flex gap-8 justify-between items-center text-center mb-5">
            <div>
              <div className="flex gap-1 items-center">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                <h2 className="font-semibold text-base">Paid</h2>
              </div>
              <p className="text-3xl font-bold">{trxToday}</p>
            </div>
            <div>
              <div className="flex gap-1 items-center">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                <h2 className="font-semibold text-base">Booking</h2>
              </div>
              <p className="text-3xl font-bold">{bookingToday}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
            Terdapat {
                bookingToday === 0
                    ? 0
                    : Math.round((trxToday / bookingToday) * 100)
            }% transaksi yang berhasil dari {bookingToday} pesanan <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default TodaySection;