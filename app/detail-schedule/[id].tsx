import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import HeaderBack from "@/components/HeaderBack";

type ScheduleItem = {
  startHour: number; 
  endHour: number; 
  title: string;
};

const DetailScheduleListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedDate } = params;
  const dateStr = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;
  const currentDate = dateStr ? new Date(dateStr) : new Date();

  const startHour = 8;
  const endHour = 23;

  const HOUR_HEIGHT = 80;
  const CARD_GAP = 8;

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  const [scheduleData] = useState<ScheduleItem[]>([
    {
      startHour: 8,
      endHour: 12,
      title: "Rapat dengan Bruce Wayne",
    },
    {
      startHour: 12,
      endHour: 14,
      title: "123e",
    },
    {
      startHour: 14,
      endHour: 16,
      title: "Test wawasan kebangsaan di Dusun Wakanda",
    },
  ]);

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-4 flex-row items-center">
        <HeaderBack />
        <Text className="flex-1 text-center text-lg font-pbold">
          Lịch ngày {currentDate.toLocaleDateString()}
        </Text>
        <TouchableOpacity
          className="bg-[#64CBDB] p-2 px-6 rounded-2xl"
          onPress={() => router.push("/choose-pack")}
        >
          <Text className="text-white font-pbold">Đặt lịch</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-around items-center mb-4">
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-cyan-500 rounded-full mr-2" />
          <Text className="font-pbold text-gray-400">Ca sáng</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-orange-500 rounded-full mr-2" />
          <Text className="font-pbold text-gray-400">Ca chiều</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-indigo-700 rounded-full mr-2" />
          <Text className="font-pbold text-gray-400">Ca tối</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative pt-6 pb-6">
          <View
            style={{
              left: 20,
              top: 0,
              height: (hours.length - 0.9) * HOUR_HEIGHT,
            }}
            className="absolute w-0.5 bg-pink-300"
          />

          {hours.map((hour, index) => {
            const topOffset = index * HOUR_HEIGHT;
            const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;

            let dotColor = "bg-indigo-700";
            if (hour >= 8 && hour < 12) {
              dotColor = "bg-cyan-500";
            } else if (hour >= 12 && hour < 17) {
              dotColor = "bg-orange-500";
            }

            return (
              <View
                key={hour}
                style={{ top: topOffset }}
                className="absolute flex-row items-center"
              >
                <View
                  style={{ marginLeft: 14 }}
                  className={`w-4 h-4 ${dotColor} rounded-full`}
                />
                <Text className="text-gray-500 ml-4 font-psemibold">
                  {hourStr}
                </Text>
              </View>
            );
          })}

          {scheduleData.map((item, index) => {
            const startOffset = (item.startHour - startHour) * HOUR_HEIGHT;
            const endOffset = (item.endHour - startHour) * HOUR_HEIGHT;
            const cardHeight = endOffset - startOffset - CARD_GAP;

            return (
              <View
                key={index}
                style={{ top: startOffset, height: cardHeight }}
                className="absolute left-36 right-4 bg-pink-100 border border-pink-400 rounded-lg p-4 justify-center z-10"
              >
                <Text className="text-pink-600 font-psemibold text-sm">
                  Lịch hẹn được đặt {item.startHour}:00 - {item.endHour}:00
                </Text>
              </View>
            );
          })}

          <View style={{ height: (hours.length - 1) * HOUR_HEIGHT }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailScheduleListScreen;
