import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileButton from "@/components/ProfileButton";
import { ProfileHeaderProps } from "@/types/profile";
import Color from "@/assets/images/gradient.png";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSearch } from "@/app/provider";

export type UserData = {
  id: string;
  "full-name": string;
  email: string;
  "phone-number": string;
  role: string;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  phone,
}) => {
  return (
    <View>
      <View className="items-center">
        <Image
          source={{
            uri: "https://media.istockphoto.com/id/1390616702/vector/senior-man-avatar-smiling-elderly-man-with-beard-with-gray-hair-3d-vector-people-character.jpg?s=612x612&w=0&k=20&c=CwU892ELqQlY65Xrnmo2N-pb9AE4xEXcp5gAJ6WpKJg=",
          }}
          className="w-[100px] h-[100px] rounded-full border-[2px] border-white top-[-50]"
        />
      </View>
      <View className="top-[-50] items-center">
        <Text className="text-lg font-pbold mb-2 text-[#67e4f8]">{name}</Text>
        <Text className="text-md font-pmedium text-gray-400">{phone}</Text>
      </View>
    </View>
  );
};

const ProfileScreen = () => {
  const { userData } = useSearch();

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
                name={userData?.["full-name"]}
                phone={userData?.["phone-number"]}
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
