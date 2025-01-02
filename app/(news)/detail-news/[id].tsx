import { View, Text, Image, ScrollView } from "react-native";
import React from "react";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const DetailNewsScreen = () => {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Viewer Count and Time */}
      <View className="flex-row items-center justify-start space-x-2 mb-4">
        <FontAwesome name="eye" size={16} color="gray" />
        <Text className="text-sm text-gray-600 ml-2">41,734</Text>
        <Text className="text-sm text-gray-600 mx-2">•</Text>
        <MaterialIcons name="access-time" size={16} color="gray" />
        <Text className="text-sm text-gray-600 ml-2">29-10-2024</Text>
      </View>

      {/* Title */}
      <Text className="text-lg font-pbold text-black mb-4">
        Ký kết Hiệp định Đối tác kinh tế toàn diện CEPA giữa Việt Nam và UAE
      </Text>

      {/* Description */}
      <Text className="text-base text-gray-600 mb-4 font-pmedium">
        Trong khuôn khổ chuyến thăm chính thức Các Tiểu vương quốc Ả Rập Thống
        nhất (UAE), chiều 28/10, tại thành phố Dubai, Thủ tướng Chính phủ Phạm
        Minh Chính đã có cuộc hội đàm với Phó Tổng thống, Thủ tướng UAE Sheikh
        Mohammed bin Rashid Al Maktoum.
      </Text>

      <Image
        source={{
          uri: "https://image.plo.vn/736x415/Uploaded/2024/xqeioxdrky/2024_12_25/tong-bi-thu-to-lam-lam-truong-ban-chi-dao-trung-uong-ve-phat-trien-khoa-hoc-cong-nghe-8984-8307.jpg.webp",
        }}
        className="w-full h-60 rounded-lg mb-4"
        resizeMode="cover"
      />

      <Text className="text-sm text-gray-500 mb-4 italic">
        Thủ tướng Phạm Minh Chính hội đàm với Phó Tổng thống, Thủ tướng UAE
        Sheikh Mohammed bin Rashid Al Maktoum.
      </Text>

      <Text className="text-base text-gray-600 font-pmedium">
        Thủ tướng Chính phủ Phạm Minh Chính bày tỏ sự vui mừng quay trở lại thăm
        Tiểu vương quốc Dubai, trung tâm tài chính, tài chính hàng đầu của khu
        vực và thế giới; chúc mừng UAE đã tổ chức thành công Hội nghị lần thứ 28
        của Liên hợp quốc về Biến đổi khí hậu (COP28) vào tháng 12/2023, tạo dấu
        ấn mạnh mẽ trong việc đưa ra các giải pháp ứng phó với các thách thức
        toàn cầu hiện nay.
      </Text>
      <Text className="text-base text-gray-600 font-pmedium mt-4">
        Thủ tướng khẳng định những thành tựu quan trọng mà Dubai nói riêng và
        UAE nói chung trong xây dựng và phát triển đất nước không chỉ đem lại
        lợi ích cho nhân dân UAE mà còn góp phần tạo động lực cho sự phát triển
        chung của khu vực và toàn cầu.
      </Text>
      <View className="mb-20"></View>
    </ScrollView>
  );
};

export default DetailNewsScreen;
