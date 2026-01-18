import { Menu, Pencil } from "lucide-react";
import { useLocation } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useRef, useState } from "react";

import dashboard from "../assets/icons/dashboard.png";
import product from "../assets/icons/product-management.png";
import customer from "../assets/icons/customer-management.png";
import order from "../assets/icons/order-management.png";

export const navigationBar = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: dashboard,
  },
  {
    name: "Produk",
    path: "/produk",
    icon: product,
  },
  {
    name: "Pelanggan",
    path: "/pelanggan",
    icon: customer,
  },
  {
    name: "Pesanan",
    path: "/pesanan",
    icon: order,
  },
];

const Navbar = () => {
  const location = useLocation();
  const { authUser, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      await updateProfile({ imageUrl: base64Image });
    };
  };

  return (
    <div className="navbar w-full">
      <label
        htmlFor="my-drawer"
        className="btn btn-square btn-ghost"
        aria-label="open sidebar"
      >
        <Menu className="size-5" />
      </label>

      <div className="flex-1 px-4">
        <h1 className="text-xl font-bold">
          {navigationBar.find((item) => item.path === location.pathname)
            ?.name || "Dashboard"}
        </h1>
      </div>

      <div className="mr-5 flex items-center gap-3">
        <div className="flex flex-col items-end justify-center py-2">
          <small className="text-xs font-medium text-base-content">
            Selamat Datang,
          </small>
          <span className="text-lg font-bold text-secondary truncate">
            {authUser.username}
          </span>
        </div>
        <div className="avatar">
          <button
            className="size-12 rounded-full overflow-hidden relative group cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={selectedImg || authUser.imageUrl || "/src/assets/avatar.png"}
              alt="Admin Image"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Pencil className="size-5" />
            </div>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
