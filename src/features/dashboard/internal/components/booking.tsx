import React from 'react';
import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
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
import { formatDate, formatDateMonthYear, formatNumber } from '@/features/core/components/formatted';
import { getGraphBooking } from '@/actions/booking/booking';
import { TanggalType } from '@/types/def';

const chartConfig = {
  fee: {
    label: "fee",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const BookingSection = ({startDate, endDate} : TanggalType) => {
  const { data: dataBooking, error, isValidating } = useSWR(
    `listBooking-${startDate}-${endDate}`,
    () => unwrap(getGraphBooking({ startDate, endDate })),
    { keepPreviousData: true }
  );
  
  const totalBooking = dataBooking ? dataBooking[dataBooking.length - 1].Running_SUM_JML_Booking : 0;
  const averageBooking = dataBooking ? Math.round(dataBooking.reduce((acc, item) => acc + item.Running_SUM_JML_Booking, 0) / dataBooking.length) : 0;

  const sortedBooking = dataBooking ? [...dataBooking].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const earliestDate = sortedBooking.length > 0 ? sortedBooking[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedBooking.length > 0 ? sortedBooking[sortedBooking.length - 1]?.date : 'Tanggal Tidak ada';

  if (error) return <div>Failed to load: {error.message}</div>;
  if (!dataBooking && isValidating) return <div>Loading...</div>;

  return (
    <Card className="w-full mt-2">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row w-full">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Rekap Data Booking</CardTitle>
          <CardDescription className="mt-2">Berikut di bawah ini adalah progres rekap kumulatif data booking pertanggal.</CardDescription>
        </div>
        <div className="flex">
          <button
            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
          >
            <span className="text-xs text-muted-foreground">
              Total Booking
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {formatNumber(totalBooking)}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={dataBooking || []}
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
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="JML_Booking"
              type="natural"
              stroke="var(--color-fee)"
              strokeWidth={2}
              dot={true}
            >
              <LabelList dataKey="Running_SUM_JML_Booking" position="top" formatter={formatNumber} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Rata-rata booking dari periode {startDate ? formatDateMonthYear(startDate) : formatDateMonthYear(earliestDate)} - {endDate ? formatDateMonthYear(endDate) : formatDateMonthYear(latestDate)} adalah {formatNumber(averageBooking)} booking<TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookingSection;
