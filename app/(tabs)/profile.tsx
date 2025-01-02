import {
  View,
  Text,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileButton from "@/components/ProfileButton";
import { ProfileHeaderProps } from "@/types/profile";
import Color from "@/assets/images/gradient.png"
const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  phone,
  avatar,
}) => {
  return (
    <View>
      <View className="items-center">
        <Image
          source={{ uri: avatar }}
          className="w-[100px] h-[100px] rounded-full border-[6px] border-white top-[-50]"
        />
      </View>
      <View className="top-[-50] items-center">
        <Text className="text-lg font-pbold mb-2 text-[#A8E0E9]">{name}</Text>
        <Text className="text-md font-medium text-gray-400">{phone}</Text>
      </View>
    </View>
  );
};

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={Color}
        style={{ flex: 1 }}
        blurRadius={100}
      >
        <View>
          <View className="w-full h-[140px]" />
          <View
            className="bg-white h-full"
            style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
          >
            <ProfileHeader
              name="Nguyễn Văn C"
              phone="0945675162"
              avatar="https://imgcdn.stablediffusionweb.com/2024/5/17/01903701-1c0f-4801-9501-fe24f6ef6889.jpg"
            />
            <View className="mx-4 flex flex-col gap-4">
              <ProfileButton
                icon="edit"
                text="Sửa thông tin"
                onPress={() => console.log("Edit Profile")}
              />
              <ProfileButton
                icon="calendar-today"
                text="Danh sách lịch hẹn"
                onPress={() => console.log("Appointment List")}
              />
              <ProfileButton
                icon="history"
                text="Lịch sử giao dịch"
                onPress={() => console.log("Transaction History")}
              />
              <ProfileButton
                icon="logout"
                text="Đăng xuất"
                onPress={() => console.log("Logout")}
              />
            </View>
          </View>
        </View>
      </ImageBackground>      
    </SafeAreaView>
  );
};

export default ProfileScreen;
