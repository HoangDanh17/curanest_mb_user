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
      <Stack.Screen name="create-appoinment" options={{ headerShown: false }} />
      <Stack.Screen
        name="select-type-and-time"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="time-appointment" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-appointment" options={{ headerShown: false }} />

    </Stack>
  );
};

export default CreateLayout;
