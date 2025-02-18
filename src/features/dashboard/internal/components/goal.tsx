import React from 'react';
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
import useSWR from 'swr';
import { unwrap } from '@/actions/use-action';
import { getGraphBooking } from '@/actions/booking/booking';
import { getGraphTrx } from '@/actions/trx/trx';
import { formatMonthYear } from '@/features/core/components/formatted';
import { TanggalType } from '@/types/def';

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

const GoalSection = ({ startDate, endDate} : TanggalType) => {
  const { data: dataBooking } = useSWR(
    `listBooking-${startDate}-${endDate}`,
    () => unwrap(getGraphBooking({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const { data: dataTransaction } = useSWR(
    `listRevenue-${startDate}-${endDate}`,
    () => unwrap(getGraphTrx({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const totalBooking = dataBooking ? dataBooking[dataBooking.length - 1].Running_SUM_JML_Booking : 0;
  const totalKiriman = dataTransaction ? dataTransaction[dataTransaction.length - 1].Running_SUM_JML_Trx : 0;

  const sortedBooking = dataBooking ? [...dataBooking].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const earliestDate = sortedBooking.length > 0 ? sortedBooking[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedBooking.length > 0 ? sortedBooking[sortedBooking.length - 1]?.date : 'Tanggal Tidak ada';

  const chartData = [
    { tipe: "paid", jumlah: totalKiriman, fill: "var(--color-paid)" },
    { tipe: "booking", jumlah: totalBooking, fill: "var(--color-booking)" },
  ];

  return (
    <Card className="flex flex-col col-span-1 w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pencapaian</CardTitle>
        <CardDescription>{formatMonthYear(earliestDate)} - {formatMonthYear(latestDate)}</CardDescription>
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
              <p className="text-3xl font-bold">{totalKiriman}</p>
            </div>
            <div>
              <div className="flex gap-1 items-center">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                <h2 className="font-semibold text-base">Booking</h2>
              </div>
              <p className="text-3xl font-bold">{totalBooking}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
        Terdapat {Math.round((totalKiriman / totalBooking) * 100)}% transaksi yang berhasil dari {totalBooking} pesanan <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default GoalSection;
