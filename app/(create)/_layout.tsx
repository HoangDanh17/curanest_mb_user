import React from "react";
import { Stack } from "expo-router";

const CreateLayout = () => {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        presentation: "modal",
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="choose-pack" options={{ headerShown: false }} />
      <Stack.Screen name="select-type-and-time" options={{ headerShown: false }} />
      <Stack.Screen
        name="confirm-appointment"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="detail-pack" options={{ headerShown: false }} />
      <Stack.Screen name="choose-service" options={{ headerShown: false }} />
      <Stack.Screen name="choose-profile" options={{ headerShown: false }} />
      <Stack.Screen name="date-available" options={{ headerShown: false }} />
    </Stack>
  );
};

export default CreateLayout;
