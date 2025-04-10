import { View, Text, TouchableOpacity } from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { ProfileButtonProps } from "@/types/profile";

const ProfileButton = ({
  icon,
  text,
  onPress,
}: ProfileButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-[#fff] px-4 py-5 flex-row items-center justify-between rounded-lg shadow-lg`}
    >
      <View className="flex flex-row items-center">
        <Icon name={icon} size={24} color="white" className="bg-[#6fe8ea] rounded-full p-2" />
        <Text className=" font-psemibold text-lg ml-3">{text}</Text>
      </View>
      <Text className=" font-psemibold text-4xl ml-3 text-[#A8E0E9]">〉</Text>
    </TouchableOpacity>
  );
};

export default ProfileButton;
