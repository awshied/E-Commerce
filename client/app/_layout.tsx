import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

import PageLoader from "@/components/PageLoader";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

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
