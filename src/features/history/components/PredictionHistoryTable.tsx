"use client";

import { Calendar } from "lucide-react";

const data = [
  {
    date: "04/02/2026",
    open: 174.20,
    close: 176.14,
    predictedClose: 175.02,
  },
  {
    date: "05/02/2026",
    open: 176.50,
    close: 178.59,
    predictedClose: 176.18,
  },
  {
    date: "06/02/2026",
    open: 173.10,
    close: 173.82,
    predictedClose: 172.29,
  },
];

export default function PredictionHistoryTable() {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      
      {/* Header with Calendar Icon */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-gray-600" />
        <h2 className="font-semibold text-lg">
          Prediction History
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Date</th>
              <th className="text-left">Open</th>
              <th className="text-left">Close (Actual)</th>
              <th className="text-left">Predicted Close</th>
              <th className="text-left">Difference</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => {
              const diff = item.close - item.predictedClose;

              // Threshold bisa kamu ubah sesuai kebutuhan
              const isAccurate = Math.abs(diff) < 2;

              return (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3">{item.date}</td>

                  <td>${item.open.toFixed(2)}</td>

                  <td>${item.close.toFixed(2)}</td>

                  <td>${item.predictedClose.toFixed(2)}</td>

                  <td
                    className={
                      diff >= 0
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {diff >= 0 ? "+" : ""}
                    {diff.toFixed(2)}
                  </td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isAccurate
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isAccurate ? "Accurate" : "Less Accurate"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
