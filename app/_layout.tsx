import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import "@/styles/global.css";
import SearchProvider from "@/app/provider";
import { StatusBar, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { Notification, NotificationResponse } from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        handleRegistrationError(
          "Permission not granted to get push token for push notification!"
        );
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(
          "🚀 ~ registerForPushNotificationsAsync ~ token:",
          pushTokenString
        );

        // Save token to AsyncStorage
        await AsyncStorage.setItem("pushToken", pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError(
        "Must use physical device for push notifications"
      );
    }
  }

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        console.log("🚀 ~ registerForPushNotificationsAsync ~ token:", token);
        // Now the token is stored in AsyncStorage, you can send it to your backend if needed
      }
    });

    // Typed notification listener
    notificationListener.current =
      Notifications.addNotificationReceivedListener(
        (notification: Notification) => {
          console.log("Notification received:", notification);
        }
      );

    // Typed response listener
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response: NotificationResponse) => {
          console.log("Notification response:", response);
        }
      );

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;

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
        <Stack.Screen
          name="report-appointment/[id]"
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
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
    </SearchProvider>
  );
}
