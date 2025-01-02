import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="news" options={{ title: "Tin tức" }} />
      <Stack.Screen name="detail-news/[id]" options={{ title: "" }} />
    </Stack>
  );
};

export default RootLayout;
