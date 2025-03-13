import { router } from "expo-router";
import React, { useState } from "react";
import { View, FlatList, Pressable, Image, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const NurseCard = () => {
  const NurseCardItem = ({ name, role, rating }: any) => {
    return (
      <Pressable
        className="w-[48%] m-1 border border-gray-200 rounded-lg bg-white shadow-sm"
        onPress={() => router.push("/(create)/confirm-appointment")}
      >
        <View className="p-4 flex flex-col items-center gap-4">
          <View className="relative">
            <Image
              source={{
                uri: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/2024_2_24_638444080482977358_avatar-phi-hanh-gia-cover.jpeg",
              }}
              className="w-20 h-20 rounded-full"
            />
            <View className="absolute bottom-[-18] left-4 bg-white rounded-full px-2 py-1 flex-row items-center border border-gray-100">
              <Text className="text-sm font-bold text-black">{rating}</Text>
            </View>
          </View>
          <Text className="text-lg font-pbold mt-2">{name}</Text>
          <Text className="text-sm text-gray-600">{role}</Text>
        </View>
      </Pressable>
    );
  };

  const [nurses, setNurses] = useState([
    {
      id: 1,
      name: "Jiro",
      role: "Senior Stylist",
      rating: "5.0★",
    },
    {
      id: 2,
      name: "Makoto Ryu",
      role: "Top Stylist Founder",
      rating: "5.0★",
    },
    {
      id: 3,
      name: "Marco",
      role: "Senior Stylist",
      rating: "5.0★",
    },
    {
      id: 4,
      name: "Koki Hiro",
      role: "Tech Director",
      rating: "5.0★",
    },
  ]);

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="flex-1 p-2 bg-white"
    >
      <FlatList
        data={nurses}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <Text className="my-2 font-pbold text-3xl mb-4">Chọn điều dưỡng</Text>
        )}
        numColumns={2}
        renderItem={({ item }) => (
          <NurseCardItem
            name={item.name}
            role={item.role}
            rating={item.rating}
          />
        )}
      />
    </Animated.View>
  );
};

export default NurseCard;
