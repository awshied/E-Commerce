import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "../../store/useAuthStore";

export default function TabsLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return <Tabs />;
}
