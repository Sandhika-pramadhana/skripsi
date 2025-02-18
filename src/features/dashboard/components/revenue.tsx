import React from 'react';
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
import useSWR from 'swr';
import { unwrap } from '@/actions/use-action';
import { formatDate, formatNumber, formatDateMonthYear } from '@/features/core/components/formatted';
import { getGraphRevenue } from '@/actions/revenue/revenue';
import { TanggalType } from '@/types/def';

const chartConfig = {
  revenue: {
    label: "revenue",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const RevenueSection = ({startDate, endDate} : TanggalType) => {
  const { data: dataRevenue, error, isValidating } = useSWR(
    `listTransaction-${startDate}-${endDate}`,
    () => unwrap(getGraphRevenue({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const totalRevenue = dataRevenue ? dataRevenue[dataRevenue.length - 1].Running_SUM_JML_Revenue : 0;
  const averageRevenue = dataRevenue ? Math.round(dataRevenue.reduce((acc, item) => acc + item.Running_SUM_JML_Revenue, 0) / dataRevenue.length) : 0;

  const sortedRevenue = dataRevenue ? [...dataRevenue].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const earliestDate = sortedRevenue.length > 0 ? sortedRevenue[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedRevenue.length > 0 ? sortedRevenue[sortedRevenue.length - 1]?.date : 'Tanggal Tidak ada';

  if (error) return <div>Failed to load: {error.message}</div>;
  if (!dataRevenue && isValidating) return <div>Loading...</div>;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row w-full">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Rekap Data Revenue</CardTitle>
          <CardDescription className="mt-2">Berikut di bawah ini adalah progres rekap kumulatif data revenue pertanggal.</CardDescription>
        </div>
        <div className="flex">
          <button
            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
          >
            <span className="text-xs text-muted-foreground">
              Total Revenue
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
                {formatNumber(totalRevenue)}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={dataRevenue || []}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatDate(value)}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="Running_SUM_JML_Revenue"
              type="linear"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Rata-rata revenue dari periode {startDate ? formatDateMonthYear(startDate) : formatDateMonthYear(earliestDate)} - {endDate ? formatDateMonthYear(endDate) : formatDateMonthYear(latestDate)} adalah {formatNumber(averageRevenue)}<TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default RevenueSection;
