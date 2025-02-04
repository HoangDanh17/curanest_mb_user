import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface RadioOption {
  label: string;
  value: boolean;
}

interface CustomRadioProps {
  options: RadioOption[];
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
}

const CustomRadio = ({
  options,
  value,
  onValueChange,
  label,
}: CustomRadioProps) => {
  return (
    <View>
      <Text className="text-black text-base mb-1 mt-2 font-pbold">{label}</Text>
      <View className="flex-row justify-around p-2 bg-white/10 rounded-md">
        {options.map((option) => (
          <TouchableOpacity
            key={option.label}
            className="flex-row items-center"
            onPress={() => onValueChange(option.value)}
          >
            <View className="w-5 h-5 rounded-full border-2 mr-2 items-center justify-center">
              {value === option.value && (
                <View className="w-3 h-3 rounded-full bg-black" />
              )}
            </View>
            <Text className="text-black">{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CustomRadio;
