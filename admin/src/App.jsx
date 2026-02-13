import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import useUserPing from "./hooks/useUserPing";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import BlogPage from "./pages/BlogPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import { useAuthStore } from "./store/useAuthStore";
import PageLoader from "./components/PageLoader";
import DashboardLayout from "./layouts/DashboardLayout";

const App = () => {
  useUserPing();
  const { isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div>
      <Routes>
        <Route
          path="/login"
          element={authUser ? <Navigate to={"/dashboard"} /> : <LoginPage />}
        />
        <Route
          path="/"
          element={authUser ? <DashboardLayout /> : <Navigate to={"/login"} />}
        >
          <Route index element={<Navigate to={"/dashboard"} />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="blogs" element={<BlogPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
