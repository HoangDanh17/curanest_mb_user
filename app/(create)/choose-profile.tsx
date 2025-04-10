import patientApiRequest from "@/app/api/patientApi";
import { useSearch } from "@/app/provider";
import HeaderBack from "@/components/HeaderBack";
import ImageUrl from "@/data/ImageUrl";
import { Patient } from "@/types/patient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

const ChooseProfilePatientScreen = () => {
  const { setIsSearch } = useSearch();
  const { id, nurseInfo } = useLocalSearchParams();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const router = useRouter();

  async function fetchPatientList() {
    try {
      const response = await patientApiRequest.getAllPatient();
      setPatientList(response.payload.data);
    } catch (error) {
      console.error("Error fetching patient list:", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchPatientList();
    }, [])
  );

  const handleClick = (item: Patient) => {
    router.push({
      pathname: "/(create)/choose-pack",
      params: {
        id: String(id),
        nurseInfo: nurseInfo,
        patient: JSON.stringify(item),
      },
    });
    setIsSearch(true);
  };

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    shadowOpacity: scale.value === 1 ? 0.2 : 0.1,
    shadowRadius: scale.value === 1 ? 6 : 3,
  }));

  const renderItem = ({ item }: { item: Patient }) => (
    <TouchableWithoutFeedback
      onPress={() => handleClick(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[animatedStyle]} className="mb-4 shadow-lg">
        <LinearGradient
          colors={["#ffffff", "#f9fafb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-6 border border-gray-200"
        >
          <View className="flex flex-col gap-2">
            <Text className="text-xl font-bold text-gray-900">
              {item["full-name"]}
            </Text>

            {/* Ngày sinh */}
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#888" />
              <Text className="text-sm text-gray-600 ml-2">
                <Text className="font-semibold">Ngày sinh:</Text>{" "}
                {new Date(item.dob).toLocaleDateString("vi-VN")}
              </Text>
            </View>

            {/* Số điện thoại */}
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={16} color="#888" />
              <Text className="text-sm text-gray-600 ml-2">
                <Text className="font-semibold">SĐT:</Text>{" "}
                {item["phone-number"]}
              </Text>
            </View>

            {/* Địa chỉ */}
            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={16} color="#888" />
              <Text className="text-sm text-gray-500 ml-2 leading-5">
                <Text className="font-semibold">Địa chỉ:</Text>{" "}
                {item["address"]}, {item["ward"]}, {item["district"]},{" "}
                {item["city"]}
              </Text>
            </View>
          </View>

          {/* Mũi tên điều hướng */}
          <View className="absolute top-5 right-5 mt-2">
            <Ionicons name="chevron-forward" size={24} color="#212626" />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView className="bg-white flex-1">
      <View className="mt-4 ml-2">
        <HeaderBack />
      </View>

      <FlatList
        data={patientList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: 10,
        }}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-400 mt-8">
            Không có bệnh nhân nào
          </Text>
        )}
      />
    </SafeAreaView>
  );
};

export default ChooseProfilePatientScreen;
