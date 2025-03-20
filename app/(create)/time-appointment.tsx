import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import SystemOptionScreen from "@/components/createAppointment/SystemOptionScreen";
import HeaderBack from "@/components/HeaderBack";
import { useSearch } from "@/app/provider";

const generateSchedule = (isSearch: boolean) => {
  const schedule: { [key: string]: string[] } = {};
  const startHour = 8;
  const endHour = 22;
  const interval = 30;

  const daysToGenerate = isSearch ? 3 : 14; // ✅ Giới hạn 3 ngày nếu là isSearch

  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];

    const times: string[] = [];

    if (isSearch) {
      for (let j = 0; j < 4; j++) {
        const hour = startHour + j * 2; // Giãn cách thời gian
        const minute = j % 2 === 0 ? 0 : 30; // 08:00, 10:30, 13:00, 15:30
        const time = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        times.push(time);
      }
    } else {
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const time = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;
          times.push(time);
        }
      }
    }

    schedule[dateKey] = times;
  }

  return schedule;
};

const TimeSelectScreen = () => {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const { isSearch } = useSearch();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string>("");

  const [currentMonthYear, setCurrentMonthYear] = useState<string>("");
  const [loadingTime, setLoadingTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const translateY = useSharedValue(-50);
  const schedule = generateSchedule(isSearch);
  const duration = 240; // Khoảng thời gian mặc định là 240 phút (4 giờ)

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

    // Giới hạn thời gian kết thúc không vượt quá 22:00
    if (endDate.getHours() >= 22 && endDate.getMinutes() > 0) {
      endDate.setHours(22, 0, 0, 0); // Đặt lại thời gian kết thúc là 22:00
    }

    return endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTimeSelect = async (time: string) => {
    if (!selectedDate) return;
  
    setSelectedTime(time);
    const endTime = calculateEndTime(time, 90); // duration 90 minutes
    setEndTime(endTime);
    setLoadingTime(time);
  
    await new Promise((resolve) => setTimeout(resolve, 2000));
  
    if (type === "true") {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const formattedTime = `${formattedDate}T${time}:00.000Z`;
      router.push({
        pathname: "/(create)/date-available",
        params: {
          id: id,
          number: 5,
          time: formattedTime,
        },
      });
    } else if (isSearch === true) {
      router.push("/(create)/confirm-appointment");
    } else {
      router.push("/(create)/select-type-and-time");
    }
  
    setLoadingTime(null);
  };
  
  const handleDateSelect = async (date: Date) => {
    setIsLoading(true);
    setSelectedDate(date);
    translateY.value = 0;
  
    // Tìm vị trí của ngày được chọn trong mảng dates
    const index = dates.findIndex((d) => d.toDateString() === date.toDateString());
  
    if (flatListRef.current && index !== -1) {
      // Sử dụng viewPosition: 0 để scroll đến ngày được chọn và đặt nó nằm bên trái
      flatListRef.current.scrollToIndex({ 
        index, 
        animated: true,
        viewPosition: 0 // 0 là bên trái, 0.5 là giữa, 1 là bên phải
      });
    }
  
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = selectedDate?.toDateString() === item.toDateString();
    const dateKey = item.toISOString().split("T")[0];
    const hasAvailableTime = schedule[dateKey] && schedule[dateKey].length > 0;

    let containerStyle =
      "w-16 h-16 rounded-full items-center justify-center mx-2 font-pbold ";
    if (isSelected) {
      containerStyle += "bg-[#64C1DB]";
    } else if (hasAvailableTime) {
      containerStyle += "border border-[#64C1DB]";
    } else {
      containerStyle += "bg-white border-2 border-gray-200/90";
    }

    return (
      <View className="flex flex-col items-center">
        <Pressable
          className={containerStyle}
          onPress={() => handleDateSelect(item)}
        >
          <Text
            className={`text-lg font-pbold ${
              isSelected ? "text-white" : "text-gray-900"
            }`}
          >
            {item.getDate()}
          </Text>
        </Pressable>
        <Text className="text-sm font-psemibold mt-2 text-gray-700">
          {item.toLocaleDateString("vi-VN", { weekday: "short" })}
        </Text>
      </View>
    );
  };

  const renderTimeItem = ({ item }: { item: string }) => {
    const isSelected = selectedTime === item;
    const isLoadingTime = loadingTime === item;

    return (
      <Pressable
        className={`flex-row items-center p-4 m-2 rounded-lg ${
          isSelected
            ? "bg-[#64C1DB]"
            : "bg-white border-2 border-gray-200/90 shadow-md"
        }`}
        onPress={() => handleTimeSelect(item)}
        disabled={isLoadingTime}
      >
        <View className="flex-row items-center w-full">
          {isLoadingTime ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#fff" />
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

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

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
        duration={duration}
      />
    </View>
  );
};

export default TimeSelectScreen;