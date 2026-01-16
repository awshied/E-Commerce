import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import { useAuthStore } from "./store/useAuthStore";
import PageLoader from "./components/PageLoader";
import DashboardLayout from "./layouts/DashboardLayout";

const App = () => {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div>
      <Routes>
        <Route
          path="/login"
          element={authUser ? <Navigate to={"/beranda"} /> : <LoginPage />}
        />
        <Route
          path="/"
          element={authUser ? <DashboardLayout /> : <Navigate to={"/login"} />}
        >
          <Route index element={<Navigate to={"/beranda"} />} />
          <Route path="beranda" element={<DashboardPage />} />
          <Route path="produk" element={<ProductsPage />} />
          <Route path="pesanan" element={<OrdersPage />} />
          <Route path="pelanggan" element={<CustomersPage />} />
        </Route>
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
