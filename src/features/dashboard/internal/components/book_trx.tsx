"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
import { TanggalType } from "@/types/def";
import useSWR from "swr";
import { unwrap } from "@/actions/use-action";
import { formatDate, formatDateMonthYear } from "@/features/core/components/formatted";
import { getGraphBookingTrx } from "@/actions/trx/trx";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function BookTrxGraph({startDate, endDate} : TanggalType) {
  const { data: response, error, isValidating } = useSWR(
    `listTraffic-${startDate}-${endDate}`,
    () => unwrap(getGraphBookingTrx({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const dataBookTrx = response ? response : null;

  const sortedTraffic = dataBookTrx ? [...dataBookTrx].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];


  const averageBooking = dataBookTrx ? Math.round(dataBookTrx.reduce((acc, item) => acc + item.booking, 0) / dataBookTrx.length) : 0;
  const averageTransaksi = dataBookTrx ? Math.round(dataBookTrx.reduce((acc, item) => acc + item.transaction, 0) / dataBookTrx.length) : 0;

  const earliestDate = sortedTraffic.length > 0 ? sortedTraffic[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedTraffic.length > 0 ? sortedTraffic[sortedTraffic.length - 1]?.date : 'Tanggal Tidak ada';

  if (error) return <div>Failed to load: {error.message}</div>;
  if (!dataBookTrx && isValidating) return <div>Loading...</div>;
  if (!dataBookTrx) return <div>No data available.</div>;
  
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Rekap Data Booking dan Transaksi</CardTitle>
        <CardDescription>{formatDateMonthYear(earliestDate)} - {formatDateMonthYear(latestDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={dataBookTrx}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => formatDate(value)}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Line
              dataKey="booking"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="transaction"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[hsl(var(--chart-1))] rounded-full h-3 w-3"></div>
              <p>Data Booking</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[hsl(var(--chart-2))] rounded-full h-3 w-3"></div>
              <p>Data Transaksi</p>
            </div>
            </div>
            <div className="flex items-center gap-2 font-medium leading-none">
              Rata-rata pesanan per hari adalah {averageBooking} pesanan. Rata-rata pesanan yang selesai setiap hari adalah {averageTransaksi} pesanan <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};