import React from "react";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const revenue = payload.find((p) => p.dataKey === "revenue");
  const expenses = payload.find((p) => p.dataKey === "expenses");

  return (
    <div
      className="bg-base-300 p-4 rounded-xl flex flex-col gap-2 min-w-36"
      style={{
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      }}
    >
      {/* Label Bulan */}
      <span className="text-base-content font-bold md:text-sm text-xs">
        {payload[0]?.payload?.monthMeans}{" "}
      </span>

      {/* Pendapatan */}
      {revenue && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="md:text-sm text-xs text-base-content font-medium">
            {(revenue.value ?? 0).toLocaleString()}
          </span>
        </div>
      )}

      {/* Pengeluaran */}
      {expenses && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary rounded-full"></div>

          <span className="md:text-sm text-xs text-base-content font-medium">
            {(expenses.value ?? 0).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;
