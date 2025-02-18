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
import { getGraphTraffic } from "@/actions/mytsel/traffic/traffic";
import { formatDate, formatDateMonthYear } from "@/features/core/components/formatted";

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

export function TrafficGraph({startDate, endDate} : TanggalType) {
  const { data: response, error, isValidating } = useSWR(
    `listTraffic-${startDate}-${endDate}`,
    () => unwrap(getGraphTraffic({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const dataTraffic = response ? response.items : null;

  const sortedTraffic = dataTraffic ? [...dataTraffic].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  const averageActiveUser = dataTraffic ? Math.round(dataTraffic.reduce((acc, item) => acc + item.activeUser, 0) / dataTraffic.length) : 0;
  const averageViewCount = dataTraffic ? Math.round(dataTraffic.reduce((acc, item) => acc + item.viewCount, 0) / dataTraffic.length) : 0;

  const earliestDate = sortedTraffic.length > 0 ? sortedTraffic[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedTraffic.length > 0 ? sortedTraffic[sortedTraffic.length - 1]?.date : 'Tanggal Tidak ada';

  if (error) return <div>Failed to load: {error.message}</div>;
  if (!dataTraffic && isValidating) return <div>Loading...</div>;
  if (!dataTraffic) return <div>No data available.</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Traffic</CardTitle>
        <CardDescription>{formatDateMonthYear(earliestDate)} - {formatDateMonthYear(latestDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={dataTraffic}
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
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Line
              dataKey="activeUser"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="viewCount"
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
            <div className="flex items-center gap-2 font-medium leading-none">
              Rata-rata pengguna aktif per hari adalah {averageActiveUser} Pengguna <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Rata-rata traffic setiap hari adalah {averageViewCount} kunjungan<TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};