"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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
import useSWR from "swr";
import { TanggalType } from "@/types/def";
import { unwrap } from "@/actions/use-action";
import { getGraphTraffic } from "@/actions/mytsel/traffic/traffic";
import { formatDateMonthYear } from "@/features/core/components/formatted";

const chartConfig = {
  traffic: {
    label: "Traffic",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function CumulativeTrafficBar({ startDate, endDate }: TanggalType) {
  const { data: response, error, isValidating } = useSWR(
    `listTraffic-${startDate}-${endDate}`,
    () => unwrap(getGraphTraffic({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const dataTraffic = response ? response.items : null;

  const sortedTraffic = dataTraffic ? [...dataTraffic].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  const totalTraffic = dataTraffic ? dataTraffic[dataTraffic.length - 1].viewCount : 0;
  const totalUser = dataTraffic ? dataTraffic[dataTraffic.length - 1].activeUser : 0;

  const earliestDate = sortedTraffic.length > 0 ? sortedTraffic[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedTraffic.length > 0 ? sortedTraffic[sortedTraffic.length - 1]?.date : 'Tanggal Tidak ada';

  const chartData = [
    { title: "Total Active User", value: totalUser },
    { title: "Total View Count", value: totalTraffic },
  ];

  if (error) return <div>Failed to load: {error.message}</div>;
  if (!dataTraffic && isValidating) return <div>Loading...</div>;
  if (!dataTraffic) return <div>No data available.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Kumulatif</CardTitle>
        <CardDescription>{formatDateMonthYear(earliestDate)} - {formatDateMonthYear(latestDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="title"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill="var(--color-traffic)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
