import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LoaderIcon } from "lucide-react";
import FloatingInput from "../components/FloatingInput";
import logoWeb from "../assets/logo-web.png";
import emailIcon from "../assets/icons/email.png";
import passwordIcon from "../assets/icons/password.png";
import adminWallpaper from "../assets/admin-panel-wallpaper.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="h-screen bg-base-100 text-base flex">
      {/* Form Field - Kiri */}
      <div className="flex flex-1 items-center justify-center flex-col p-8 lg:-12 relative overflow-hidden">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="flex flex-col items-center justify-center gap-2">
            <img src={logoWeb} alt="Logo Web" className="w-32 h-auto mb-4" />
            <h2 className="text-4xl text-center font-bold text-slate-200">
              Administrator
            </h2>
            <p className="text-sm text-base-content mt-2 pb-10 text-center px-4 leading-relaxed">
              Selamat datang kembali{" "}
              <span className="text-secondary font-bold">Admin </span>
              di <span className="text-secondary font-bold">Mang TekTek</span>.
              Silakan kelola produk, pesanan, pelanggan, dan laporan penjualan
              dengan mudah melalui panel ini.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <FloatingInput
                label="Email"
                name="email"
                type="email"
                icon={emailIcon}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div>
              <FloatingInput
                label="Password"
                name="password"
                type="password"
                icon={passwordIcon}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {/* Tombol Submit */}
            <button
              className="btn btn-secondary w-full text-lg font-bold text-base-100"
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <LoaderIcon className="w-full h-5 animate-spin" />
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Gambar - Kanan */}
      <div className="hidden lg:flex flex-1 items-center justify-center overflow-hidden">
        <img
          src={adminWallpaper}
          alt="Admin Panel"
          className="w-160 h-140 rounded-4xl border-3 border-secondary"
        />
      </div>
    </div>
  );
};

export default LoginPage;
