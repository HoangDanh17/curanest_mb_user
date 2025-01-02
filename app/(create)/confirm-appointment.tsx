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
  Modal, // Thêm Modal từ React Native
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Sử dụng useRouter từ expo-router

const dummyData = {
  header: "Xem lại và xác nhận",
  patientName: "Nguyễn Văn A", // Tên bệnh nhân
  patientRating: "4,9 ★★★★★ (548)", // Đánh giá bệnh nhân
  patientAddress: "165 Dinh Tiên Hoang, Da Kao ...", // Địa chỉ bệnh nhân
  patientAvatar:
    "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474053OSH/anh-cute-nguoi-that-dep-nhat_022606213.jpg", // Avatar bệnh nhân
  date: "Thứ Năm 2 Tháng 1",
  time: "12:30-13:30 (thời lượng 1 giờ)",
  services: [
    { name: "Lash Lift & Tint", duration: 60, price: 400000 }, // Thời lượng tính bằng phút
    { name: "Uốn mi", duration: 60, price: 300000 },
    { name: "Nhuộm mi", duration: 30, price: 200000 },
  ],
  paymentLocation: "Thanh toán tại địa điểm: 900.000 đ",
  paymentMethod: "Phương thức thanh toán",
  serviceDetail: "3 dịch vụ • 2 giờ, 30 phút",
};

const ConfirmScreen = () => {
  const router = useRouter(); // Sử dụng useRouter để chuyển hướng
  const [isLoading, setIsLoading] = useState(false); // State để quản lý loading
  const [isModalVisible, setIsModalVisible] = useState(false); // State để quản lý hiển thị modal
  const [isSuccess, setIsSuccess] = useState(false); // State để quản lý trạng thái thành công hay thất bại

  // Hàm tính tổng số tiền
  const calculateTotal = () => {
    return dummyData.services.reduce(
      (total, service) => total + service.price,
      0
    );
  };

  const countServices = () => {
    return dummyData.services.length;
  };

  const convertDuration = (duration: any) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours > 0 ? `${hours} tiếng` : ""} ${
      minutes > 0 ? `${minutes} phút` : ""
    }`.trim();
  };

  // Hàm submit
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const isSuccess = Math.random() > 0.5; // 50% thành công, 50% thất bại
      setIsSuccess(isSuccess);
      setIsModalVisible(true); // Hiển thị modal
    } catch (error) {
      console.error("Submit error:", error);
      setIsSuccess(false); // Thất bại
      setIsModalVisible(true); // Hiển thị modal
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý khi người dùng nhấn nút "Về trang chủ"
  const handleGoHome = () => {
    setIsModalVisible(false); // Đóng modal
    router.push("/(tabs)/home"); // Chuyển hướng về trang chủ
  };

  // Tính toán các giá trị
  const totalPrice = calculateTotal();
  const totalServices = countServices();
  const totalDuration = dummyData.services.reduce(
    (total, service) => total + service.duration,
    0
  );
  const formattedDuration = convertDuration(totalDuration);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="p-4"
      >
        <HeaderBack />
        <Text className="text-xl font-pbold mb-4 my-4">{dummyData.header}</Text>

        <View className="flex-row items-center mb-6">
          <Image
            source={{ uri: dummyData.patientAvatar }}
            className="w-20 h-20 rounded-lg mr-4"
          />
          <View>
            <Text className="text-lg font-pbold">{dummyData.patientName}</Text>
            <Text className="text-sm text-gray-500 mb-1 font-pmedium">
              {dummyData.patientRating}
            </Text>
            <Text
              className="text-sm text-gray-500 font-pmedium"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {dummyData.patientAddress}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <MaterialIcons
              name="calendar-today"
              size={16}
              color="#6b7280"
              style={{ marginRight: 8, alignSelf: "center" }}
            />
            <Text
              className="text-base font-pmedium text-gray-400 mt-1"
              style={{ lineHeight: 16 }}
            >
              {dummyData.date}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons
              name="access-time"
              size={16}
              color="#6b7280"
              style={{ marginRight: 8, alignSelf: "center" }}
            />
            <Text
              className="text-sm font-pmedium text-gray-400 mt-1"
              style={{ lineHeight: 16 }}
            >
              {dummyData.time}
            </Text>
          </View>
        </View>

        <View className="mb-6 ">
          <Text className="text-lg font-pbold mb-2">Điều dưỡng đã chọn</Text>

          <View className="flex-row items-center  p-4">
            <Image
              source={{
                uri: "https://images.careerviet.vn/content/images/dieu-duong-vien-lam-cong-viec-gi-nhung-ky-nang-can-trang-bi-careerbuilder.png",
              }}
              className="w-16 h-16 rounded-lg mr-4"
            />
            <View>
              <Text className="text-lg font-pbold">Nguyễn Thị B</Text>
              <Text className="text-sm text-gray-500 font-pmedium mt-2">
                4,8 ★★★★★ (120)
              </Text>
            </View>
          </View>
        </View>

        {dummyData.services.map((service, index) => (
          <View key={index}>
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <View>
                <Text className="text-base font-pbold">{service.name}</Text>
                <Text className="text-sm text-gray-500 font-psemibold">
                  {convertDuration(service.duration)}
                </Text>
              </View>
              <Text className="text-base font-pbold">
                {service.price.toLocaleString()} đ
              </Text>
            </View>
          </View>
        ))}

        <View className="pb-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-pbold">Tổng tiền</Text>
            <Text className="text-base font-pbold">
              {totalPrice.toLocaleString()} đ
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-pbold mb-2">
            {dummyData.paymentMethod}
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

        <View className="mb-6">
          <Text className="text-lg font-pbold mb-2">Ghi chú</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 h-24 text-sm font-psemibold text-gray-500"
            multiline
            placeholder="Nhập ghi chú của bạn..."
            style={{ textAlignVertical: "top", textAlign: "left" }}
          />
        </View>
      </ScrollView>

      {/* Phần cố định ở cuối trang */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-300">
        <View className="flex-row justify-between items-center w-full">
          <View>
            <Text className="text-lg font-pbold text-gray-800">
              {totalPrice.toLocaleString()} đ
            </Text>
            <Text className="text-sm text-gray-500 font-pmedium">
              {totalServices} dịch vụ • {formattedDuration}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#64CbDB] py-3 px-6 rounded-lg"
            onPress={handleSubmit}
            disabled={isLoading} // Vô hiệu hóa nút khi đang loading
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" /> // Hiển thị loading
            ) : (
              <Text className="text-white font-pbold">Xác nhận</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal thông báo */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-96">
            <Image
              source={{
                uri: isSuccess
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbY8UK-BaW-W8oLqpI_Hd2kBMdjW6Q3CKBg&s" // Icon thành công
                  : "https://cdn-icons-png.flaticon.com/512/6659/6659895.png", // Icon thất bại
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