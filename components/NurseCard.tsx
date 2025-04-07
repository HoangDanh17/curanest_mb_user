import nurseApiRequest from "@/app/api/nurseApi";
import { ListNurseData } from "@/types/nurse";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  Image,
  Text,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type prop = {
  id: string;
  day: number;
  totalDuration: number;
  packageInfo: string;
  timeInter: number;
  patient: string;
};

const NurseCard = ({
  id,
  day,
  totalDuration,
  packageInfo,
  timeInter,
  patient,
}: prop) => {
  const NurseCardItem = ({ name, role, rating, avatar }: any) => {
    return (
      <Pressable
        className="w-[48%] m-1 border border-gray-200 rounded-lg bg-white shadow-sm"
        onPress={() =>
          router.push({
            pathname: "/(create)/date-available",
            params: {
              id: id,
              day: day,
              totalDuration: totalDuration,
              packageInfo: packageInfo,
              timeInter: timeInter,
              patient: patient,
            },
          })
        }
      >
        <View className="p-4 flex flex-col items-center gap-4">
          <View className="relative">
            <Image
              source={{
                uri: avatar,
              }}
              className="w-24 h-24 rounded-full"
              resizeMode="center"
            />
            <View className="absolute bottom-[-18] left-2 bg-white rounded-full px-2 py-1 flex-row items-center border border-gray-200">
              <Text className="text-sm font-pbold text-black">
                ✩ {parseFloat(rating.toFixed(2))}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-pbold mt-2">{name}</Text>
          <Text className="text-sm text-gray-600">{role}</Text>
        </View>
      </Pressable>
    );
  };

  const [loading, setLoading] = useState(false);
  const [listNurseData, setListNurseData] = useState<ListNurseData[]>();

  const fetchListNurse = async () => {
    setLoading(true);
    try {
      const response = await nurseApiRequest.getListNurse(id);
      setListNurseData(response.payload.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListNurse();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#64D1CB" />
        <Text className="mt-2 text-lg font-pmedium text-gray-600">
          Đang tải...
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="flex-1 p-2 bg-white"
    >
      <FlatList
        data={listNurseData}
        keyExtractor={(item) => item["nurse-id"]}
        ListHeaderComponent={() => (
          <Text className="my-2 font-pbold text-3xl mb-4">Chọn điều dưỡng</Text>
        )}
        numColumns={2}
        renderItem={({ item }) => (
          <NurseCardItem
            name={item["nurse-name"]}
            role={item["current-work-place"]}
            rating={item.rate}
            avatar={item["nurse-picture"]}
          />
        )}
      />
    </Animated.View>
  );
};

export default NurseCard;
