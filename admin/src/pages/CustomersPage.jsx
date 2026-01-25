import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "../lib/api";

import customerManagement from "../assets/icons/customer-management.png";
import { formatDate } from "../lib/statusBadge";

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
                    <th>Pelanggan</th>
                    <th>Email</th>
                    <th>Alamat</th>
                    <th>Wishlist</th>
                    <th>Bergabung Pada</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-secondary text-secondary-content rounded-full w-12">
                            {customer.imageUrl ? (
                              <img
                                src={customer.imageUrl}
                                alt={customer.username}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <span className="text-lg">
                                {customer.username?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold">{customer.username}</div>
                      </td>

                      <td>{customer.email}</td>

                      <td>
                        {customer.addresses?.city ||
                        customer.addresses?.province ? (
                          <div className="badge badge-ghost">
                            {[
                              customer.addresses?.city,
                              customer.addresses?.province,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        ) : (
                          <span className="text-sm opacity-60">-</span>
                        )}
                      </td>
                      <td>
                        <div className="badge badge-ghost">
                          {customer.wishlist?.length || 0} produk
                        </div>
                      </td>

                      <td>
                        <span className="text-sm opacity-60">
                          {formatDate(customer.createdAt)}
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

export default CustomersPage;
