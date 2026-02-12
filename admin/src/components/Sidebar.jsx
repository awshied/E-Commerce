import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { navigationBar } from "./Navbar";
import { useLocation, Link } from "react-router";
import logoWeb from "../assets/logo-web.png";
import logoutIcon from "../assets/icons/logout.png";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="drawer-side is-drawer-close:overflow-visible">
      <label
        htmlFor="my-drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-17 is-drawer-open:w-60">
        <div className="p-2 w-full my-2">
          <div className="flex items-center gap-2">
            <img src={logoWeb} alt="Glaciocore Logo" className="h-12 w-auto" />
            <span className="text-xl font-bold is-drawer-close:hidden text-base-content mt-1">
              GlacioCore
            </span>
          </div>
        </div>

        <ul className="p-2 menu w-full grow flex flex-col gap-3">
          {navigationBar.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.hasChildren) {
              const isChildActive = item.children.some(
                (sub) => sub.path === location.pathname,
              );

              return (
                <li key={item.path}>
                  <details open={isChildActive} className="group">
                    <summary className="is-drawer-close:tooltip is-drawer-close:tooltip-right cursor-pointer">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="size-6 mr-2"
                      />
                      <span className="is-drawer-close:hidden text-base font-semibold">
                        {item.name}
                      </span>
                    </summary>
                    <div className="grid transition-all duration-300 ease-in-out grid-rows-[0fr] group-open:grid-rows-[1fr] ml-2">
                      <div className="overflow-hidden">
                        <ul className="px-5 menu w-full grow flex flex-col gap-2">
                          {item.children.map((sub) => {
                            const isSubActive = location.pathname === sub.path;

                            return (
                              <li key={sub.path}>
                                <Link
                                  to={sub.path}
                                  className={`is-drawer-close:hidden transition-all duration-200 ${isSubActive ? "bg-neutral text-white" : ""}`}
                                >
                                  <img
                                    src={sub.icon}
                                    alt={sub.name}
                                    className="size-5 mr-2"
                                  />
                                  <span className="is-drawer-close:hidden text-sm font-semibold">
                                    {sub.name}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </details>
                </li>
              );
            }
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "bg-neutral text-white" : ""}`}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="size-6 mr-2"
                  />
                  <span className="is-drawer-close:hidden text-base font-semibold">
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-5 w-full">
          <hr className="w-full border border-neutral mb-4" />
          <button
            onClick={logout}
            className="flex justify-start w-full bg-base-200 gap-2 cursor-pointer"
          >
            <img src={logoutIcon} className="size-6 mr-2" />
            <div className="min-w-0 is-drawer-close:hidden">
              <p className="text-base font-semibold truncate text-error">
                Keluar
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
