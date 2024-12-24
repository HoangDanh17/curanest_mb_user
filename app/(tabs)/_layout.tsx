import { Tabs, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";

const RootLayout = () => {
  const router = useRouter();
  // const { token, setToken, isTokenValid } = useAuthStore();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const savedToken = await AsyncStorage.getItem("authToken");
  //     if (savedToken) {
  //       setToken(savedToken);
  //     } else {
  //       router.replace("/(auth)/login");
  //     }
  //   };
  //   checkAuth();
  // }, [token, setToken, router]);

  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={size} />
          ),
          title: "Tìm kiếm",
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="schedule" color={color} size={size} />
          ),
          title: "Lịch hẹn",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" color={color} size={size} />
          ),
          title: "Profile",
        }}
      />
    </Tabs>
  );
};

export default RootLayout;
