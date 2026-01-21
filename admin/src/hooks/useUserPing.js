import { useEffect } from "react";
import { statsApi } from "../lib/api";

const useUserPing = () => {
  useEffect(() => {
    const ping = () => {
      statsApi.ping().catch(() => {});
    };

    ping(); // ping awal

    const interval = setInterval(ping, 15000); // 15 detik

    return () => clearInterval(interval);
  }, []);
};

export default useUserPing;
