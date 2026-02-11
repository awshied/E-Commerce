import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import PageLoader from "@/components/PageLoader";
import useUserPing from "@/hooks/useUserPing";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { checkAuth, isLoading, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useUserPing(!!user);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading ? (
        <PageLoader />
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </QueryClientProvider>
  );
}
