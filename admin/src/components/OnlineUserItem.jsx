import { useEffect, useState } from "react";
import { timeAgo } from "../lib/timeAgo";

const OnlineUserItem = ({ user }) => {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => {
      setLabel(timeAgo(user.lastActive));
    };

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [user.lastActive]);

  return (
    <span className="text-xs text-base-content font-semibold">
      Aktif {label} lalu
    </span>
  );
};

export default OnlineUserItem;
