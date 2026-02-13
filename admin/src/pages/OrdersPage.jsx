import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../lib/api";

import orderManagement from "../assets/icons/order-management.png";
import { formatDate } from "../lib/statusBadge";

const OrdersPage = () => {
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const orders = ordersData?.orders || [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="breadcrumbs text-sm mb-3">
        <ul className="px-3">
          <li>
            <Link to="/orders">
              <img src={orderManagement} alt="Order" className="size-6" />
            </Link>
          </li>
          <li className="font-semibold text-white">Pesanan</li>
        </ul>
      </div>

      {/* Main */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">Belum ada pesanan</p>
              <p className="text-sm">
                Daftar pesanan akan muncul saat pelanggan membuat pesanan baru
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Pesanan</th>
                    <th>Pelanggan</th>
                    <th>Item</th>
                    <th>Jumlah Harga</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const totalQuantity = (order.orderItems || []).reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    );
                    return (
                      <tr key={order._id}>
                        <td>
                          <span className="font-medium">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>

                        <td>
                          <div className="font-medium">
                            {order.shippingAddress.fullName}
                          </div>
                          <div className="text-sm opacity-60">
                            {order.shippingAddress.district},{" "}
                            {order.shippingAddress.city}
                          </div>
                        </td>

                        <td>
                          <div className="font-medium">
                            {totalQuantity} buah
                          </div>
                          <div className="text-sm opacity-60">
                            {order.orderItems?.[0]?.name || "N/A"}
                            {(order.orderItems?.length || 0) > 1 &&
                              ` +${order.orderItems.length - 1} lainnya`}
                          </div>
                        </td>

                        <td>
                          <div className="font-msemibold">
                            Rp. {order.totalPrice.toLocaleString("id-ID")}
                          </div>
                        </td>

                        <td>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                            className="select select-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="dikemas">Dikemas</option>
                            <option value="dikirim">Dikirim</option>
                            <option value="diterima">Diterima</option>
                          </select>
                        </td>

                        <td>
                          <span className="text-sm opacity-60">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
