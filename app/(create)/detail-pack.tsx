import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import HeaderBack from "@/components/HeaderBack";
import ImageUrl from "@/data/ImageUrl";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // Base thời gian (phút) cho unit = 1
  datetime: string;
  unit: number;
  price: number; // Base giá cho unit = 1
  is_must_have: boolean;
}

interface ServiceItemProps {
  service: Service;
  index: number;
  onDelete: (id: string) => void;
  onUnitChange: (id: string, newUnit: number) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  onDelete,
  onUnitChange,
}) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
  }, [animation, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    transform: [{ translateY: (1 - animation.value) * 20 }],
  }));

  // Hàm xác nhận trước khi xóa dịch vụ
  const confirmDelete = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa dịch vụ này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => onDelete(service.id),
      },
    ]);
  };

  return (
    <Animated.View
      style={animatedStyle}
      className="p-4 bg-white rounded-lg mb-3 shadow"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-pbold text-gray-800 flex-1">
          {service.name}
        </Text>
        {!service.is_must_have && (
          <TouchableOpacity
            onPress={confirmDelete}
            className="bg-red-500 rounded-2xl px-6 py-2"
          >
            <Text className="text-sm text-white font-pbold">Xóa</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-sm text-gray-600 mt-1 font-pmedium">
        {service.description}
      </Text>
      <Text className="text-sm text-gray-500 mt-1 font-pmedium">
        Thời gian: {service.datetime}
      </Text>
      <View className="flex-row justify-between items-center">
        <View className="flex-row justify-end items-center mt-3 space-x-2">
          <TouchableOpacity
            onPress={() =>
              onUnitChange(service.id, Math.max(1, service.unit - 1))
            }
            className="px-4 bg-gray-200 rounded"
          >
            <Text className="text-lg">-</Text>
          </TouchableOpacity>
          <Text className="text-lg font-psemibold text-gray-800 mx-2">
            {service.unit}
          </Text>
          <TouchableOpacity
            onPress={() => onUnitChange(service.id, service.unit + 1)}
            className="px-4 bg-gray-200 rounded"
          >
            <Text className="text-lg">+</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3 flex-row justify-end">
          <View className="flex flex-col items-end">
            <Text className="text-gray-600 font-pmedium">
              {service.unit} lần
            </Text>

            <Text className="text-gray-600 font-pmedium">
              {service.duration * service.unit} phút
            </Text>
            <Text className="text-gray-700 font-pmedium">
              Giá: {(service.price * service.unit).toLocaleString()} VND
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const dummyServices: Service[] = [
  {
    id: "1",
    name: "Chăm sóc bệnh nhân",
    description:
      "Dịch vụ chăm sóc bệnh nhân tại nhà với đội ngũ y tá chuyên nghiệp.",
    duration: 10,
    datetime: "2023-03-15 14:00",
    unit: 1,
    price: 100000,
    is_must_have: false,
  },
  {
    id: "2",
    name: "Phục hồi chức năng",
    description:
      "Hỗ trợ phục hồi chức năng sau phẫu thuật, đảm bảo an toàn và hiệu quả.",
    duration: 20,
    datetime: "2023-03-15 15:00",
    unit: 2,
    price: 200000,
    is_must_have: true,
  },
  {
    id: "3",
    name: "Tư vấn sức khỏe",
    description: "Tư vấn chuyên sâu về sức khỏe và dinh dưỡng.",
    duration: 30,
    datetime: "2023-03-15 16:00",
    unit: 3,
    price: 300000,
    is_must_have: false,
  },
];

const DetailPackScreen: React.FC = () => {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [services, setServices] = useState<Service[]>(dummyServices);
  const [note, setNote] = useState<string>("");

  const handleUnitChange = (id: string, newUnit: number) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === id ? { ...service, unit: newUnit } : service
      )
    );
  };

  const handleDelete = (id: string) => {
    setServices((prevServices) =>
      prevServices.filter((service) => service.id !== id)
    );
  };

  const totalDuration = services.reduce(
    (total, service) => total + service.duration * service.unit,
    0
  );
  const totalPrice = services.reduce(
    (total, service) => total + service.price * service.unit,
    0
  );

  const handleSubmit = () => {
    router.push({
      pathname: "/(create)/time-appointment",
      params: { id: "123", type: type },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ImageBackground
        source={{ uri: ImageUrl.imageCreate }}
        className="flex-1"
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
          <HeaderBack />
          <Text className="text-2xl font-pbold text-gray-800 my-5">
            Chi tiết gói (ID: {id})
          </Text>
          {services.map((service, index) => (
            <ServiceItem
              key={service.id}
              service={service}
              index={index}
              onDelete={handleDelete}
              onUnitChange={handleUnitChange}
            />
          ))}
          <View className="mt-6">
            <Text className="text-2xl text-gray-800 mb-2 font-pbold">
              Lưu ý:
            </Text>
            <TextInput
              placeholder="Nhập lưu ý"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              className="border rounded-xl h-32 p-2 font-psemibold"
              style={{ textAlignVertical: "top", textAlign: "left" }}
            />
          </View>
          <View className="mb-3 p-4 flex-col items-end gap-4">
            <View className="gap-2">
              <Text className="text-base text-gray-800 font-pbold">
                Tổng thời gian: {totalDuration} phút
              </Text>
              <Text className="text-base text-gray-800 font-pbold">
                Tổng giá tiền: {totalPrice.toLocaleString()} VND
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-[#64D1CB] px-6 py-3 rounded-lg"
            >
              <Text className="text-white text-base font-pbold">Tiếp theo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default DetailPackScreen;
