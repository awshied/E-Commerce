import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { customerApi } from "../lib/api";
import customerManagement from "../assets/icons/customer-management.png";
import { formatDate } from "../lib/statusBadge";
import { nominal } from "../lib/nominal";
import defaultAvatar from "../assets/avatar.png";

const CustomersPage = () => {
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
  });

  const customers = customerData?.customers || [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="breadcrumbs text-sm mb-3">
        <ul className="px-3">
          <li>
            <Link to="/customers">
              <img src={customerManagement} alt="Customer" className="size-6" />
            </Link>
          </li>
          <li className="font-semibold text-white">Pelanggan</li>
        </ul>
      </div>

      {/* Main */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {customerLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">Belum ada pelanggan</p>
              <p className="text-sm">
                Daftar pelanggan akan muncul saat registrasi
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Pelanggan</th>
                    <th>Bergabung Pada</th>
                    <th>Alamat</th>
                    <th>Wishlist</th>
                    <th>Total Belanjaan</th>
                    <th>Pesanan Terakhir</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-secondary text-secondary-content rounded-full w-12">
                              <img
                                src={customer.imageUrl || defaultAvatar}
                                alt={customer.username}
                                className="w-12 h-12 rounded-full"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-base">
                              {customer.username}
                            </span>
                            <span className="font-medium text-sm text-base-content/60">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="text-sm font-medium">
                          {formatDate(customer.createdAt)}
                        </span>
                      </td>

                      <td>
                        {customer.addresses?.city ||
                        customer.addresses?.province ? (
                          <div className="text-sm font-medium">
                            {[
                              customer.addresses?.city,
                              customer.addresses?.province,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        ) : (
                          <span className="text-sm font-medium">-</span>
                        )}
                      </td>
                      <td>
                        <div className="text-sm font-medium">
                          {customer.wishlist?.length || 0} produk
                        </div>
                      </td>

                      <td>
                        <div className="text-sm font-medium">
                          {customer.totalSpent != null
                            ? `Rp. ${nominal(customer.totalSpent)}`
                            : "-"}
                        </div>
                      </td>

                      <td>
                        <div className="text-sm font-medium">
                          {customer.lastOrderAmount != null
                            ? `Rp. ${nominal(customer.lastOrderAmount)}`
                            : "-"}
                        </div>
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

export default CustomersPage;
