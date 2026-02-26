import { Stack } from "expo-router";
import "../global.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import PageLoader from "@/components/PageLoader";
import useUserPing from "@/hooks/useUserPing";
import * as Sentry from "@sentry/react-native";
import { ToastProvider } from "@/components/toast/ToastProvider";

Sentry.init({
  dsn: "https://d1f89570270f69141157f06906e46dbe@o4509643593089024.ingest.us.sentry.io/4510892862406656",

  sendDefaultPii: true,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey[0]?.toString() || "unknown",
        },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      Sentry.captureException(error, {
        tags: { type: "react-query-mutation-error" },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
        },
      });
    },
  }),
});

export default Sentry.wrap(function RootLayout() {
  const { checkAuth, isLoading, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useUserPing(!!user);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {isLoading ? (
          <PageLoader />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              statusBarStyle: "light",
              statusBarTranslucent: true,
            }}
          />
        )}
      </ToastProvider>
    </QueryClientProvider>
  );
});
