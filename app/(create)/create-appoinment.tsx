import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBack from "@/components/HeaderBack";
import ImageUrl from "@/data/ImageUrl";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
};

const WORKING_HOURS = {
  start: 8,
  end: 20,
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
  },
];

const CreateAppointmentScreen = () => {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("08:00");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [serviceToAdd, setServiceToAdd] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const selectedServicesDetails = useMemo(() => {
    return selectedServices
      .map((serviceId) =>
        serviceCategories
          .flatMap((cat) => cat.services)
          .find((s) => s.id === serviceId)
      )
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

  const generateEndTime = useMemo(() => {
    if (!selectedTime || totalDuration === 0) return "";

    const [startHour, startMinute] = selectedTime.split(":").map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + totalDuration;

    const endHour = Math.floor(endTimeInMinutes / 60);
    const endMinute = endTimeInMinutes % 60;

    return `${endHour}:${endMinute < 10 ? "0" + endMinute : endMinute}`;
  }, [selectedTime, totalDuration]);

  const toggleService = (serviceId: number, categoryName: string) => {
    if (selectedCategoryName && selectedCategoryName !== categoryName) {
      setServiceToAdd(serviceId);
      setShowConfirmModal(true);
    } else {
      setSelectedServices((prev) =>
        prev.includes(serviceId)
          ? prev.filter((id) => id !== serviceId)
          : [...prev, serviceId]
      );
      setSelectedCategoryName(categoryName);
    }
  };

  const handleConfirm = () => {
    if (serviceToAdd !== null) {
      const newCategory = serviceCategories.find((cat) =>
        cat.services.some((s) => s.id === serviceToAdd)
      );
      if (newCategory) {
        setSelectedServices([serviceToAdd]);
        setSelectedCategoryName(newCategory.name);
      }
      setServiceToAdd(null);
    }
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setServiceToAdd(null);
    setShowConfirmModal(false);
  };

  const handleCategoryToggle = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = WORKING_HOURS.start; hour <= WORKING_HOURS.end; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour}:${minute < 10 ? "0" + minute : minute}`;
        options.push(time);
      }
    }
    return options;
  }, []);

  return (
    <SafeAreaView className="bg-white flex-1">
      <GestureHandlerRootView className="flex-1">
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
            <View className="mx-4 my-4 bg-white rounded-xl shadow-lg overflow-hidden">
              <ImageBackground
                source={{
                  uri: "https://img.freepik.com/free-vector/abstract-medical-wallpaper-template-design_53876-61802.jpg",
                }}
                className="h-32 rounded-t-xl"
                resizeMode="cover"
              >
                <View className="absolute -bottom-12 left-4 z-10">
                  <Image
                    source={{
                      uri: "https://png.pngtree.com/thumb_back/fh260/background/20230512/pngtree-cute-vietnam-woman-smiling-with-an-orange-hat-image_2506167.jpg",
                    }}
                    className="w-32 h-32 rounded-full border-4 border-white"
                  />
                </View>
              </ImageBackground>
              <View className="pt-16 px-4 pb-4 bg-[#FEF0D7]/30">
                <Text className="text-xl font-bold">Nguyễn Văn A</Text>
                <View className="mt-2 space-y-1">
                  <Text className="text-gray-600">Tuổi: 58</Text>
                  <Text className="text-gray-600">
                    Địa chỉ: 123 xã lộ, hà nội, TPHCM
                  </Text>
                </View>
              </View>
            </View>

            <View className="mx-4 my-4">
              <Text className="text-xl font-pbold mb-4">Các loại dịch vụ</Text>
              {serviceCategories.map((category) => (
                <View key={category.name} className="mb-2">
                  <TouchableOpacity
                    onPress={() => handleCategoryToggle(category.name)}
                    className="py-2 px-4 rounded-lg mb-2 border-b-2 border-gray-500/20"
                  >
                    <View className="flex flex-row justify-between items-center">
                      <Text className="font-medium text-gray-500">
                        {category.name}
                      </Text>
                      <Ionicons
                        name={
                          expandedCategory === category.name
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color="#6B728033"
                      />
                    </View>
                  </TouchableOpacity>

                  {expandedCategory === category.name && (
                    <View className="rounded-lg p-4">
                      <View className="flex-row flex-wrap gap-2">
                        {category.services.map((service) => (
                          <TouchableOpacity
                            key={service.id}
                            onPress={() => toggleService(service.id, category.name)}
                            className={`py-2 px-4 rounded-full border ${
                              selectedServices.includes(service.id)
                                ? "bg-[#e5ab47] border-transparent"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <Text
                              className={`${
                                selectedServices.includes(service.id)
                                  ? "text-white"
                                  : "text-gray-600"
                              } font-medium`}
                            >
                              {service.name} ({service.duration} phút)
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          {selectedServices.length > 0 && (
            <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-300">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-rose-500">
                  Tổng: {totalPrice.toLocaleString()} VND
                </Text>
                <TouchableOpacity
                  className="bg-[#64D1CB] px-6 py-3 rounded-full"
                  onPress={() => router.push("/(create)/select-type-and-time")}
                >
                  <Text className="text-white font-bold text-lg">Tiếp tục</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Modal
            visible={showConfirmModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowConfirmModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-6 rounded-lg w-96">
                <Text className="text-lg font-bold mb-4">Xác nhận</Text>
                <Text className="mb-6">
                  Bạn đã chọn một dịch vụ khác. Bạn có muốn xóa lựa chọn hiện tại và chọn dịch vụ mới không?
                </Text>
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg mr-2"
                  >
                    <Text className="text-gray-600">Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    className="px-4 py-2 bg-[#64D1CB] rounded-lg"
                  >
                    <Text className="text-white">Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default CreateAppointmentScreen;