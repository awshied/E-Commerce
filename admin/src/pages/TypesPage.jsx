import React from "react";
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";

import type from "../assets/icons/type.png";

const TypesPage = () => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="breadcrumbs text-sm mb-3">
          <ul className="px-3">
            <li>
              <Link to="/types">
                <img src={type} alt="Type" className="size-6" />
              </Link>
            </li>
            <li className="font-semibold text-white">Tipe</li>
          </ul>
        </div>

        <button className="btn btn-secondary gap-2 font-bold">
          <PlusIcon className="w-5 h-5" />
          Tambah Tipe
        </button>
      </div>
    </div>
  );
};

export default TypesPage;
