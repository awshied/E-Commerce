import { Menu, Pencil } from "lucide-react";
import { useLocation } from "react-router";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { notificationApi } from "../lib/api";
import { formatRelativeTimeWithClock } from "../lib/timeAgo";

import dashboard from "../assets/icons/dashboard.png";
import management from "../assets/icons/management.png";
import product from "../assets/icons/product-management.png";
import blog from "../assets/icons/blog.png";
import customer from "../assets/icons/customer-management.png";
import order from "../assets/icons/order-management.png";
import avatar from "../assets/avatar.png";
import notification from "../assets/icons/notification.png";
import noNotification from "../assets/no-notification.png";
import trash from "../assets/icons/trash.png";
import defaultAvatar from "../assets/avatar.png";
import time from "../assets/icons/time.png";

export const navigationBar = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: dashboard,
  },
  {
    name: "Kelola",
    icon: management,
    hasChildren: true,
    children: [
      {
        name: "Produk",
        path: "/products",
        icon: product,
      },
      {
        name: "Blog",
        path: "/blogs",
        icon: blog,
      },
    ],
  },
  {
    name: "Pelanggan",
    path: "/customers",
    icon: customer,
  },
  {
    name: "Pesanan",
    path: "/orders",
    icon: order,
  },
];

const groupNotificationsByDate = (notifications) => {
  const now = new Date();

  const groups = {
    recent: [],
    last7Days: [],
    last30Days: [],
    older: [],
  };

  notifications.forEach((notif) => {
    const createdAt = new Date(notif.createdAt);
    const diffInDays =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      groups.recent.push(notif);
    } else if (diffInDays < 7) {
      groups.last7Days.push(notif);
    } else if (diffInDays < 30) {
      groups.last30Days.push(notif);
    } else {
      groups.older.push(notif);
    }
  });

  return groups;
};

const Navbar = () => {
  const location = useLocation();
  const { authUser, updateProfile } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getAll();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Gagal menangkap semua notifikasi:", error);
    }
  }, []);

  const handleMarkAsRead = useCallback(
    async (id) => {
      try {
        await notificationApi.marked(id);
        fetchNotifications();
      } catch (error) {
        console.error("Gagal menandai notifikasi sudah dibaca:", error);
      }
    },
    [fetchNotifications],
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await notificationApi.delete(id);
        fetchNotifications();
      } catch (error) {
        console.error("Gagal menghapus notifikasi tertentu:", error);
      }
    },
    [fetchNotifications],
  );

  const handleDeleteAll = useCallback(async () => {
    try {
      await notificationApi.deleteAll();
      fetchNotifications();
    } catch (error) {
      console.error("Gagal menghapus semua notifikasi:", error);
    }
  }, [fetchNotifications]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      try {
        await updateProfile({ imageUrl: base64Image });
      } catch (error) {
        setSelectedImg(null);
        console.error("Gagal mengganti foto profil:", error);
      }
    };
  };

  const renderNotification = useCallback(
    (notif) => (
      <div
        key={notif._id}
        className={`px-3 flex justify-between items-center ${
          notif.isRead ? "" : "bg-neutral border-none rounded-lg py-3"
        }`}
      >
        <div
          onClick={() => handleMarkAsRead(notif._id)}
          className="cursor-pointer flex gap-3 items-center"
        >
          <img
            src={notif.imageUrl || defaultAvatar}
            alt={`${notif.username}'s avatar`}
            className="h-11 w-11 rounded-lg object-cover"
          />
          <div className="mr-2">
            <p className="font-bold text-sm text-base-content mb-1">
              {notif.title}
            </p>
            <p className="text-xs text-white font-semibold mb-1">
              {notif.message}
            </p>
            <div className="flex items-center gap-1.5">
              <img src={time} alt={time} className="w-3 h-3 opacity-70" />
              <p className="text-xs text-base-content/70 font-semibold">
                {formatRelativeTimeWithClock(notif.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleDelete(notif._id)}
          className="btn btn-square btn-ghost"
        >
          <img src={trash} alt={trash} className="w-4 h-4" />{" "}
        </button>
      </div>
    ),
    [handleMarkAsRead, handleDelete],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!showNotif) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [showNotif, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }

      setShowNotif(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications],
  );

  useEffect(() => {
    if (!showNotif) return;
    const timer = setInterval(() => {
      setNotifications((prev) => [...prev]);
    }, 10000);

    return () => clearInterval(timer);
  }, [showNotif]);

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

      <div className="mr-5 flex gap-6">
        <div className="card-actions items-center gap-3">
          <div className="relative" ref={buttonRef}>
            <button
              onClick={() => setShowNotif((prev) => !prev)}
              className="relative btn btn-circle bg-base-300 shadow-xl"
            >
              <img src={notification} alt="notif" className="size-6" />

              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 bg-[#ff5050] w-3 h-3 rounded-full" />
              )}
            </button>
          </div>
          {showNotif && (
            <div
              ref={panelRef}
              className={`absolute right-50 top-16 w-100 bg-base-300 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-2xl p-4 z-50 border border-white/10 ring-1 ring-primary/20   transition-all duration-200 ease-out ${showNotif ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-start gap-1">
                  <h3 className="font-extrabold text-lg">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <small className="font-semibold text-xs text-[#ffc586]">
                      ({unreadCount})
                    </small>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="text-sm text-[#ff5050] font-semibold hover:underline cursor-pointer"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="h-110 flex flex-col justify-center items-center gap-6">
                  <img
                    src={noNotification}
                    alt="No Notification"
                    className="size-32"
                  />
                  <p className="text-center font-semibold text-base-content/70 text-sm">
                    Anda belum menerima notifikasi apapun.
                  </p>
                </div>
              ) : (
                <div className="max-h-110 overflow-y-auto space-y-4">
                  {groupedNotifications.recent.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-base-content/80">
                        Baru Saja
                      </h4>
                      {groupedNotifications.recent.map(renderNotification)}
                    </>
                  )}

                  {groupedNotifications.last7Days.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-base-content/80">
                        7 Hari Terakhir
                      </h4>
                      {groupedNotifications.last7Days.map(renderNotification)}
                    </>
                  )}

                  {groupedNotifications.last30Days.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-base-content/80">
                        30 Hari Terakhir
                      </h4>
                      {groupedNotifications.last30Days.map(renderNotification)}
                    </>
                  )}

                  {groupedNotifications.older.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-base-content/80">
                        Lebih Lama
                      </h4>
                      {groupedNotifications.older.map(renderNotification)}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end justify-center py-2">
            <small className="text-xs font-medium text-base-content">
              Selamat Datang,
            </small>
            <span className="text-lg font-bold text-secondary truncate">
              {authUser?.username}
            </span>
          </div>
          <div className="avatar">
            <button
              className="size-12 rounded-full overflow-hidden relative group cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser?.imageUrl || avatar}
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
    </div>
  );
};

export default Navbar;
