import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
}

const CustomInput = ({ 
  label, 
  error, 
  containerClassName = "", 
  className = "",
  ...props 
}: CustomInputProps) => {
  return (
    <View className={`gap-2 mt-2 ${containerClassName}`}>
      <Text className="text-black text-base mb-1 font-pbold">
        {label}
      </Text>
      <TextInput
        className={`bg-white/10 rounded-md p-3 text-black font-pmedium ${className}`}
        placeholderTextColor="#999"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1 font-pmedium">
          {error}
        </Text>
      )}
    </View>
  );
};

export default CustomInput;