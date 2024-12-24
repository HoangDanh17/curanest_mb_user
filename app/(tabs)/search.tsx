import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
  Easing,
  withSequence,
  interpolate,
} from "react-native-reanimated";
import DoctorCard from "@/components/DoctorCard";
import DATA from "@/data/NurseData";
import { router } from "expo-router";
type SelectedFilter = {
  district: string | null;
  service: string | null;
};

const SearchNurseScreen = () => {
  const [text, onChangeText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>({
    district: null,
    service: null,
  });

  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(-10);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      maxHeight: height.value,
      opacity: opacity.value,
      transform: [
        { scale: interpolate(scale.value, [0, 1], [0.95, 1]) },
        { translateY: translateY.value },
      ],
      overflow: "hidden",
    };
  });

  const toggleFilterDropdown = () => {
    if (isFilterOpen) {
      translateY.value = withSequence(
        withSpring(0, {
          damping: 20,
          stiffness: 300,
        }),
        withTiming(-10, {
          duration: 200,
          easing: Easing.bezier(0.4, 0.0, 1, 1),
        })
      );

      scale.value = withTiming(0.95, {
        duration: 250,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });

      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.4, 0.0, 1, 1),
      });

      height.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
    } else {
      // Animation mở
      height.value = withSpring(350, {
        damping: 18,
        stiffness: 120,
        mass: 0.7,
        velocity: 8,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });

      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });

      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
        mass: 0.6,
        velocity: 3,
      });

      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
        mass: 0.6,
        velocity: 3,
      });
    }

    setIsFilterOpen(!isFilterOpen);
  };

  const clearFilters = () => {
    setSelectedFilter({ district: null, service: null });
    console.log("Filters cleared");
  };

  const confirmFilters = () => {
    console.log("Filters confirmed:", selectedFilter);
  };

  const filters = {
    districts: ["Quận 1", "Quận 2", "Quận 3"],
    services: ["Dịch vụ 1", "Dịch vụ 2", "Dịch vụ 3"],
  };

  const handleFilterSelect = (type: keyof SelectedFilter, value: string) => {
    setSelectedFilter((prev) => {
      if (prev[type] === value) {
        return { ...prev, [type]: null };
      } else {
        return { ...prev, [type]: value };
      }
    });
    console.log(`${type} selected:`, value);
  };

  const handlePressCard = (id: string) => {
    router.push({
      pathname: "/detail-nurse/[id]",
      params: { id }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mt-4 flex-1">
        <Text className="text-xl font-pbold ml-4">Tìm kiếm điều dưỡng</Text>
        <View className="flex-row items-center m-4">
          <View className="flex-row items-center bg-gray-100/20 rounded-3xl border-2 border-black px-4 flex-1">
            <Ionicons name="search" size={20} color="#888" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-700"
              onChangeText={onChangeText}
              value={text}
              placeholder="Tìm kiếm y tá"
              placeholderTextColor="#888"
            />
          </View>
          <TouchableWithoutFeedback onPress={toggleFilterDropdown}>
            <View className="ml-2 p-3 border-2 border-[#64D1CB] rounded-full">
              <Ionicons name="filter" size={20} color="#64D1CB" />
            </View>
          </TouchableWithoutFeedback>
        </View>

        <Animated.View style={[animatedStyles]} className="border-b-2 pb-2">
          <View>
            <Text className="font-semibold text-gray-700 mb-2 ml-2">Quận</Text>
            <View className="flex-row flex-wrap ml-2">
              {filters.districts.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleFilterSelect("district", item)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border text-xs  ${
                    selectedFilter.district === item
                      ? "bg-[#64D1CB] border-[#64D1CB] text-white "
                      : "bg-white border-[#64D1CB] border-2"
                  }`}
                >
                  <Text
                    className={`text-xs font-psemibold ${
                      selectedFilter.district === item
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="font-semibold text-gray-700 mt-4 mb-2 ml-2">
              Dịch vụ
            </Text>
            <View className="flex-row flex-wrap ml-2">
              {filters.services.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleFilterSelect("service", item)}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border  ${
                    selectedFilter.service === item
                      ? "bg-[#64D1CB] text-white border-[#64D1CB]"
                      : "bg-white border-[#64D1CB] border-2"
                  }`}
                >
                  <Text
                    className={`text-xs font-psemibold ${
                      selectedFilter.service === item
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row justify-between mx-4 mt-4">
              <TouchableOpacity
                onPress={clearFilters}
                className="p-2 bg-white border-2 rounded-xl flex-1 mr-2"
              >
                <Text className="text-black text-center ml-2 font-pmedium text-xs">
                  Xóa filter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmFilters}
                className="p-2 bg-[#64D1CB] rounded-xl flex-1 ml-2"
              >
                <Text className="text-white text-center ml-2 font-psemibold text-xs">
                  Xác nhận
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        <View className="flex-1">
          <DoctorCard data={DATA} handlePress={handlePressCard} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SearchNurseScreen;
