import React from "react";
import { Stack } from "expo-router";

const DetailLayout = () => {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        presentation: "modal",
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="detail-appointment"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="detail-appointmentHistory"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="detail-nurse" options={{ headerShown: false }} />
      <Stack.Screen name="detail-schedule" options={{ headerShown: false }} />
      <Stack.Screen name="detail-payment" options={{ headerShown: false }} />
      <Stack.Screen name="list-nurse" options={{ headerShown: false }} />
      <Stack.Screen
        name="detail-notification"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen
        name="report-appointment"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default DetailLayout;