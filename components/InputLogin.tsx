import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  Animated,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

interface InputLoginProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
  loading?: boolean;
  isPassword?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  animationStyle?: any;
}

const InputLogin: React.FC<InputLoginProps> = ({
  label,
  error,
  touched,
  loading,
  isPassword,
  isPasswordVisible,
  onTogglePassword,
  animationStyle,
  ...inputProps
}) => {
  const renderInput = () => (
    <View className="relative">
      <TextInput
        className={`w-full border ${
          loading
            ? "border-teal-200 bg-black/20"
            : error && touched
            ? "border-red-500 bg-white"
            : "border-teal-500 bg-white"
        } rounded-2xl p-4 ${isPassword ? "pr-12" : ""} mb-1`}
        editable={!loading}
        {...inputProps}
      />
      {isPassword && (
        <TouchableOpacity
          className="absolute right-4 top-[36%] transform -translate-y-1/4"
          onPress={onTogglePassword}
          disabled={loading}
        >
          <MaterialIcons
            name={isPasswordVisible ? "visibility" : "visibility-off"}
            size={24}
            color={loading ? "#ccc" : "#0d9488"}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Animated.View className="w-full" style={animationStyle}>
      <Text className="ml-2 mb-2 text-teal-700 font-psemibold">{label}</Text>
      {renderInput()}
      {touched && error ? (
        <Text className="text-red-500 text-sm ml-2 mb-2 font-pmedium">{error}</Text>
      ) : (
        <View className="mb-4" />
      )}
    </Animated.View>
  );
};

export default InputLogin;