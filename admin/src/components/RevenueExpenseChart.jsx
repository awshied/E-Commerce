import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { chartApi } from "../lib/api";
import CustomYAxisTick from "./CustomYAxisTick";
import CustomTooltip from "./CustomTooltip";

const RevenueExpenseChart = () => {
  const [year, setYear] = useState(2026);

  const { data: revenueExpenseData, isLoading: revenueExpenseLoading } =
    useQuery({
      queryKey: ["revenueExpenseChart", year],
      queryFn: () => chartApi.getRevenueAndExpense(year),
    });

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const chartData = MONTHS.map((month, index) => ({
    month,
    revenue: revenueExpenseData?.revenue?.[index] ?? 0,
    expense: revenueExpenseData?.expense?.[index] ?? 0,
  }));

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="card-title text-lg font-bold">
              Pendapatan & Pengeluaran
            </h2>
            <span className="text-xs stat-title font-medium">
              Pendapatan dan pengeluaran setiap bulan dalam setahun.
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setYear(2025)}
              className={`text-center text-xs font-semibold lg:py-2 py-1.5 lg:px-4 px-3 rounded-md cursor-pointer ${year === 2025 ? "bg-neutral font-bold" : "bg-base-200"}`}
            >
              2025
            </button>
            <button
              onClick={() => setYear(2026)}
              className={`text-center text-xs font-semibold lg:py-2 py-1.5 lg:px-4 px-3 rounded-md cursor-pointer ${year === 2026 ? "bg-neutral font-bold" : "bg-base-200"}`}
            >
              2026
            </button>
          </div>

          <div className="flex items-center justify-end gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="text-xs font-semibold">
                <span>Pendapatan</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <div className="text-xs font-semibold">
                <span>Pengeluaran</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        {revenueExpenseLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : revenueExpenseData?.revenue?.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">Belum ada</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.2}
              />

              <XAxis
                dataKey="month"
                stroke="var(--color-base-content)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              <YAxis
                stroke="var(--color-base-content)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={45}
                tick={(props) => <CustomYAxisTick {...props} />}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="revenue" fill="#FFD28F" />
              <Bar dataKey="expense" fill="#FF5B5B" />

              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient
                  id="expensesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueExpenseChart;
