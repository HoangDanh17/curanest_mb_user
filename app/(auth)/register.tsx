import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import Logo from "../../assets/images/logo-app.png";
import { Link, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const RegisterScreen = () => {
  const [form, setForm] = useState({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const topCircleAnimation = useRef(new Animated.Value(0)).current;
  const bottomCircleAnimation = useRef(new Animated.Value(0)).current;
  const phoneNumberInputAnimation = useRef(new Animated.Value(-300)).current;
  const passwordInputAnimation = useRef(new Animated.Value(-300)).current;
  const confirmPasswordInputAnimation = useRef(
    new Animated.Value(-300)
  ).current;
  const addressInputAnimation = useRef(new Animated.Value(-300)).current;
  const buttonAnimation = useRef(new Animated.Value(-300)).current;

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
      Animated.timing(confirmPasswordInputAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(addressInputAnimation, {
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

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleLogin = () => {
    if (
      !form.phoneNumber ||
      !form.password ||
      !form.confirmPassword ||
      !form.address
    ) {
      Alert.alert("Error", "Vui lòng nhập tất cả các field");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      router.replace("/(tabs)/home");
      setLoading(false);
      Alert.alert("Register Success", `Welcome, ${form.phoneNumber}`);
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-white items-center justify-start px-6">
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
        <Image source={Logo} className="w-80 h-20 mb-12 mt-20" />
        <Text className="text-2xl font-bold mb-2 text-teal-400">
          ĐĂNG KÝ TÀI KHOẢN
        </Text>

        <Animated.View
          className="w-full"
          style={{ transform: [{ translateX: phoneNumberInputAnimation }] }}
        >
          <Text className="ml-2 mb-2 text-teal-700">Số điện thoại</Text>
          <TextInput
            className={`border ${
              loading
                ? "border-teal-200 bg-black/20"
                : "border-teal-500 bg-white"
            } rounded-2xl p-4 mb-4`}
            placeholder="Nhập số điện thoại"
            value={form.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            autoCapitalize="none"
            editable={!loading}
          />
        </Animated.View>
        <Animated.View
          className="w-full"
          style={{ transform: [{ translateX: passwordInputAnimation }] }}
        >
          <Text className="ml-2 mb-2 text-teal-700">Mật khẩu</Text>
          <View className="relative">
            <TextInput
              className={`w-full border ${
                loading
                  ? "border-teal-200 bg-black/20"
                  : "border-teal-500 bg-white"
              } rounded-2xl p-4 pr-12 mb-6`}
              placeholder="*********"
              value={form.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry={!passwordVisible}
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-4 top-[36%] transform -translate-y-1/2 mb-6"
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
        </Animated.View>

        <Animated.View
          className="w-full"
          style={{ transform: [{ translateX: confirmPasswordInputAnimation }] }}
        >
          <Text className="ml-2 mb-2 text-teal-700">Xác nhận mật khẩu</Text>
          <View className="relative">
            <TextInput
              className={`w-full border ${
                loading
                  ? "border-teal-200 bg-black/20"
                  : "border-teal-500 bg-white"
              } rounded-2xl p-4 pr-12 mb-6`}
              placeholder="*********"
              value={form.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              secureTextEntry={!confirmPasswordVisible}
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-4 top-[36%] transform -translate-y-1/2 mb-6"
              onPress={toggleConfirmPasswordVisibility}
              disabled={loading}
            >
              <MaterialIcons
                name={confirmPasswordVisible ? "visibility" : "visibility-off"}
                size={24}
                color={loading ? "#ccc" : "#0d9488"}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          className="w-full"
          style={{ transform: [{ translateX: addressInputAnimation }] }}
        >
          <Text className="ml-2 mb-2 text-teal-700">Địa chỉ</Text>
          <TextInput
            className={`border ${
              loading
                ? "border-teal-200 bg-black/20"
                : "border-teal-500 bg-white"
            } rounded-2xl p-4 mb-6`}
            placeholder="Nhập địa chỉ"
            value={form.address}
            onChangeText={(value) => handleInputChange("address", value)}
            autoCapitalize="none"
            editable={!loading}
          />
        </Animated.View>

        <Animated.View
          style={{
            width: "100%",
            transform: [{ translateX: buttonAnimation }],
          }}
        >
          <TouchableOpacity
            className={`w-full py-4 rounded-lg items-center ${
              loading ? "bg-teal-200" : "bg-teal-300"
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">ĐĂNG KÝ</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
        <View className="mt-10 flex flex-row">
          <Text className="text-lg">Đã có tài khoản?</Text>
          <Link
            href={"/(auth)/login"}
            className="ml-2 text-teal-600 underline decoration-2 text-lg"
          >
            Đăng nhập
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
