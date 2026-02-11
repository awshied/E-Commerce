import { useEffect } from "react";
import { statsApi } from "@/lib/api";

const useUserPing = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const ping = async () => {
      try {
        await statsApi.ping();
      } catch (error) {
        console.log(error);
      }
    };

    ping();
    const interval = setInterval(ping, 10000);

    return () => clearInterval(interval);
  }, [enabled]);
};

export default useUserPing;
