import { Link } from "react-router";

import orderManagement from "../assets/icons/order-management.png";

const OrdersPage = () => {
  return (
    <div className="space-y-3">
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
    </div>
  );
};

export default OrdersPage;
