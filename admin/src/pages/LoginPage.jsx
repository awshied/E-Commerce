import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LoaderIcon, LogIn } from "lucide-react";
import FloatingInput from "../components/FloatingInput";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-200 h-162.5">
        <div className="w-full flex flex-col md:flex-row">
          {/* Form Field - Kiri */}
          <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
                <LogIn className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-200 mb-2">
                  Selamat Datang Kembali
                </h2>
                <p className="text-slate-400">
                  Silahkan lengkapi data di bawah ini untuk akses ke akunmu
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
                    icon="/src/assets/icons/email.png"
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
                    icon="/src/assets/icons/password.png"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                {/* Tombol Submit */}
                <button
                  className="btn btn-primary w-full text-base font-medium"
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
          <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-linear-to-bl from-slate-800/20 to-transparent">
            <div className="flex flex-col justify-center items-center">
              <img
                src="/src/assets/admin.png"
                alt="People using mobile devices"
                className="w-75 h-auto object-contain"
              />
              <div className="mt-6 text-center">
                <h3 className="text-xl font-medium text-cyan-400">
                  Saling Terhubung Di Mana Saja & Kapan Saja
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
