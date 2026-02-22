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

Sentry.init({
  dsn: "https://d1f89570270f69141157f06906e46dbe@o4509643593089024.ingest.us.sentry.io/4510892862406656",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
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
  }, []);

  useUserPing(!!user);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
});
