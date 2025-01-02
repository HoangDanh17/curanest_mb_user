import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useRouter } from "expo-router";
import SystemOptionScreen from "@/components/createAppointment/SystemOptionScreen";
import HeaderBack from "@/components/HeaderBack";

const schedule: { [key: string]: string[] } = {
  "2025-01-01": ["08:00", "09:00", "10:00", "11:00"],
  "2025-01-02": ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
  "2025-01-03": ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
};

const TimeSelectScreen = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [currentMonthYear, setCurrentMonthYear] = useState<string>("");
  const [loadingTime, setLoadingTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    handleDateSelect(today);
  }, []);

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();

  const getTimes = (selectedDate: Date | null) => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split("T")[0];
    return schedule[dateKey] || [];
  };

  const calculateEndTime = (time: string, duration: number) => {
    const [hours, minutes] = time.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time);
    const endTime = calculateEndTime(time, 90);
    setEndTime(endTime);
    setLoadingTime(time);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Chuyển trang sau khi hoàn thành
    router.push("/(create)/confirm-appointment");
    setLoadingTime(null);
  };

  const handleDateSelect = async (date: Date) => {
    setIsLoading(true);
    setSelectedDate(date);
    translateY.value = 0;

    const index = dates.findIndex(
      (d) => d.toDateString() === date.toDateString()
    );

    if (flatListRef.current && index !== -1) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = selectedDate?.toDateString() === item.toDateString();
    return (
      <View className="flex flex-col items-center">
        <Pressable
          className={`w-16 h-16 rounded-full items-center justify-center mx-2 font-pbold ${
            isSelected ? "bg-[#64C1DB]" : "bg-white border-2 border-gray-200/90"
          }`}
          onPress={() => handleDateSelect(item)}
        >
          <Text
            className={`text-lg font-pbold  ${
              isSelected ? "text-white" : "text-gray-900"
            }`}
          >
            {item.getDate()}
          </Text>
        </Pressable>
        <Text
          className={`text-sm font-psemibold mt-2 ${
            isSelected ? "text-gray-700" : "text-gray-700"
          }`}
        >
          {item.toLocaleDateString("vi-VN", { weekday: "short" })}
        </Text>
      </View>
    );
  };

  const renderTimeItem = ({ item }: { item: string }) => {
    const isSelected = selectedTime === item;
    const isLoading = loadingTime === item;

    return (
      <Pressable
        className={`flex-row items-center p-4 m-2 rounded-lg ${
          isSelected
            ? "bg-[#64C1DB]"
            : "bg-white border-2 border-gray-200/90 shadow-md"
        }`}
        onPress={() => handleTimeSelect(item)}
        disabled={isLoading}
      >
        <View className="flex-row items-center w-full">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator
                size="small"
                color={isSelected ? "#FFFFFF" : "#64C1DB"}
              />
            </View>
          ) : (
            <>
              <View
                className={`w-4 h-4 rounded-full ${
                  isSelected ? "bg-white" : "bg-blue-500"
                }`}
              />
              <Text
                className={`text-lg ml-4 ${
                  isSelected ? "text-white" : "text-gray-900"
                }`}
              >
                {item}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const firstVisibleDate = viewableItems[0].item;
      const monthYear = firstVisibleDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      });
      setCurrentMonthYear(monthYear);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View className="flex-1 p-4 bg-white">
      <HeaderBack />
      <SystemOptionScreen
        currentMonthYear={currentMonthYear}
        dates={dates}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        loadingTime={loadingTime}
        flatListRef={flatListRef}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        handleDateSelect={handleDateSelect}
        handleTimeSelect={handleTimeSelect}
        getTimes={getTimes}
        renderDateItem={renderDateItem}
        renderTimeItem={renderTimeItem}
        translateY={translateY}
        isLoading={isLoading}
      />
    </View>
  );
};

export default TimeSelectScreen;
