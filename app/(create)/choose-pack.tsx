import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBack from "@/components/HeaderBack";
import ImageUrl from "@/data/ImageUrl";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Service = {
  id: number;
  name: string;
  price: number;
  type: "basic" | "premium" | "urgent";
  duration: number;
};

type ServiceCategory = {
  name: string;
  services: Service[];
  is_combo: boolean;
};

const serviceCategories: ServiceCategory[] = [
  {
    name: "Chăm sóc sức khỏe tại nhà",
    services: [
      {
        id: 1,
        name: "Chăm sóc bệnh nhân tại nhà",
        price: 200000,
        type: "basic",
        duration: 60,
      },
      {
        id: 2,
        name: "Chăm sóc sau phẫu thuật",
        price: 250000,
        type: "premium",
        duration: 90,
      },
      {
        id: 3,
        name: "Chăm sóc người cao tuổi",
        price: 180000,
        type: "basic",
        duration: 120,
      },
    ],
    is_combo: false,
  },
  {
    name: "Chăm sóc phục hồi chức năng",
    services: [
      {
        id: 4,
        name: "Phục hồi chức năng sau phẫu thuật",
        price: 300000,
        type: "premium",
        duration: 60,
      },
      {
        id: 5,
        name: "Vật lý trị liệu",
        price: 220000,
        type: "premium",
        duration: 45,
      },
      {
        id: 6,
        name: "Hướng dẫn tập phục hồi",
        price: 180000,
        type: "basic",
        duration: 30,
      },
    ],
    is_combo: false,
  },
  {
    name: "Gói combo chăm sóc sức khỏe định kỳ",
    services: [
      {
        id: 7,
        name: "Kiểm tra sức khỏe định kỳ",
        price: 150000,
        type: "basic",
        duration: 30,
      },
      {
        id: 8,
        name: "Tư vấn dinh dưỡng",
        price: 200000,
        type: "premium",
        duration: 45,
      },
      {
        id: 11,
        name: "Theo dõi sức khỏe qua điện thoại",
        price: 100000,
        type: "basic",
        duration: 20,
      },
    ],
    is_combo: true,
  },
  {
    name: "Gói combo phục hồi chuyên sâu",
    services: [
      {
        id: 9,
        name: "Vật lý trị liệu chuyên sâu",
        price: 350000,
        type: "premium",
        duration: 60,
      },
      {
        id: 10,
        name: "Tập luyện và phục hồi",
        price: 300000,
        type: "basic",
        duration: 60,
      },
      {
        id: 12,
        name: "Tư vấn phục hồi chuyên sâu",
        price: 250000,
        type: "premium",
        duration: 45,
      },
    ],
    is_combo: true,
  },
];

const ServiceCategoryCard = ({
  category,
  isExpanded,
  onToggle,
  onChoose,
}: {
  category: ServiceCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onChoose: (category: ServiceCategory) => void;
}) => {
  const totalDuration = category.services.reduce(
    (sum, service) => sum + service.duration,
    0
  );
  const totalPrice = category.services.reduce(
    (sum, service) => sum + service.price,
    0
  );

  return (
    <View key={category.name} className="mb-2">
      {/* Toggle Button */}
      <TouchableOpacity
        onPress={onToggle}
        className="p-6 py-4 mb-2 border-b-2 border-gray-300 bg-white rounded-2xl"
      >
        <View className="flex flex-row justify-between items-center">
          <Text 
            className="font-pmedium text-gray-700 flex-1" 
            numberOfLines={2} // Giới hạn 2 dòng, nếu dài thì sẽ cắt bớt
            ellipsizeMode="tail"
          >
            {category.name}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </View>
      </TouchableOpacity>

      {/* Nội dung mở rộng */}
      {isExpanded && (
        <View className="rounded-lg p-4 bg-gray-50">
          {category.services.map((service) => (
            <View key={service.id} className="py-2 border-b border-gray-300">
              <View className="flex flex-row justify-between items-center">
                {/* Thông tin dịch vụ */}
                <View className="flex-1 mr-2">
                  <Text 
                    className="font-medium text-gray-600 flex-wrap"
                    numberOfLines={2} // Giới hạn 2 dòng cho nội dung dài
                    ellipsizeMode="tail"
                  >
                    {service.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Thời gian: {service.duration} phút
                  </Text>
                </View>

                {/* Giá dịch vụ */}
                <Text className="font-medium text-gray-600 whitespace-nowrap">
                  {service.price.toLocaleString()} VND
                </Text>
              </View>
            </View>
          ))}

          {/* Tổng kết */}
          <View className="flex flex-col items-end mt-4 gap-4">
            <Text className="text-sm text-gray-500">
              Tổng thời gian: {totalDuration} phút
            </Text>
            <Text className="font-medium text-gray-600">
              Tổng: {totalPrice.toLocaleString()} VND
            </Text>
            <TouchableOpacity
              onPress={() => onChoose(category)}
              className="bg-[#64D1CB] px-4 py-2 rounded-full"
            >
              <Text className="text-white font-medium">Chọn dịch vụ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};


const ChoosingPackScreen = () => {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);

  const selectedServicesDetails = useMemo(() => {
    const allServices = serviceCategories.flatMap((cat) => cat.services);
    return selectedServices
      .map((serviceId) => allServices.find((s) => s.id === serviceId))
      .filter(Boolean) as Service[];
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServicesDetails.reduce(
      (sum, service) => sum + service.price,
      0
    );
  }, [selectedServicesDetails]);

  const totalDuration = useMemo(() => {
    return selectedServicesDetails.reduce(
      (total, service) => total + service.duration,
      0
    );
  }, [selectedServicesDetails]);

  const handleCategoryToggle = useCallback((categoryName: string) => {
    setExpandedCategory((prev) =>
      prev === categoryName ? null : categoryName
    );
  }, []);

  const handleChooseCategory = useCallback((category: ServiceCategory) => {
    setSelectedServices(category.services.map((service) => service.id));
    setSelectedCategoryName(category.name);
    router.push({
      pathname: "/(create)/detail-pack",
      params: { id: "123", type: String(category.is_combo) },
    });
  }, []);

  const renderCategorySection = (title: string, isCombo: boolean) => {
    const filteredCategories = serviceCategories.filter(
      (category) => category.is_combo === isCombo
    );
    return (
      <View className="mx-4 my-4">
        <Text className="text-xl font-pbold mb-4">{title}</Text>
        {filteredCategories.map((category) => (
          <ServiceCategoryCard
            key={category.name}
            category={category}
            isExpanded={expandedCategory === category.name}
            onToggle={() => handleCategoryToggle(category.name)}
            onChoose={handleChooseCategory}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={{ uri: ImageUrl.imageCreate }}
          className="flex-1"
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 120 }}
            className="p-4"
          >
            <HeaderBack />
            {renderCategorySection("Gói combo 1 lần", false)}
            {renderCategorySection("Gói combo nhiều lần", true)}
          </ScrollView>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChoosingPackScreen;
