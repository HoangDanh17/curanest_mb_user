import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import "@/styles/global.css";
import SearchProvider from "@/app/provider";
import { StatusBar, Platform, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ToastConfig";
import { AppointmentList } from "@/types/appointment";
import appointmentApiRequest from "@/app/api/appointmentApi";
import patientApiRequest from "@/app/api/patientApi";
import { Patient } from "@/types/patient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export async function fetchAppointmentDetail(
  id: string
): Promise<AppointmentList | null> {
  try {
    const response = await appointmentApiRequest.getAppointmentNoti(id);
    return response.payload.data[0];
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return null;
  }
}

export async function fetchPatientName(id: string): Promise<Patient | null> {
  try {
    const response = await patientApiRequest.getPatientById(id);
    return response.payload.data;
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return null;
  }
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("curanest_channel", {
      name: "CuraNest Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4A90E2",
    });
  }

  if (!Device.isDevice) {
    console.error("Must use physical device for push notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.error("Permission not granted for push notifications");
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    console.error("Project ID not found");
    return;
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;
    await AsyncStorage.setItem("expoPushToken", pushTokenString);
    return pushTokenString;
  } catch (e) {
    console.error("Error getting push token:", e);
    return;
  }
}

type AppScreen = "/(tabs)/schedule" | "/(auth)/login" | "/(tabs)/home";

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

  const [isMounted, setIsMounted] = useState(false);
  const [isInitialNavigationDone, setIsInitialNavigationDone] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (error) {
      throw error;
    }
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setIsMounted(true);
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!isMounted || isInitialNavigationDone) {
        return;
      }
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }
        setIsInitialNavigationDone(true);
      } catch (error) {
        router.replace("/(auth)/login");
        setIsInitialNavigationDone(true);
      }
    };

    const handleNotificationNavigation = async (
      screen: AppScreen,
      id: string
    ) => {
      if (!isMounted) {
        return;
      }
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          if (screen === "/(tabs)/home") {
            router.replace("/(tabs)/home");
          } else {
            const appointment = await fetchAppointmentDetail(id);
            if (appointment) {
              const patientName = await fetchPatientName(
                appointment["patient-id"]
              );
              router.replace({
                pathname: screen,
                params: {
                  id: appointment.id,
                  packageId: appointment["cuspackage-id"] || "",
                  nurseId: appointment["nursing-id"] || "",
                  patientId: appointment["patient-id"] || "",
                  date: appointment["est-date"] || "",
                  status: appointment.status || "",
                  actTime: appointment["act-date"] || "",
                  selectName: String(patientName?.["full-name"]),
                },
              });
            } else {
              router.replace("/(tabs)/home");
            }
          }
        } else {
          router.replace("/(auth)/login");
        }
        setIsInitialNavigationDone(true);
      } catch (error) {
        router.replace("/(auth)/login");
        setIsInitialNavigationDone(true);
      }
    };

    const initializeApp = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const screen = response.notification.request.content.data.screen as
          | AppScreen
          | undefined;
        const id = response.notification.request.content.data[
          "sub-id"
        ] as string;
        if (screen) {
          await handleNotificationNavigation(screen, id);
          return;
        }
      }

      await checkAuthStatus();
    };

    initializeApp();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
    });

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {});

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const screen = response.notification.request.content.data.screen as
            | AppScreen
            | undefined;
          const id = response.notification.request.content.data[
            "sub-id"
          ] as string;
          if (screen) {
            await handleNotificationNavigation(screen, id);
          }
        }
      );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      subscription.remove();
    };
  }, [isMounted]);

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
          name="(news)"
          options={{ title: "", headerShown: false }}
        />
        <Stack.Screen
          name="(create)"
          options={{ title: "", headerShown: false }}
        />
        <Stack.Screen
          name="(detail)"
          options={{ title: "", headerShown: false }}
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
      <Toast config={toastConfig} />
    </SearchProvider>
  );
}
