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
  Modal,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Ava from "@/assets/images/homepage.png";
type prop = {
  id: string;
  day: number;
  totalDuration: number;
  packageInfo: string;
  timeInter: number;
  patient: string;
  discount: number;
};

const NurseCard = ({
  id,
  day,
  totalDuration,
  packageInfo,
  timeInter,
  patient,
  discount,
}: prop) => {
  const [loading, setLoading] = useState(false);
  const [listNurseData, setListNurseData] = useState<ListNurseData[]>();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<ListNurseData | null>(
    null
  );

  const fetchListNurse = async () => {
    setLoading(true);
    try {
      const response = await nurseApiRequest.getListNurse(id);
      setListNurseData(response.payload.data);
    } catch (error) {
      console.error("Error fetching nurses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListNurse();
  }, []);

  const handleConfirm = () => {
    if (!selectedNurse) return;
    setShowConfirm(false);
    router.push({
      pathname: "/(create)/date-available",
      params: {
        id,
        day: day.toString(),
        totalDuration: totalDuration.toString(),
        packageInfo,
        timeInter: timeInter.toString(),
        patient,
        nurseInfo: JSON.stringify(selectedNurse),
        discount: discount,
      },
    });
  };

  const NurseCardItem = ({ name, role, rating, avatar, item }: any) => {
    const handlePress = () => {
      setSelectedNurse(item);
      setShowConfirm(true);
    };

    return (
      <Pressable
        className="w-[48%] m-1 border border-gray-200 rounded-lg bg-white shadow-sm"
        onPress={handlePress}
      >
        <View className="p-4 flex flex-col items-center gap-4">
          <View className="relative">
            <Image
              source={{
                uri:
                  avatar === ""
                    ? "https://i.pinimg.com/564x/a7/ff/90/a7ff9069f727d093e578528e2355ccff.jpg"
                    : avatar,
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
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
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
            item={item}
          />
        )}
      />

      <Modal
        transparent
        animationType="fade"
        visible={showConfirm}
        onRequestClose={() => setShowConfirm(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className="bg-white w-4/5 rounded-2xl p-6 shadow-lg">
            <Text className="text-xl font-pbold text-center mb-4">
              Xác nhận
            </Text>
            <Text className="text-base text-center mb-6">
              Bạn có chắc muốn chọn điều dưỡng{" "}
              <Text className="font-pbold">
                {selectedNurse?.["nurse-name"]}
              </Text>
              ?
            </Text>
            <View className="flex-row justify-center gap-6">
              <Pressable
                className="bg-gray-200 px-4 py-2 rounded-xl"
                onPress={() => setShowConfirm(false)}
              >
                <Text className="text-black font-pmedium">Hủy</Text>
              </Pressable>
              <Pressable
                className="bg-teal-400 px-4 py-2 rounded-xl"
                onPress={handleConfirm}
              >
                <Text className="text-white font-pmedium">Đồng ý</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default NurseCard;
