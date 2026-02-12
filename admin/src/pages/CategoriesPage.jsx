import React from "react";
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";

import category from "../assets/icons/category.png";

const CategoriesPage = () => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="breadcrumbs text-sm mb-3">
          <ul className="px-3">
            <li>
              <Link to="/categories">
                <img src={category} alt="Category" className="size-6" />
              </Link>
            </li>
            <li className="font-semibold text-white">Kategori</li>
          </ul>
        </div>

        <button className="btn btn-secondary gap-2 font-bold">
          <PlusIcon className="w-5 h-5" />
          Tambah Kategori
        </button>
      </div>
    </div>
  );
};

export default CategoriesPage;
