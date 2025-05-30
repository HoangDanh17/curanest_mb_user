import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  Platform,
  UIManager,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Layout,
} from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import NursingCard from "@/components/NursingCard";
import HeaderBack from "@/components/HeaderBack";
import nurseApiRequest from "@/app/api/nurseApi";
import { ListNurseData } from "@/types/nurse";

const ListNurseScreen = () => {
  const { serviceName, id } = useLocalSearchParams();
  const [nurseSearch, setNurseSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ListNurseData[]>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await nurseApiRequest.getListNurse(
        id,
        page,
        searchQuery
      );
      setSearchResult(response.payload.data);
      setTotalPages(response.payload.paging.total);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery]);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const enterAnim = useSharedValue(0);
  useEffect(() => {
    enterAnim.value = withTiming(1, { duration: 500 });
  }, [enterAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enterAnim.value,
    transform: [{ translateY: (1 - enterAnim.value) * 20 }],
  }));

  return (
    <SafeAreaView className="flex-1 p-4 bg-white pb-0">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <HeaderBack />
          <Text className="ml-2 text-lg font-pbold mt-2">{serviceName}</Text>
        </View>
      </View>

      <View className="flex-row items-center border border-gray-800 rounded-2xl px-4 py-2 mb-4">
        <TextInput
          placeholder="Nhập tên điều dưỡng"
          placeholderTextColor="#666"
          value={nurseSearch}
          onChangeText={setNurseSearch}
          onSubmitEditing={() => {
            setSearchQuery(nurseSearch);
            setPage(1);
          }}
          className="flex-1 text-base text-gray-800 font-psemibold"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View className="my-4 items-center">
          <ActivityIndicator size="large" color="#64D1CB" />
        </View>
      ) : (
        <>
          <Animated.View
            style={[{ flex: 1 }, animatedStyle]}
            layout={Layout.springify()}
          >
            <NursingCard
              data={searchResult}
              handlePress={(idNurse: string) => {
                router.push({
                  pathname: "/detail-nurse",
                  params: { idNurse: idNurse, id: String(id) },
                });
              }}
            />
          </Animated.View>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage: any) => setPage(newPage)}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const Pagination = ({ page, totalPages, onPageChange }: any) => {
  if (totalPages <= 1) return null;

  return (
    <View className="flex-row justify-center items-center mt-4">
      <TouchableOpacity
        disabled={page <= 1}
        onPress={() => onPageChange(page - 1)}
        className={`px-4 py-2 mx-1 rounded-md ${
          page <= 1 ? "bg-gray-300" : "bg-blue-500"
        }`}
      >
        <Text className="text-white">Trước</Text>
      </TouchableOpacity>

      <Text className="mx-2 text-gray-700">
        Trang {page} / {totalPages}
      </Text>

      <TouchableOpacity
        disabled={page >= totalPages}
        onPress={() => onPageChange(page + 1)}
        className={`px-4 py-2 mx-1 rounded-md ${
          page >= totalPages ? "bg-gray-300" : "bg-blue-500"
        }`}
      >
        <Text className="text-white">Tiếp</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListNurseScreen;
