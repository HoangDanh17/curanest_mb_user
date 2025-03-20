import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "@/styles/global.css";
import SearchProvider from "@/app/provider";

// Import the SearchProvider

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "BeVietnamPro-Black": require("../assets/fonts/BeVietnamPro-Black.ttf"),
    "BeVietnamPro-Bold": require("../assets/fonts/BeVietnamPro-Bold.ttf"),
    "BeVietnamPro-ExtraBold": require("../assets/fonts/BeVietnamPro-ExtraBold.ttf"),
    "BeVietnamPro-ExtraLight": require("../assets/fonts/BeVietnamPro-ExtraLight.ttf"),
    "BeVietnamPro-Light": require("../assets/fonts/BeVietnamPro-Light.ttf"),
    "BeVietnamPro-Medium": require("../assets/fonts/BeVietnamPro-Medium.ttf"),
    "BeVietnamPro-Regular": require("../assets/fonts/BeVietnamPro-Regular.ttf"),
    "BeVietnamPro-SemiBold": require("../assets/fonts/BeVietnamPro-SemiBold.ttf"),
    "BeVietnamPro-Thin": require("../assets/fonts/BeVietnamPro-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SearchProvider>
      <Stack
        screenOptions={{
          animation: "fade",
          presentation: "modal",
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="detail-nurse/[id]"
          options={{ title: "", headerShown: false }}
        />
        <Stack.Screen
          name="(news)"
          options={{ title: "", headerShown: false }}
        />
        <Stack.Screen
          name="(create)"
          options={{ title: "", headerShown: false }}
        />
        <Stack.Screen
          name="detail-appointment/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="list-nurse/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="detail-schedule/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        <Stack.Screen name="create-patient" options={{ headerShown: false }} />
        <Stack.Screen
          name="update-patient/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </SearchProvider>
  );
}
