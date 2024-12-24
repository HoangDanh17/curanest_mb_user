import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";

const Root = () => {
  // const router = useRouter();
  // const { token, setToken } = useAuthStore();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const savedToken = await AsyncStorage.getItem("authToken");
  //     if (savedToken) {
  //       setToken(savedToken);
  //     } else {
  //       router.push("/(auth)/welcome");
  //     }
  //   };
  //   checkAuth();
  // }, [token]);

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Root;
