import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

interface NewsCardProps {
  id: number;
  image: string;
  title: string;
  description: string;
  time: string;
  viewers: number;
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  image,
  title,
  description,
  time,
  viewers,
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(news)/detail-news/[id]",
          params: { id },
        })
      }
      className="bg-white rounded-lg shadow-md border-b-2 border-t-2 border-gray-400/20 px-4"
    >
      <Text className="text-lg font-pbold mb-2">{title}</Text>
      <Image
        source={{ uri: image }}
        className="w-full h-60 rounded-t-lg"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
          {description}
        </Text>
        <View className="flex-row items-center space-x-2 mb-2">
          <FontAwesome name="eye" size={14} color="gray" />
          <Text className="text-xs text-gray-500 ml-2">{viewers} lượt xem</Text>
          <Text className="text-xs text-gray-500 mx-2">•</Text>
          <MaterialIcons name="access-time" size={14} color="gray" />
          <Text className="text-xs text-gray-500 ml-2">{time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NewsScreen: React.FC = () => {
  const newsData: NewsCardProps[] = [
    {
      id: 1,
      image:
        "https://media.vneconomy.vn/630x354/images/upload/2024/12/24/le-duc-thinh-cv-01.png",
      title:
        "Ký kết Hiệp định Đối tác kinh tế toàn diện CEPA giữa Việt Nam và UAE",
      description:
        "Thủ tướng Phạm Minh Chính và Phó Tổng thống, Thủ tướng UAE đã chứng kiến Lễ ký Hiệp định đối tác kinh tế toàn diện (CEPA)...",
      time: "29-10-2024",
      viewers: 41732,
    },
    {
      id: 2,
      image:
        "https://media.vneconomy.vn/411x231/images/upload/2023/09/03/pv-ong-tran-quang-huy-emag-01.png",
      title:
        "Tăng cường hợp tác với các cơ quan thực thi pháp luật Tây Ban Nha, CHLB Đức",
      description:
        "Bộ trưởng Bộ Công an làm việc với các cơ quan thực thi pháp luật của Tây Ban Nha và Đức...",
      time: "29-10-2024",
      viewers: 21345,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="my-4">
        <Text className="text-lg font-psemibold text-red-700">
          Các tin tức đáng chú ý
        </Text>
      </View>
      <View>
        {newsData.map((news, index) => (
          <NewsCard
            key={index}
            id={news.id}
            image={news.image}
            title={news.title}
            description={news.description}
            time={news.time}
            viewers={news.viewers}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default NewsScreen;
