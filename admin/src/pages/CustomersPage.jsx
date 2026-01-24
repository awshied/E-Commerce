import { Link } from "react-router";

import customerManagement from "../assets/icons/customer-management.png";

const CustomersPage = () => {
  return (
    <div className="space-y-3">
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
    </div>
  );
};

export default CustomersPage;
