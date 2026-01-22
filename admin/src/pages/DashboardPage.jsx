import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { orderApi, statsApi } from "../lib/api";
import { nominal } from "../lib/nominal";
import myOrder from "../assets/icons/my-order.png";
import revenue from "../assets/icons/revenue.png";
import client from "../assets/icons/client.png";
import dashboard from "../assets/icons/dashboard.png";
import product from "../assets/icons/product.png";
import RevenueExpenseChart from "../components/RevenueExpenseChart";
import UserStatus from "../components/UserStatus";
import {
  capitalizeText,
  formatDate,
  getOrderStatusBadge,
} from "../lib/statusBadge";

const DashboardPage = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
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
      name: "Jumlah Produk",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: product,
    },
    {
      name: "Jumlah Pengguna",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: client,
    },
  ];

  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  return (
    <div className="space-y-3">
      <div className="breadcrumbs text-sm mb-3">
        <ul className="px-3">
          <li>
            <Link to="/dashboard">
              <img src={dashboard} alt="Dashboard" className="size-6" />
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
            <div className="stat-value">{nominal(stat.value)}</div>
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

      {/* Tinjau Pesanan */}
      <div className="card bg-base-200 shadow-xl mt-4">
        <div className="card-body">
          <div className="flex flex-col gap-2">
            <h2 className="card-title text-lg font-bold">Pesanan Terbaru</h2>
            <span className="text-xs stat-title font-medium">
              Beberapa pesanan yang dibeli oleh pelanggan.
            </span>
          </div>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              Belum ada pesanan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Pesanan</th>
                    <th>Pelanggan</th>
                    <th>Item</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">
                            {order.shippingAddress.fullName}
                          </div>
                          <div className="text-sm opacity-60">
                            {order.orderItems.length} item(s)
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {order.orderItems[0]?.name}
                          {order.orderItems.length > 1 &&
                            `+${order.orderItems.length - 1} more`}
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div
                          className={`badge ${getOrderStatusBadge(order.status)}`}
                        >
                          {capitalizeText(order.status)}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm opacity-60">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
