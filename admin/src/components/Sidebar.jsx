import React from "react";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const { logout } = useAuthStore();
  return (
    <div className="flex gap-2">
      Sidebar
      <button onClick={logout} className="btn btn-primary">
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
