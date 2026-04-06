"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

type StockKey = "BBCA" | "BBNI" | "BMRI";

type StockData = {
  date: string;
  actual: number;
  predicted: number;
};

const stockData: Record<StockKey, StockData[]> = {
    BBCA: [
      { date: "Feb 4", actual: 9000, predicted: 9050 },
      { date: "Feb 5", actual: 9150, predicted: 9100 },
      { date: "Feb 6", actual: 8900, predicted: 8950 },
      { date: "Feb 7", actual: 9300, predicted: 9200 },
      { date: "Feb 8", actual: 9100, predicted: 9180 },
      { date: "Feb 9", actual: 8800, predicted: 8900 },
      { date: "Feb 10", actual: 9400, predicted: 9300 },
      { date: "Feb 11", actual: 9200, predicted: 9250 },
      { date: "Feb 12", actual: 9500, predicted: 9400 },
      { date: "Feb 13", actual: 9050, predicted: 9150 },
      { date: "Feb 14", actual: 9700, predicted: 9550 },
      { date: "Feb 15", actual: 9300, predicted: 9400 },
    ],
  
    BBNI: [
      { date: "Feb 4", actual: 4000, predicted: 4100 },
      { date: "Feb 5", actual: 4300, predicted: 4200 },
      { date: "Feb 6", actual: 3800, predicted: 3950 },
      { date: "Feb 7", actual: 4500, predicted: 4400 },
      { date: "Feb 8", actual: 4200, predicted: 4300 },
      { date: "Feb 9", actual: 3700, predicted: 3900 },
      { date: "Feb 10", actual: 4600, predicted: 4450 },
      { date: "Feb 11", actual: 4400, predicted: 4500 },
      { date: "Feb 12", actual: 4800, predicted: 4700 },
      { date: "Feb 13", actual: 4100, predicted: 4300 },
      { date: "Feb 14", actual: 5000, predicted: 4800 },
      { date: "Feb 15", actual: 4550, predicted: 4600 },
    ],
  
    BMRI: [
      { date: "Feb 4", actual: 6000, predicted: 6100 },
      { date: "Feb 5", actual: 6400, predicted: 6300 },
      { date: "Feb 6", actual: 5800, predicted: 5950 },
      { date: "Feb 7", actual: 6600, predicted: 6500 },
      { date: "Feb 8", actual: 6200, predicted: 6300 },
      { date: "Feb 9", actual: 5700, predicted: 5900 },
      { date: "Feb 10", actual: 6800, predicted: 6650 },
      { date: "Feb 11", actual: 6400, predicted: 6550 },
      { date: "Feb 12", actual: 7000, predicted: 6900 },
      { date: "Feb 13", actual: 6100, predicted: 6300 },
      { date: "Feb 14", actual: 7200, predicted: 7050 },
      { date: "Feb 15", actual: 6700, predicted: 6800 },
    ],
  };
  

export default function ActualPredictionChart() {
  const [selectedStock, setSelectedStock] =
    useState<StockKey>("BBCA");

  const data = stockData[selectedStock];

  const high = Math.max(...data.map((d) => d.actual));
  const low = Math.min(...data.map((d) => d.actual));
  const range = high - low;

  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">
          Actual vs Predicted - {selectedStock}
        </h2>

        <select
          value={selectedStock}
          onChange={(e) =>
            setSelectedStock(e.target.value as StockKey)
          }
          className="border rounded-md px-3 py-1"
        >
          {Object.keys(stockData).map((stock) => (
            <option key={stock} value={stock}>
              {stock}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-sm mt-4 text-gray-600">
        <span>High <b>{high}</b></span>
        <span>Low <b>{low}</b></span>
        <span>Range <b>{range}</b></span>
      </div>
    </div>
  );
}
