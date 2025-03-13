import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageUrl from "@/data/ImageUrl";
import HeaderBack from "@/components/HeaderBack";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CategoryWithServices } from "@/types/service";
import serviceApiRequest from "@/app/api/serviceApi";

const ChooseServiceScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<
    CategoryWithServices[] | null
  >(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await serviceApiRequest.getListCateAndService(
        searchText
      );
      const filteredData = response.payload.data.filter(
        (categoryGroup) => categoryGroup["list-services"]?.length > 0
      );
      setSearchResult(filteredData);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ImageBackground
        source={{ uri: ImageUrl.imageCreate }}
        className="flex-1"
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
          <View className="flex flex-row">
            <HeaderBack />
            <View className="flex-row items-center mb-6 mt-2 ml-2">
              <Ionicons name="medkit" size={28} color="#64D1CB" />
              <Text className="ml-2 text-2xl font-pbold text-gray-800">
                Chọn dịch vụ
              </Text>
            </View>
          </View>

          <View className="flex-row items-center border-2 border-black rounded-full px-4 mb-6">
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm kiếm theo tên dịch vụ"
              placeholderTextColor="#888"
              onSubmitEditing={handleSearchSubmit}
              className="flex-1 text-base text-gray-600 ml-2 font-psemibold"
            />
          </View>

          {loading ? (
            <View className="my-4 items-center">
              <ActivityIndicator size="large" color="#64D1CB" />
            </View>
          ) : searchResult !== null ? (
            searchResult.length > 0 ? (
              <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                {searchResult.map((categoryGroup) => (
                  <View
                    key={categoryGroup["category-info"].id}
                    className="mb-4"
                  >
                    <View className="flex-row items-center mb-4">
                      <Image
                        source={{
                          uri: categoryGroup["category-info"].thumbnail,
                        }}
                        className="w-6 h-6 rounded-full mr-2 bg-cyan-300"
                      />
                      <Text className="text-xl font-pbold text-gray-800">
                        {categoryGroup["category-info"].name}
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap mt-2">
                      {categoryGroup["list-services"].map((service) => (
                        <TouchableOpacity
                          key={service.id}
                          className="flex-row items-center py-2 px-3 rounded-full border-2 border-[#64CBCC] mr-2 mb-2 bg-gray-50"
                          onPress={() =>
                            router.push({
                              pathname: "/(create)/choose-pack",
                              params: { id: service.id },
                            })
                          }
                        >
                          <Text className="text-sm text-gray-800 font-pmedium">
                            {service.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text className="text-center mt-5 text-base text-gray-700">
                Không tìm thấy kết quả
              </Text>
            )
          ) : (
            <Text className="text-center mt-5 text-base text-gray-700">
              Nhập tên dịch vụ để tìm kiếm.
            </Text>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChooseServiceScreen;
