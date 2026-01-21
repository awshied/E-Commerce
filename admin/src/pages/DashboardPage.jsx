import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { statsApi } from "../lib/api";
import myOrder from "../assets/icons/my-order.png";
import revenue from "../assets/icons/revenue.png";
import client from "../assets/icons/client.png";
import dashboard from "../assets/icons/dashboard.png";
import RevenueExpenseChart from "../components/RevenueExpenseChart";
import UserStatus from "../components/UserStatus";

const DashboardPage = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  const statsCards = [
    {
      name: "Pesanan Terkirim",
      value: statsLoading ? "..." : statsData?.deliveredOrders || 0,
      icon: myOrder,
    },
    {
      name: "Total Pendapatan",
      value: statsLoading
        ? "..."
        : `Rp. ${(statsData?.totalRevenue || 0).toLocaleString("id-ID")}`,
      icon: revenue,
    },
    {
      name: "Jumlah Pelanggan",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: client,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="breadcrumbs text-sm mb-3">
        <ul className="px-3">
          <li>
            <Link to="/dashboard">
              <img src={dashboard} alt={dashboard} className="size-6" />
            </Link>
          </li>
          <li className="font-semibold text-white">Dashboard</li>
        </ul>
      </div>

      {/* Statistik */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200">
        {statsCards.map((stat) => (
          <div key={stat.name} className="stat px-8">
            <div className="stat-figure">
              <img src={stat.icon} alt={stat.name} className="w-8 h-8" />
            </div>
            <div className="stat-title font-semibold">{stat.name}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Pendapatan / Pengeluaran & User Status */}
      <div className="grid grid-cols-[2fr_1fr] gap-2">
        {/* Pendapatan & Pengeluaran */}
        <RevenueExpenseChart />
        {/* User Status */}
        <UserStatus />
      </div>
    </div>
  );
};

export default DashboardPage;
