import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import ProfileButton from "@/components/ProfileButton";
import { ProfileHeaderProps } from "@/types/profile";
import Color from "@/assets/images/gradient.png";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserData = {
  id: string;
  "full-name": string;
  email: string;
  "phone-number": string;
  role: string;
};

const getInitial = (name?: string) => {
  if (!name) return "";
  const parts = name.split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  phone,
  avatar,
}) => {
  const initial = getInitial(name);

  return (
    <View>
      <View className="items-center">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            className="w-[100px] h-[100px] rounded-full border-[6px] border-white top-[-50]"
          />
        ) : (
          <View className="w-[100px] h-[100px] rounded-full border-[6px] border-white top-[-50] bg-cyan-500 items-center justify-center">
            <Text className="text-4xl text-white font-bold">{initial}</Text>
          </View>
        )}
      </View>
      <View className="top-[-50] items-center">
        <Text className="text-lg font-pbold mb-2 text-[#67e4f8]">{name}</Text>
        <Text className="text-md font-pmedium text-gray-400">{phone}</Text>
      </View>
    </View>
  );
};

const ProfileScreen = () => {
  const [data, setData] = useState<UserData | undefined>();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const value = await AsyncStorage.getItem("userInfo");
        if (value) {
          const parsedValue: UserData = JSON.parse(value);
          setData(parsedValue);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("accessToken");
              await AsyncStorage.removeItem("userInfo");
              router.navigate("/(auth)/login");
            } catch (error) {
              console.error("Đăng xuất thất bại", error);
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground source={Color} style={{ flex: 1 }} blurRadius={100}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <View className="w-full h-[140px]" />
            <View
              className="bg-white min-h-screen"
              style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
            >
              <ProfileHeader
                name={data?.["full-name"]}
                phone={data?.["phone-number"]}
                avatar={undefined}
              />

              <View className="mx-4 flex flex-col gap-4 pb-8">
                <ProfileButton
                  icon="edit"
                  text="Cập nhật hồ sơ"
                  onPress={() => router.push("/(profile)/relatives-profile")}
                />
                <ProfileButton
                  icon="calendar-today"
                  text="Lịch sử đặt lịch"
                  onPress={() => router.push("/(profile)/appointment-history")}
                />
                <ProfileButton
                  icon="history"
                  text="Lịch sử thanh toán"
                  onPress={() => router.push("/(profile)/payment-history")}
                />
                <ProfileButton
                  icon="logout"
                  text="Đăng xuất"
                  onPress={handleLogout}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileScreen;
