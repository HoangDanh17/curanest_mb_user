import React from "react";
import { View, Text, Image } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import IconCalendar from "@/assets/icon/calendar-range.png";
import CompletedScreen from "@/components/appointment/CompletedScreen";
import CancelledScreen from "@/components/appointment/CancelledScreen";
import InProgressScreen from "@/components/appointment/InProgressScreen";
import UpcomingScreen from "@/components/appointment/UpcomingScreen";

const Tab = createMaterialTopTabNavigator();

export default function Schedule() {
  return (
    <>
      <View className=" bg-white flex flex-row items-center justify-between p-4">
        <Text className="text-lg font-pbold">Lịch hẹn sắp tới</Text>
        <Image source={IconCalendar} />
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: {
            fontSize: 12,
            textTransform: "none",
            fontWeight: 700,
          },
          tabBarActiveTintColor: "#4B70F5",
          tabBarInactiveTintColor: "#888888",
        }}
      >
        <Tab.Screen
          name="Upcoming"
          component={UpcomingScreen}
          options={{
            title: "Sắp tới",
            tabBarIndicatorStyle: { backgroundColor: "#FFAD60" },
            tabBarActiveTintColor: "#FFAD60",
          }}
        />
        <Tab.Screen
          name="InProgress"
          component={InProgressScreen}
          options={{
            title: "Đang thực hiện",
            tabBarIndicatorStyle: { backgroundColor: "#4B70F5" },
          }}
        />
        <Tab.Screen
          name="Completed"
          component={CompletedScreen}
          options={{
            title: "Hoàn thành",
            tabBarIndicatorStyle: { backgroundColor: "#00FF9C" },
            tabBarActiveTintColor: "#00FF9C",
          }}
        />
        <Tab.Screen
          name="Cancelled"
          component={CancelledScreen}
          options={{
            title: "Đã hủy",
            tabBarIndicatorStyle: { backgroundColor: "#FF4545" },
            tabBarActiveTintColor: "#FF4545",
          }}
        />
      </Tab.Navigator>
    </>
  );
}
