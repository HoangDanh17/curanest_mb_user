import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import HeaderBack from "@/components/HeaderBack";
import NurseCard from "@/components/NurseCard";

const ServiceTypeScreen = () => {
  const [selectedOption, setSelectedOption] = useState<
    "system" | "user" | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    const today = new Date();
    setSelectedOption(null); // Đặt lại trạng thái khi vào màn hình
  }, []);

  // Reset trạng thái khi người dùng quay lại
  useFocusEffect(
    React.useCallback(() => {
      setSelectedOption(null);
    }, [])
  );

  // Xử lý khi chọn "System" -> Chuyển thẳng sang màn hình xác nhận
  const handleSystemSelect = () => {
    setSelectedOption("system");
    router.push("/(create)/confirm-appointment");
  };

  // Xử lý khi chọn "User" -> Hiển thị giao diện chọn điều dưỡng
  const handleUserSelect = () => {
    setSelectedOption("user");
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <HeaderBack />
      {selectedOption === null ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="flex-1 justify-center items-center"
        >
          <Text className="text-2xl font-bold mb-6 text-[#A8E0E9]">
            Chọn điều dưỡng
          </Text>

          <View className="w-full px-8 gap-6">
            <Pressable
              className="bg-white border-2 border-[#64C1DB] px-6 py-4 rounded-lg shadow-lg"
              onPress={handleSystemSelect}
            >
              <Text className="text-black/40 font-psemibold">
                Hệ thống chọn tự động
              </Text>
            </Pressable>

            <Pressable
              className="bg-white border-2 border-[#64C1DB] px-6 py-4 rounded-lg shadow-lg"
              onPress={handleUserSelect}
            >
              <Text className="text-black/40 font-psemibold">
                Người dùng chọn
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : selectedOption === "user" ? (
        <NurseCard />
      ) : null}
    </View>
  );
};

export default ServiceTypeScreen;
