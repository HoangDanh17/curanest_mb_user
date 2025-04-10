import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import HeaderBack from "@/components/HeaderBack";
import NurseCard from "@/components/NurseCard";

const ServiceTypeScreen = () => {
  const {
    id,
    day,
    totalDuration,
    serviceId,
    packageInfo,
    timeInter,
    patient,
    discount,
  } = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState<
    "system" | "user" | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    setSelectedOption(null);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedOption(null);
    }, [])
  );

  const handleSystemSelect = () => {
    setSelectedOption("system");
    router.push({
      pathname: "/(create)/date-available",
      params: {
        id: id,
        day: day,
        totalDuration: totalDuration,
        packageInfo: packageInfo,
        timeInter: timeInter,
        patient: patient,
        discount: discount,
      },
    });
  };

  const handleUserSelect = () => {
    setSelectedOption("user");
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <View className=" mt-4">
        <HeaderBack />
      </View>
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
        <NurseCard
          id={String(serviceId)}
          day={Number(day)}
          totalDuration={Number(totalDuration)}
          packageInfo={String(packageInfo)}
          timeInter={Number(timeInter)}
          patient={String(patient)}
          discount={Number(discount)}
        />
      ) : null}
    </View>
  );
};

export default ServiceTypeScreen;
