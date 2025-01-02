import React, { useState, useRef, useEffect } from "react"; // Thêm useEffect
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import SystemOptionScreen from "@/components/createAppointment/SystemOptionScreen";
import HeaderBack from "@/components/HeaderBack";
import NurseCard from "@/components/NurseCard";

const ServiceTypeScreen = () => {
  const [selectedOption, setSelectedOption] = useState<
    "system" | "user" | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [currentMonthYear, setCurrentMonthYear] = useState<string>("");
  const [loadingTime, setLoadingTime] = useState<string | null>(null);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const translateY = useSharedValue(-50);
  const [isLoading, setIsLoading] = useState(false);

  // Tự động chọn ngày hiện tại khi component được mount
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today); // Thiết lập ngày hiện tại
    handleDateSelect(today); // Kích hoạt hàm xử lý chọn ngày
  }, []);

  // Tạo danh sách ngày trong khoảng 2 tuần
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

  // Tạo danh sách thời gian từ 8:00 đến 22:00, cách nhau 30 phút
  const getTimes = () => {
    const times = [];
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0); // Bắt đầu từ 8:00
    const endTime = new Date();
    endTime.setHours(22, 0, 0, 0); // Kết thúc lúc 22:00

    while (startTime <= endTime) {
      const timeString = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      times.push(timeString);
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
    return times;
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

  const renderContent = () => {
    if (selectedOption === "system") {
      return (
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
      );
    } else if (selectedOption === "user") {
      return <NurseCard />;
    } else {
      return null;
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <HeaderBack />
      {selectedOption === null ? (
        <Animated.View
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          className="flex-1 justify-center items-center"
        >
          <Text className="text-2xl font-bold mb-6 text-[#A8E0E9]">
            Chọn điều dưỡng
          </Text>
          <View className="flex-col justify-between w-full px-8 gap-6">
            <Pressable
              className="bg-white border-2 border-[#64C1DB] px-6 py-4 rounded-lg shadow-lg"
              onPress={() => setSelectedOption("system")}
            >
              <Text className="text-black/40 font-psemibold">
                Hệ thống chọn tự động
              </Text>
            </Pressable>
            <Pressable
              className="bg-white border-2 border-[#64C1DB] px-6 py-4 rounded-lg shadow-lg"
              onPress={() => setSelectedOption("user")}
            >
              <Text className="text-black/40 font-psemibold">
                Người dùng chọn
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : (
        renderContent()
      )}
    </View>
  );
};

export default ServiceTypeScreen;
