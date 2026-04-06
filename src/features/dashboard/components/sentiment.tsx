"use client";

import { useState } from "react";

interface SentimentCardProps {
  positive?: number;
  neutral?: number;
  negative?: number;
  onSearch?: (symbol: string) => void; // callback untuk trigger analisis
}

export default function SentimentCard({
  positive = 0,
  neutral = 0,
  negative = 0,
  onSearch,
}: SentimentCardProps) {
  const [symbol, setSymbol] = useState("");

  const getDominant = () => {
    if (positive > neutral && positive > negative) return "positive";
    if (negative > neutral && negative > positive) return "negative";
    return "neutral";
  };

  const dominant = getDominant();

  const handleSearch = () => {
    if (!symbol.trim()) return;
    onSearch?.(symbol.toUpperCase());
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
  
      {/* HEADER SECTION */}
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-bold">
          Market Overview
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Sentimen media sosial menyeluruh terhadap market hari ini
        </p>
  
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan kode saham (contoh: BBCA, TLKM)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Analyze
          </button>
        </div>
      </div>
  
      {/* SENTIMENT SECTION */}
      <div className="p-6 space-y-6">
  
        {/* Dominant Badge */}
        <div
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-lg
            ${
              dominant === "positive"
                ? "bg-green-100 text-green-700"
                : dominant === "negative"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }
          `}
        >
          {dominant === "positive" && <>😀 Positif Dominan</>}
          {dominant === "neutral" && <>😐 Netral Dominan</>}
          {dominant === "negative" && <>😡 Negatif Dominan</>}
        </div>
  
        {/* Positive */}
        <div>
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span className="text-green-600 flex items-center gap-1">
              😀 Positif
            </span>
            <span>{positive}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${positive}%` }}
            />
          </div>
        </div>
  
        {/* Neutral */}
        <div>
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span className="text-gray-600 flex items-center gap-1">
              😐 Netral
            </span>
            <span>{neutral}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gray-400 h-3 rounded-full transition-all duration-700"
              style={{ width: `${neutral}%` }}
            />
          </div>
        </div>
  
        {/* Negative */}
        <div>
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span className="text-red-600 flex items-center gap-1">
              😡 Negatif
            </span>
            <span>{negative}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${negative}%` }}
            />
          </div>
        </div>
  
      </div>
    </div>
  );
}  