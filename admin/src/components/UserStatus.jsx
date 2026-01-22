import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../lib/api";
import defaultAvatar from "../assets/avatar.png";
import locationIcon from "../assets/icons/location.png";
import OnlineUserItem from "./OnlineUserItem";

const UserStatus = () => {
  const {
    data: userStatusData,
    isLoading: userStatusLoading,
    isError,
  } = useQuery({
    queryKey: ["userOnlineStatus"],
    queryFn: statsApi.getUserStatus,
    refetchInterval: 10000,
  });

  if (userStatusLoading) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        </div>
      </div>
    );
  }
  if (isError || !userStatusData) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex justify-center py-8 text-error">
            Gagal memuat status pengguna.
          </div>
        </div>
      </div>
    );
  }

  const users = [
    ...(userStatusData.onlineUsers ?? []).map((u) => ({
      ...u,
      status: "online",
    })),
    ...(userStatusData.offlineUsers ?? []).map((u) => ({
      ...u,
      status: "offline",
    })),
  ];
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          {/* Header */}
          <div className="flex justify-center flex-col gap-2">
            <h2 className="card-title text-lg font-bold">Jumlah Pengguna</h2>
            <span className="text-xs stat-title font-medium">
              Status keaktifan pelanggan yang tersedia.
            </span>
          </div>

          <div className="flex flex-col items-center justify-end gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#ffc586] rounded-full"></div>
              <span className="text-xs font-semibold">
                {userStatusData.totalOnline}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-base-content/60 rounded-full"></div>
              <span className="text-xs font-semibold">
                {userStatusData.totalOffline}
              </span>
            </div>
          </div>
        </div>
        <hr className="mt-2 w-full border-b border-neutral" />

        {/* Main */}
        <div className="flex flex-col gap-3 max-h-105 mt-2 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center py-1 justify-between"
            >
              {/* Kiri */}
              <div className="flex items-center gap-3">
                <img
                  src={user.imageUrl || defaultAvatar}
                  alt={`${user.username}'s avatar`}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="card-title text-sm font-bold">
                    {user.username}
                  </span>

                  <div className="flex items-center gap-1">
                    <img
                      src={locationIcon}
                      alt=""
                      aria-hidden="true"
                      className="w-3"
                    />
                    <span className="text-base-content text-xs font-semibold">
                      {user.city || "Tidak Diketahui"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanan */}
              <div className="flex flex-col justify-center items-end gap-2">
                <OnlineUserItem user={user} />
                <span
                  className={`text-xs font-bold ${user.status === "online" ? "text-[#ffc586]" : "text-base-content/60"}`}
                >
                  {user.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserStatus;
