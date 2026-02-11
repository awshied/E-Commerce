import { useEffect } from "react";
import { statsApi } from "../lib/api";

const useUserPing = () => {
  useEffect(() => {
    const ping = () => {
      statsApi.ping().catch(() => {});
    };

    ping();

    const interval = setInterval(ping, 15000);

    return () => clearInterval(interval);
  }, []);
};

export default useUserPing;
