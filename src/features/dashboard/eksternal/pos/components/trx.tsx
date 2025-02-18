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
import { getGraphTrx } from '@/actions/trx/trx';
import { TanggalType } from '@/types/def';

const chartConfig = {
  fee: {
    label: "fee",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const TrxExternalPosSection = ({startDate, endDate} : TanggalType) => {
  const { data: dataTrx, error, isValidating } = useSWR(
    `listTrx-${startDate}-${endDate}`,
    () => unwrap(getGraphTrx({ startDate, endDate })),
    { keepPreviousData: true }
  );
  const totalTrx = dataTrx ? dataTrx[dataTrx.length - 1].Running_SUM_JML_Trx : 0;
  const averageTrx = dataTrx ? Math.round(dataTrx.reduce((acc, item) => acc + item.Running_SUM_JML_Trx, 0) / dataTrx.length) : 0;

  const sortedTrx = dataTrx ? [...dataTrx].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const earliestDate = sortedTrx.length > 0 ? sortedTrx[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedTrx.length > 0 ? sortedTrx[sortedTrx.length - 1]?.date : 'Tanggal Tidak ada';

  if (error) return <div>Failed to load: {error.message}</div>;
  if (!dataTrx && isValidating) return <div>Loading...</div>;

  return (
    <Card className="w-full mt-2">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row w-full">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Rekap Data Transaksi</CardTitle>
          <CardDescription className="mt-2">Berikut di bawah ini adalah progres rekap kumulatif data transaksi pertanggal.</CardDescription>
        </div>
        <div className="flex">
          <button
            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
          >
            <span className="text-xs text-muted-foreground">
              Total Fee
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {formatNumber(totalTrx)}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={dataTrx || []}
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
              dataKey="Running_SUM_JML_Trx"
              type="linear"
              stroke="var(--color-fee)"
              strokeWidth={2}
              dot={true}
            >
              <LabelList dataKey="Running_SUM_JML_Trx" position="top" formatter={formatNumber} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Rata-rata transaksi dari periode {startDate ? formatDateMonthYear(startDate) : formatDateMonthYear(earliestDate)} - {endDate ? formatDateMonthYear(endDate) : formatDateMonthYear(latestDate)} adalah {formatNumber(averageTrx)} transaksi<TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default TrxExternalPosSection;
