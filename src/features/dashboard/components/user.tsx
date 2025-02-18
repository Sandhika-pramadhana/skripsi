import React, { useState } from 'react';
import useSWR from 'swr';
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
import { unwrap } from '@/actions/use-action';
import { getGraphUser } from '@/actions/user/user';
import { TrendingUp } from 'lucide-react';
import { formatDateMonthYear, formatNumber } from '@/features/core/components/formatted';
import { TanggalType } from '@/types/def';

const chartConfig = {
  user: {
    label: "Total User",
    color: "#003366",
  },
} satisfies ChartConfig;

const UserSection = ({startDate, endDate} : TanggalType) => {
  const [activeChart, setActiveChart] = useState("user");

  const { data: dataUser, error, isValidating } = useSWR(
    `listUser-${startDate}-${endDate}`,
    () => unwrap(getGraphUser({ startDate, endDate })),
    { keepPreviousData: true }
  );

  const averageUser = dataUser ? Math.round(dataUser.reduce((acc, item) => acc + item.count, 0) / dataUser.length) : 0;
  const totalUser = dataUser ? dataUser.reduce((acc, item) => acc + item.count, 0) : 0;

  const sortedUser = dataUser ? [...dataUser].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const earliestDate = sortedUser.length > 0 ? sortedUser[0]?.date : 'Tanggal Tidak ada';
  const latestDate = sortedUser.length > 0 ? sortedUser[sortedUser.length - 1]?.date : 'Tanggal Tidak ada';

  if (error) return <div>Failed to load: {error.message}</div>;
  if (!dataUser && isValidating) return <div>Loading...</div>;

  return (
    <Card className="w-full col-span-2">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row w-full">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Rekap Data Pengguna</CardTitle>
          <CardDescription>
            Menampilkan jumlah total pengguna untuk periode terpilih
          </CardDescription>
        </div>
        <div className="flex">
          <button
            className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 ${activeChart === 'user' ? 'bg-white text-black' : 'bg-white'}`}
            onClick={() => setActiveChart('user')}
          >
            <span className="text-xs text-muted-foreground">
              {chartConfig.user.label}
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {formatNumber(totalUser)}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            data={dataUser || []}
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
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="user"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey="count" fill="#003366"></Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Rata-rata pengguna dari periode {startDate ? formatDateMonthYear(startDate) : formatDateMonthYear(earliestDate)} - {endDate ? formatDateMonthYear(endDate) : formatDateMonthYear(latestDate)} adalah {formatNumber(averageUser)} pengguna<TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserSection;
