import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from "react-native";
import Logo from "../../assets/images/logo-app.png";
import { Link, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LoginBodyType } from "@/types/login";
import authApiRequest from "@/app/api/authApi";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormErrors {
  "phone-number": string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const [form, setForm] = useState({
    "phone-number": "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    "phone-number": "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [touched, setTouched] = useState({
    "phone-number": false,
    password: false,
  });

  const topCircleAnimation = useRef(new Animated.Value(0)).current;
  const bottomCircleAnimation = useRef(new Animated.Value(0)).current;
  const phoneNumberInputAnimation = useRef(new Animated.Value(-300)).current;
  const passwordInputAnimation = useRef(new Animated.Value(-300)).current;
  const buttonAnimation = useRef(new Animated.Value(-300)).current;

 
  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^(0[1|3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneNumber) {
      return "Vui lòng nhập số điện thoại";
    }
    if (!phoneRegex.test(phoneNumber)) {
      return "Số điện thoại không hợp lệ";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Vui lòng nhập mật khẩu";
    }
    return "";
  };

  const handleInputChange = (field: keyof LoginBodyType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]:
          field === "phone-number"
            ? validatePhoneNumber(value)
            : validatePassword(value),
      }));
    }
  };

  const handleBlur = (field: keyof LoginBodyType) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "phone-number"
          ? validatePhoneNumber(form["phone-number"])
          : validatePassword(form.password),
    }));
  };

  const isFormValid = () => {
    const phoneNumberError = validatePhoneNumber(form["phone-number"]);
    const passwordError = validatePassword(form.password);
    return !phoneNumberError && !passwordError;
  };

  const handleLogin = async () => {
    if (!isFormValid()) {
      return;
    }
    try {
      setLoading(true);
      const response = await authApiRequest.login(form);
      const userRole = response.payload.data["account-info"].role;
      if (userRole !== "relatives") {
        Alert.alert(
          "Không được phép truy cập",
          "Ứng dụng này chỉ dành cho người dùng."
        );
        return;
      }
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.payload.data['account-info']));
      await AsyncStorage.setItem('accessToken', response.payload.data.token['access_token']);
      router.push("/(tabs)/home");
    } catch (error: any) {
      if (error.payload.error.reason_field) {
        Alert.alert("Đăng nhập thất bại", error.payload.error.reason_field);
      } else {
        Alert.alert("Đăng nhập thất bại", "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const animateCircles = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(topCircleAnimation, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(topCircleAnimation, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bottomCircleAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bottomCircleAnimation, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateInputsAndButton = () => {
    Animated.stagger(200, [
      Animated.timing(phoneNumberInputAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(passwordInputAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateCircles();
    animateInputsAndButton();
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Animated.View
        style={{
          transform: [
            {
              translateX: topCircleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 30],
              }),
            },
            {
              translateY: topCircleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 20],
              }),
            },
            {
              scale: topCircleAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.1, 1],
              }),
            },
          ],
        }}
        className="absolute top-[-50] left-[-180] w-72 h-72 rounded-full bg-teal-400"
      />
      <Animated.View
        style={{
          transform: [
            {
              translateX: bottomCircleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20],
              }),
            },
            {
              translateY: bottomCircleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -30],
              }),
            },
            {
              scale: bottomCircleAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.2, 1],
              }),
            },
          ],
        }}
        className="absolute bottom-[-60] right-[-215] w-72 h-72 rounded-full bg-teal-400"
      />
      <Image source={Logo} className="w-80 h-20 mb-12" />
      <Text className="text-2xl font-pbold mb-2 text-teal-400">ĐĂNG NHẬP</Text>
      <Text className="text-lg font-pmedium text-black/50 mb-8">
        Vui lòng đăng nhập để tiếp tục
      </Text>
      <Animated.View
        className="w-full"
        style={{ transform: [{ translateX: phoneNumberInputAnimation }] }}
      >
        <Text className="ml-2 mb-2 text-teal-700 font-psemibold">
          Số điện thoại
        </Text>
        <TextInput
          className={`border ${
            loading
              ? "border-teal-200 bg-black/20"
              : errors["phone-number"]
              ? "border-red-500 bg-white"
              : "border-teal-500 bg-white"
          } rounded-2xl p-4 mb-1 font-psemibold`}
          placeholder="Nhập số điện thoại"
          value={form["phone-number"]}
          onChangeText={(value) => handleInputChange("phone-number", value)}
          onBlur={() => handleBlur("phone-number")}
          autoCapitalize="none"
          editable={!loading}
          keyboardType="numeric"
        />
        {touched["phone-number"] && errors["phone-number"] ? (
          <Text className="text-red-500 text-sm ml-2 mb-2 font-pmedium">
            {errors["phone-number"]}
          </Text>
        ) : (
          <View className="mb-4" />
        )}
      </Animated.View>
      <Animated.View
        className="w-full"
        style={{ transform: [{ translateX: passwordInputAnimation }] }}
      >
        <Text className="ml-2 mb-2 text-teal-700 font-psemibold">Mật khẩu</Text>
        <View className="relative">
          <TextInput
            className={`w-full border ${
              loading
                ? "border-teal-200 bg-black/20"
                : errors.password
                ? "border-red-500 bg-white"
                : "border-teal-500 bg-white"
            } rounded-2xl p-4 pr-12 mb-1 font-psemibold`}
            placeholder="*********"
            value={form.password}
            onChangeText={(value) => handleInputChange("password", value)}
            onBlur={() => handleBlur("password")}
            secureTextEntry={!passwordVisible}
            editable={!loading}
          />

          <TouchableOpacity
            className="absolute right-4 top-[36%] transform -translate-y-1/4"
            onPress={togglePasswordVisibility}
            disabled={loading}
          >
            <MaterialIcons
              name={passwordVisible ? "visibility" : "visibility-off"}
              size={24}
              color={loading ? "#ccc" : "#0d9488"}
            />
          </TouchableOpacity>
        </View>
        {touched.password && errors.password ? (
          <Text className="text-red-500 text-sm ml-2 mb-4 font-pmedium">
            {errors.password}
          </Text>
        ) : (
          <View className="mb-6" />
        )}
      </Animated.View>
      <Animated.View
        style={{ width: "100%", transform: [{ translateX: buttonAnimation }] }}
      >
        <TouchableOpacity
          className={`w-full py-2 rounded-lg items-center ${
            loading ? "bg-teal-200" : "bg-teal-300"
          }`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <Text className="text-white font-pbold text-lg">ĐĂNG NHẬP</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
      <View className="mt-14 flex flex-row">
        <Text className="text-lg font-pmedium">Chưa có tài khoản?</Text>
        <Link
          href={"/(auth)/register"}
          className="ml-2 text-teal-600 underline decoration-2 text-lg"
        >
          Đăng kí
        </Link>
      </View>
    </View>
  );
};

export default LoginScreen;
