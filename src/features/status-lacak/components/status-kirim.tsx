"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/core/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/features/core/components/ui/chart";
import useSWR from "swr";
import { unwrap } from "@/actions/use-action";
import { getGraphBooking } from "@/actions/booking/booking";
import { formatMonthYear } from "@/features/core/components/formatted";
import { getCumulativeTransactionStatus } from "@/actions/trx/trx";
import { TanggalType } from "@/types/def";

const chartConfig = {
  label: {
    color: "#ffffff",
  },
} satisfies ChartConfig;

export function StatusKirimSection({ startDate, endDate } : TanggalType) {
  const { data: dataBooking } = useSWR(
    `listBooking-${startDate}-${endDate}`,
    () => unwrap(getGraphBooking({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const { data: transactionData } = useSWR(
    `cumulativeTransactionStatus-${startDate}-${endDate}`,
    () => unwrap(getCumulativeTransactionStatus({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const sortedBooking = dataBooking ? [...dataBooking].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const earliestDate = sortedBooking.length > 0 ? sortedBooking[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedBooking.length > 0 ? sortedBooking[sortedBooking.length - 1]?.date : 'Tanggal Tidak ada';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rekap Data berdasarkan Status Kirim</CardTitle>
        <CardDescription>{formatMonthYear(earliestDate)} - {formatMonthYear(latestDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={transactionData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="statusName"
              type="category"
              tickLine={true}
              tickMargin={10}
              axisLine={false}
              className="text-[9px]"
            />
            <XAxis type="number" />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              fill="#003366"
              radius={4}
            >
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
