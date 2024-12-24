import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;

interface ButtonItemProps {
  icon: MaterialIconsName;
  label: string;
  bgColor: string;
  onPress: () => void;
}

const ButtonMenu: React.FC<ButtonItemProps> = ({
  icon,
  label,
  bgColor,
  onPress,
}) => {
  const buttonWidth = width * 0.26;
  const buttonHeight = height * 0.13;
  const iconContainerSize = width * 0.13;

  return (
    <View className="items-center" style={{ width: buttonWidth }}>
      <TouchableOpacity
        className="bg-white p-2 rounded-2xl shadow-md"
        style={{
          width: buttonWidth,
          height: buttonHeight,
          justifyContent: "space-between",
          paddingVertical: 8,
        }}
        onPress={onPress}
      >
        <View
          className={`items-center justify-center self-center ${bgColor} rounded-2xl`}
          style={{
            width: iconContainerSize,
            height: iconContainerSize,
          }}
        >
          <MaterialIcons name={icon} size={24} color="#fff" />
        </View>
        <View style={{ paddingHorizontal: 4, marginTop: 4 }}>
          <Text
            className="text-gray-700 text-xs text-center font-pmedium"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{
              lineHeight: 16,
              minHeight: 32, 
            }}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonMenu;
