import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Logo from "@/assets/images/logo-app.png";
import WelcomeImage from "@/assets/images/homepage.png";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonMenu from "@/components/ButtonMenu";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const buttonData = [
  {
    id: "1",
    icon: "search",
    label: "Tìm kiếm Điều Dưỡng",
    bgColor: "bg-emerald-400",
  },
  { id: "2", icon: "history", label: "Lịch sử GD", bgColor: "bg-blue-400" },
  { id: "3", icon: "article", label: "Tin tức", bgColor: "bg-purple-400" },
];

const HomeScreen = () => {
  const [loading, setLoading] = useState(false);
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-col items-start ml-4">
            <Text className="text-md font-psemibold text-gray-400">
              Chào mừng trở lại
            </Text>
            <Text className="text-lg font-pbold">0789456</Text>
          </View>
          <View>
            <Image
              source={Logo}
              style={{
                width: width * 0.3,
                height: height * 0.14,
                resizeMode: "contain",
              }}
            />
          </View>
        </View>

        <View style={{ margin: width * 0.05 }}>
          <Image
            source={WelcomeImage}
            style={{
              width: "100%",
              height: height * 0.25,
              borderTopLeftRadius: 30,
              borderBottomRightRadius: 30,
              marginTop: -25,
            }}
            className="shadow-xl"
            resizeMode="contain"
          />
        </View>
        <Text className="ml-4 text-lg font-pbold">Chức năng</Text>
        <View className="flex justify-center">
          <FlatList
            data={buttonData}
            renderItem={({ item }) => (
              <ButtonMenu
                icon={item.icon as keyof typeof MaterialIcons.glyphMap}
                label={item.label}
                bgColor={item.bgColor}
                onPress={() => {
                  if (item.id === "1") {
                    router.push("/(tabs)/search");
                  } else if (item.id === "3") {
                    router.push("/(news)/news");
                  } else {
                    alert(`Bạn đã nhấn vào ${item.label}`);
                  }
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={{
              paddingHorizontal: width * 0.06,
              paddingVertical: height * 0.02,
            }}
            ItemSeparatorComponent={() => (
              <View style={{ width: width * 0.05 }} />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View className="flex flex-row items-center justify-between mx-4 mt-4">
          <Text className=" text-lg font-pbold">Hồ sơ bệnh nhân</Text>
          <TouchableOpacity className="bg-green-600 p-1 px-6 rounded-2xl">
            <Text className="text-white font-psemibold">Tạo hồ sơ</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-4">
          <FlatList
            data={[
              {
                id: "1",
                name: "Nguyễn Văn A",
                age: 58,
                services: ["Vệ sinh", "Thay băng"],
              },
              { id: "2", name: "Lê Thị B", age: 45, services: ["Thay băng"] },
              { id: "3", name: "Trần Văn C", age: 70, services: ["Vệ sinh"] },
            ]}
            renderItem={({ item }) => (
              <View
                className="bg-white shadow-md rounded-lg p-4 mr-4"
                style={{
                  width: width * 0.7,
                  borderWidth: 1,
                  borderColor: "#ddd",
                }}
              >
                <View className="flex flex-row items-center">
                  <View
                    className="bg-black text-white rounded-full flex items-center justify-center"
                    style={{ width: 50, height: 50 }}
                  >
                    <Text className="text-white font-pbold">
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                  <View className="ml-4">
                    <Text className="text-lg font-pbold">{item.name}</Text>
                    <Text className="text-gray-500">Tuổi: {item.age}</Text>
                  </View>
                </View>
                <Text className="mt-2 font-psemibold">Dịch vụ:</Text>
                <View className="flex flex-row flex-wrap mt-1">
                  {item.services.map((service, index) => (
                    <Text
                      key={index}
                      className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full mr-2 mb-2 text-sm"
                    >
                      {service}
                    </Text>
                  ))}
                </View>
                <View className="flex flex-row justify-between items-center mt-4">
                  <TouchableOpacity
                    className="bg-blue-500 py-2 px-4 rounded-xl text-xs font-pmedium"
                    onPress={() => router.push("/create-appoinment")}
                  >
                    <Text className="text-white font-psemibold">Đặt lịch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-red-500 py-2 px-4 rounded-xl text-xs font-pmedium">
                    <Text className="text-white font-psemibold">Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
        <View className="mb-16"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
