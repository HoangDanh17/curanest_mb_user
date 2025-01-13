import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBack from "@/components/HeaderBack";

const DetailAppointmentScreen = () => {
  const services = ["Khám tổng quát", "Xét nghiệm máu", "Chụp X-quang"];
  const status = "in_progress";

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          backgroundColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          text: "Sắp diễn ra",
        };
      case "in_progress":
        return {
          backgroundColor: "bg-blue-100",
          textColor: "text-blue-800",
          text: "Đang thực hiện",
        };
      case "finish":
        return {
          backgroundColor: "bg-green-100",
          textColor: "text-green-800",
          text: "Hoàn thành",
        };
      default:
        return {
          backgroundColor: "bg-gray-100",
          textColor: "text-gray-800",
          text: "Không xác định",
        };
    }
  };

  const serviceColors = [
    { backgroundColor: "bg-blue-100", textColor: "text-blue-800" },
    { backgroundColor: "bg-green-100", textColor: "text-green-800" },
    { backgroundColor: "bg-yellow-100", textColor: "text-yellow-800" },
    { backgroundColor: "bg-purple-100", textColor: "text-purple-800" },
    { backgroundColor: "bg-pink-100", textColor: "text-pink-800" },
    { backgroundColor: "bg-indigo-100", textColor: "text-indigo-800" },
  ];

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * serviceColors.length);
    return serviceColors[randomIndex];
  };
  const statusStyle = getStatusStyle(status);

  // Dữ liệu giả lập cho các bệnh nhân đã khám tim mạch
  const patients = [
    { name: "Nguyễn Văn A", time: "8:00 - 9:00", note: "Đã khám tim mạch" },
    { name: "Nguyễn Văn B", time: "8:00 - 9:00", note: "Đã khám tim mạch" },
    { name: "Nguyễn Văn C", time: "8:00 - 9:00", note: "Đã khám tim mạch" },
  ];

  return (
    <SafeAreaView>
      <ScrollView className="bg-white h-full p-4">
        <HeaderBack />
        <View className="flex-1 items-center">
          <Image
            source={{
              uri: "https://cdn.santino.com.vn/storage/upload/news/2023/07/ao-vest-nam-cho-nguoi-lon-tuoi-02.jpg",
            }}
            className="w-36 h-36 border-4 border-gray-200"
            borderRadius={99999}
          />
        </View>

        <View className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Text className="text-xl font-psemibold mb-4 text-blue-600 text-center">
            Thông tin người dùng
          </Text>
          <View className="space-y-4 gap-4">
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Tên:</Text>
              <Text className="text-gray-500 font-pmedium">Nguyễn Văn A</Text>
            </View>
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Tuổi:</Text>
              <Text className="text-gray-500 font-pmedium">40</Text>
            </View>
            <View className="flex-col border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Địa chỉ:</Text>
              <Text className="text-gray-500 font-pmedium flex-1 p-2">
                123 Tô Hiến Thành, Quận 10, Thành phố Hồ Chí Minh, Việt Nam
              </Text>
            </View>
            <View className="flex-col border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">
                Mô tả bệnh lý:
              </Text>
              <Text className="text-gray-500 font-pmedium flex-1 p-2">
                Chiến thương gần cơ, đau nhức kéo dài, cần theo dõi và điều trị
                thêm.
              </Text>
            </View>
            <View className="flex-col justify-between">
              <Text className="font-psemibold text-gray-700">
                Lưu ý với điều dưỡng:
              </Text>
              <Text className="text-gray-500 font-pmedium p-2">
                Thẹo đối pháp ứng của cơ thể, cần chú ý vết thương và thay băng
                thường xuyên. Theo dõi tình trạng sưng đỏ và nhiễm trùng. Đảm
                bảo vệ sinh sạch sẽ và tuân thủ hướng dẫn của bác sĩ.
              </Text>
            </View>
          </View>
        </View>

        {/* Khung thông tin lịch hẹn */}
        <View className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Text className="text-xl font-psemibold mb-4 text-blue-600 text-center">
            Thông tin lịch hẹn - 04/01/2025
          </Text>
          <View className="space-y-4 gap-4">
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Thời gian:</Text>
              <Text className="text-gray-500 font-pmedium">8:00 - 9:00</Text>
            </View>
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Trạng thái:</Text>
              <View
                className={`px-3 py-1 ${statusStyle.backgroundColor} rounded-full`}
              >
                <Text className={`${statusStyle.textColor} font-pmedium`}>
                  {statusStyle.text}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">
                Tổng số tiền:
              </Text>
              <Text className="text-gray-500 font-pmedium">900,000 VND</Text>
            </View>
            <View className="flex-col">
              <Text className="font-psemibold text-gray-700 mb-2">
                Dịch vụ đã đăng ký:
              </Text>
              <View className="flex-row flex-wrap gap-2 p-2">
                {services.map((service, index) => {
                  const color = getRandomColor(); // Chọn màu ngẫu nhiên
                  return (
                    <View
                      key={index}
                      className={`px-3 py-1 ${color.backgroundColor} rounded-full`}
                    >
                      <Text className={`${color.textColor} font-pmedium`}>
                        {service}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Khung thông tin bệnh nhân đã khám tim mạch */}
        <View className="mt-6 p-6 rounded-2xl ">
          <Text className="text-xl font-psemibold mb-4 text-blue-600 ">
            Lời khuyên từ điều dưỡng
          </Text>
          <View className="space-y-4 gap-2">
            {patients.map((patient, index) => (
              <View
                key={index}
                className="bg-teal-100 pb-4 flex flex-col gap-2 p-4 rounded-xl"
              >
                <View className="flex flex-row justify-start items-center border-b-2 gap-2">
                  <Image
                    source={{
                      uri: "https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png",
                    }}
                    className="w-14 h-14 rounded-full mr-2 mb-2"
                  />
                  <View className="flex flex-col mb-2">
                    <Text className="font-psemibold text-gray-700">
                      {patient.name}
                    </Text>
                    <Text className="text-gray-500 font-pmedium">
                      {patient.time}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-500 font-pmedium">
                  {patient.note}
                </Text>
              </View>
            ))}
            <Pressable className="mt-4">
              <Text className=" text-center font-psemibold color-slate-400">
                Tải thêm
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="absolute bottom-12 right-4 flex flex-row gap-4">
          <TouchableOpacity className="px-6 py-2 bg-red-50 rounded-lg">
            <Text className="text-gray-700 font-pmedium">Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-6 py-2 bg-green-400 rounded-lg">
            <Text className="text-white font-pmedium">Xác nhận hoàn thành</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-36"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailAppointmentScreen;