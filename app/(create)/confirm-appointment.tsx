import HeaderBack from "@/components/HeaderBack";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

// Định nghĩa interface
interface Service {
  name: string;
  duration: number;
  cost: number;
  additionalCost: number;
  quantity: number;
  id: string;
  note: string;
}

interface PackageData {
  day: string;
  description: string;
  packageId: string;
  packageName: string;
  serviceId: string;
  services: Service[];
  totalDuration: number;
  totalPrice: number;
}

interface PatientData {
  address: string;
  city: string;
  "desc-pathology": string;
  district: string;
  dob: string;
  "full-name": string;
  id: string;
  "note-for-nurse": string;
  "phone-number": string;
  ward: string;
}

interface Appointment {
  day: number;
  date: string;
  formattedDate: string;
  startTime: string;
  endTime: string;
  duration: string;
}

interface NurseData {
  fullName: string;
  rating: number;
  reviews: number;
  avatar?: string;
}

const safeParse = (data: any, name: string) => {
  try {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    console.warn(`${name} không phải chuỗi, trả về nguyên bản:`, data);
    return data || null;
  } catch (error) {
    console.error(`Lỗi parse ${name}:`, error);
    return null;
  }
};

const ConfirmScreen = () => {
  const { packageInfo, patient, listDate, nurseData } = useLocalSearchParams();
  console.log("🚀 ~ ConfirmScreen ~ nurseData:", nurseData);
  const packageData: PackageData | null = safeParse(packageInfo, "packageInfo");
  const patientData: PatientData | null = safeParse(patient, "patient");
  const listDateData: Appointment[] | null = safeParse(listDate, "listDate");
  const parsedNurseData: NurseData | null = safeParse(nurseData, "nurseData");

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const calculateTotal = () => {
    return (
      packageData?.services.reduce(
        (total: number, service: Service) =>
          total + service.cost * service.quantity,
        0
      ) || 0
    );
  };

  const countServices = () => {
    return packageData?.services.length || 0;
  };

  const convertDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours > 0 ? `${hours} tiếng` : ""} ${
      minutes > 0 ? `${minutes} phút` : ""
    }`.trim();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const isSuccess = Math.random() > 0.5;
      setIsSuccess(isSuccess);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Submit error:", error);
      setIsSuccess(false);
      setIsModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    setIsModalVisible(false);
    router.push("/(tabs)/home");
  };

  const totalPrice = packageData?.totalPrice || calculateTotal();
  const totalServices = countServices();
  const totalDuration = packageData?.totalDuration || 0;
  const formattedDuration = convertDuration(totalDuration);

  if (!packageData || !patientData) {
    return (
      <View className="flex-1 bg-white mt-4">
        <Text className="text-center text-lg">
          Không có dữ liệu gói hoặc bệnh nhân
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="p-4 mt-4"
      >
        <View className="flex-row items-center mb-2">
          <HeaderBack />
          <Text className="text-2xl font-pbold mb-2 my-4 ml-4">Xác nhận</Text>
        </View>
        <Text className="text-lg font-pbold mb-2">Khách hàng</Text>

        <View className="flex-row items-center mb-4 justify-center ml-4 mr-4 border rounded-2xl p-4 border-t-2 border-b-2">
          <Image
            source={{
              uri: "https://cdn3.iconfinder.com/data/icons/avatar-93/140/female__avatar__lady__women__caretaker-512.png",
            }}
            className="w-20 h-20 rounded-lg mr-4"
          />
          <View className="flex-1">
            <Text className="text-lg font-pbold mb-1">
              {patientData["full-name"]}
            </Text>
            <Text className="text-sm text-gray-500 mb-1 font-pmedium">
              {patientData["phone-number"]}
            </Text>
            <Text className="text-sm text-gray-500 font-pmedium">
              {`${patientData.address}, ${patientData.ward}, ${patientData.district}, ${patientData.city}`}
            </Text>
          </View>
        </View>

        <View className="mb-2">
          <Text className="text-lg font-pbold mb-2">Thông tin ngày giờ</Text>
          {listDateData && listDateData.length > 0 ? (
            listDateData.length > 3 ? (
              <View className="border border-gray-300 rounded-lg bg-white p-4 shadow-sm">
                <ScrollView
                  style={{ maxHeight: 160 }}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {listDateData.map((appointment, index) => (
                    <View
                      key={index}
                      className="mb-4 pb-2 border-b border-gray-200 last:border-b-0"
                    >
                      <View className="flex-row items-center mb-1">
                        <MaterialIcons
                          name="calendar-today"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-base font-pmedium text-gray-700">
                          {`Ngày ${appointment.day}: ${appointment.formattedDate}`}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="access-time"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-sm font-pmedium text-gray-600">
                          {`${appointment.startTime} - ${appointment.endTime}`}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <Text className="text-sm font-pmedium text-gray-400 mt-2 text-center">
                  Cuộn để xem thêm
                </Text>
              </View>
            ) : (
              listDateData.map((appointment, index) => (
                <View
                  key={index}
                  className="mb-4 pb-2 border-b border-gray-200 last:border-b-0"
                >
                  <View className="flex-row items-center mb-1">
                    <MaterialIcons
                      name="calendar-today"
                      size={16}
                      color="#6b7280"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-base font-pmedium text-gray-700">
                      {`Ngày ${appointment.day}: ${appointment.formattedDate}`}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="access-time"
                      size={16}
                      color="#6b7280"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-sm font-pmedium text-gray-600">
                      {`${appointment.startTime} - ${appointment.endTime}`}
                    </Text>
                  </View>
                </View>
              ))
            )
          ) : (
            <Text className="text-base font-pmedium text-gray-400">
              Chưa có thông tin ngày giờ
            </Text>
          )}
        </View>

        {parsedNurseData && (
          <View className="mb-6">
            <Text className="text-lg font-pbold mb-2">Điều dưỡng đã chọn</Text>
            <View className="flex-row items-center p-4">
              <Image
                source={{
                  uri:
                    parsedNurseData.avatar ||
                    "https://images.careerviet.vn/content/images/dieu-duong-vien-lam-cong-viec-gi-nhung-ky-nang-can-trang-bi-careerbuilder.png",
                }}
                className="w-16 h-16 rounded-lg mr-4"
              />
              <View>
                <Text className="text-lg font-pbold">
                  {parsedNurseData.fullName || "Nguyễn Thị B"}
                </Text>
                <Text className="text-sm text-gray-500 font-pmedium mt-2">
                  {parsedNurseData.rating
                    ? `${parsedNurseData.rating} ★★★★★ (${
                        parsedNurseData.reviews || 0
                      })`
                    : "4,8 ★★★★★ (120)"}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text className="text-lg font-pbold mb-2">Gói dịch vụ</Text>
        {packageData.services.map((service: Service, index: number) => (
          <View key={index} className="p-4">
            <View className="mb-4 pb-4 border-b border-gray-200">
              <View className="gap-2">
                <Text className="text-base font-pbold">{service.name}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-base text-gray-500 font-psemibold">
                    {convertDuration(service.duration)}
                  </Text>
                  <Text className="text-base text-gray-500 font-psemibold">
                    -
                  </Text>
                  <Text className="text-base font-pbold">
                    {(service.cost * service.quantity).toLocaleString()} VND
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 font-psemibold">
                  Ghi chú: {service.note}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View className="pb-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-pbold">Tổng tiền</Text>
            <Text className="text-base font-pbold">
              {totalPrice.toLocaleString()} VND
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-pbold">Tổng thời gian:</Text>
            <Text className="text-base font-pbold">
              {packageData.totalDuration} phút
            </Text>
          </View>
        </View>

        {/* Phương thức thanh toán */}
        <View className="mb-6">
          <Text className="text-lg font-pbold mb-2">
            Phương thức thanh toán
          </Text>
          <View className="flex-row items-center">
            <MaterialIcons
              name="account-balance-wallet"
              size={20}
              color="#6b7280"
              className="mr-5 bg-white border border-gray-300 rounded-xl p-3 px-6"
            />
            <Text className="text-base font-pmedium text-gray-400">
              Thanh toán qua ví
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-300">
        <View className="flex-row justify-between items-center w-full">
          <View>
            <Text className="text-lg font-pbold text-gray-800">
              {totalPrice.toLocaleString()} VND
            </Text>
            <Text className="text-sm text-gray-500 font-pmedium">
              {totalServices} dịch vụ • {formattedDuration}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#64CbDB] py-3 px-6 rounded-lg"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-pbold">Xác nhận</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-96">
            <Image
              source={{
                uri: isSuccess
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbY8UK-BaW-W8oLqpI_Hd2kBMdjW6Q3CKBg&s"
                  : "https://cdn-icons-png.flaticon.com/512/6659/6659895.png",
              }}
              className="w-32 h-32 mx-auto mb-4 bg-white"
            />
            <Text className="text-xl font-pbold text-center mb-4">
              {isSuccess ? "Thành công!" : "Thất bại!"}
            </Text>
            <Text className="text-base text-gray-500 text-center mb-6">
              {isSuccess
                ? "Dịch vụ đã được xác nhận thành công."
                : "Đã có lỗi xảy ra khi xác nhận dịch vụ."}
            </Text>
            <TouchableOpacity
              className="bg-[#64CbDB] py-3 px-6 rounded-lg"
              onPress={handleGoHome}
            >
              <Text className="text-white font-pbold text-center">
                Về trang chủ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmScreen;
