import React from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi, statsApi } from "../lib/api";
import myOrder from "../assets/icons/my-order.png";
import revenue from "../assets/icons/revenue.png";
import client from "../assets/icons/client.png";

const DashboardPage = () => {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

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
        : `Rp. ${(statsData.totalRevenue || 0).toFixed(3)}`,
      icon: revenue,
    },
    {
      name: "Jumlah Pelanggan",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: client,
    },
  ];

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default DashboardPage;
