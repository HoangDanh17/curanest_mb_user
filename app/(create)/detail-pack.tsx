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
import { useLocalSearchParams, router } from "expo-router";
import HeaderBack from "@/components/HeaderBack";
import ImageUrl from "@/data/ImageUrl";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // Thời gian (phút) cho unit = 1
  datetime: string;
  unit: number;
  price: number; // Giá cho unit = 1
  is_must_have: boolean;
}

interface ServiceItemProps {
  service: Service;
  index: number;
  onDelete: (id: string) => void;
  onUnitChange: (id: string, newUnit: number) => void;
  note: string;
  onNoteChange: (id: string, text: string) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  onDelete,
  onUnitChange,
  note,
  onNoteChange,
}) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
  }, [animation, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    transform: [{ translateY: (1 - animation.value) * 20 }],
  }));

  // Xác nhận trước khi xóa dịch vụ
  const confirmDelete = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa dịch vụ này không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => onDelete(service.id) },
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

      {/* Thay đổi số lượng */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row justify-end items-center mt-3 space-x-2">
          <TouchableOpacity
            onPress={() => onUnitChange(service.id, Math.max(1, service.unit - 1))}
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

      <TextInput
        placeholder="Nhập lưu ý cho task này"
        value={note}
        onChangeText={(text) => onNoteChange(service.id, text)}
        multiline
        numberOfLines={2}
        className="border rounded-lg p-2 mt-2 h-24 font-psemibold text-gray-400"
        style={{ textAlignVertical: "top", textAlign: "left" }}
      />
    </Animated.View>
  );
};

const DetailPackScreen: React.FC = () => {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "Chăm sóc bệnh nhân", description: "Dịch vụ chăm sóc bệnh nhân tại nhà với đội ngũ y tá chuyên nghiệp.", duration: 10, datetime: "2023-03-15 14:00", unit: 1, price: 100000, is_must_have: false },
    { id: "2", name: "Phục hồi chức năng", description: "Hỗ trợ phục hồi chức năng sau phẫu thuật, đảm bảo an toàn và hiệu quả.", duration: 20, datetime: "2023-03-15 15:00", unit: 2, price: 200000, is_must_have: true },
    { id: "3", name: "Tư vấn sức khỏe", description: "Tư vấn chuyên sâu về sức khỏe và dinh dưỡng.", duration: 30, datetime: "2023-03-15 16:00", unit: 3, price: 300000, is_must_have: false },
  ]);

  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const handleUnitChange = (id: string, newUnit: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, unit: newUnit } : s))
    );
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[id];
      return newNotes;
    });
  };

  const handleNoteChange = (id: string, text: string) => {
    setNotes((prev) => ({ ...prev, [id]: text }));
  };

  const handleSubmit = () => {
    router.push({
      pathname: "/(create)/time-appointment",
      params: { id: "123", type },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ImageBackground source={{ uri: ImageUrl.imageCreate }} className="flex-1" resizeMode="cover">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <HeaderBack />
          <Text className="text-2xl font-pbold text-gray-800 my-5">Chi tiết gói (ID: {id})</Text>
          {services.map((s, i) => (
            <ServiceItem key={s.id} service={s} index={i} onDelete={handleDelete} onUnitChange={handleUnitChange} note={notes[s.id] || ""} onNoteChange={handleNoteChange} />
          ))}
          <TouchableOpacity onPress={handleSubmit} className="bg-[#64D1CB] px-6 py-3 rounded-lg items-center">
            <Text className="text-white text-base font-pbold">Tiếp theo</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default DetailPackScreen;
