import React from "react";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

const commonHeaderOptions: NativeStackNavigationOptions = {
  headerTitleStyle: {
    fontWeight: "700",
    fontSize: 20,
  },
  headerLeft: () => (
    <TouchableOpacity className="mr-4 mt-1" onPress={() => router.back()}>
      <AntDesign name="leftcircleo" size={22} color="black" />
    </TouchableOpacity>
  ),
};

const screenConfigs: Record<string, NativeStackNavigationOptions> = {
  "appointment-history": {
    ...commonHeaderOptions,
    headerTitle: "Lịch sử đặt lịch",
  },
  "relatives-profile": {
    ...commonHeaderOptions,
    headerTitle: "Hồ sơ",
  },
  "payment-history": {
    ...commonHeaderOptions,
    headerTitle: "Lịch sử thanh toán",
    headerShown: false,
  },
};

const ProfileLayout = () => {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        presentation: "modal",
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="appointment-history"
        options={screenConfigs["appointment-history"]}
      />
      <Stack.Screen
        name="payment-history"
        options={screenConfigs["payment-history"]}
      />
      <Stack.Screen
        name="relatives-profile"
        options={screenConfigs["relatives-profile"]}
      />
    </Stack>
  );
};

export default ProfileLayout;
