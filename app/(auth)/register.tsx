import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import Logo from "../../assets/images/logo-app.png";
import { Link, router } from "expo-router";
import InputLogin from "@/components/InputLogin";
import authApiRequest from "@/app/api/authApi";
import { RegisterBodyType } from "@/types/login";
import Toast from "react-native-toast-message"; // Import Toast

interface FormErrors {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen = () => {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    phoneNumber: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const topCircleAnimation = useRef(new Animated.Value(0)).current;
  const bottomCircleAnimation = useRef(new Animated.Value(0)).current;
  const fullNameInputAnimation = useRef(new Animated.Value(-300)).current;
  const phoneNumberInputAnimation = useRef(new Animated.Value(-300)).current;
  const emailInputAnimation = useRef(new Animated.Value(-300)).current;
  const passwordInputAnimation = useRef(new Animated.Value(-300)).current;
  const confirmPasswordInputAnimation = useRef(
    new Animated.Value(-300)
  ).current;
  const buttonAnimation = useRef(new Animated.Value(-300)).current;

  const validateFullName = (name: string) => {
    if (!name) {
      return "Vui lòng nhập họ và tên";
    }
    if (name.length < 2) {
      return "Họ và tên phải có ít nhất 2 ký tự";
    }
    if (!/^[a-zA-ZÀ-ỹ\s]*$/.test(name)) {
      return "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
    }
    return "";
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneNumber) {
      return "Vui lòng nhập số điện thoại";
    }
    if (!phoneRegex.test(phoneNumber)) {
      return "Số điện thoại không hợp lệ";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Vui lòng nhập email";
    }
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Vui lòng nhập mật khẩu";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ in hoa";
    }
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 số";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      return "Vui lòng xác nhận mật khẩu";
    }
    if (confirmPassword !== form.password) {
      return "Mật khẩu xác nhận không khớp";
    }
    return "";
  };

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: getValidationForField(field, value),
      }));
    }
  };

  const getValidationForField = (field: keyof typeof form, value: string) => {
    switch (field) {
      case "fullName":
        return validateFullName(value);
      case "phoneNumber":
        return validatePhoneNumber(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(value);
      default:
        return "";
    }
  };

  const handleBlur = (field: keyof typeof form) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: getValidationForField(field, form[field]),
    }));
  };

  const isFormValid = () => {
    return (
      !Object.values(errors).some((error) => error) &&
      Object.values(form).every((value) => value)
    );
  };

  const handleRegister = async () => {
    const allTouched = Object.keys(touched).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {} as typeof touched
    );
    setTouched(allTouched);

    const newErrors = {
      fullName: validateFullName(form.fullName),
      phoneNumber: validatePhoneNumber(form.phoneNumber),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword),
    };
    setErrors(newErrors);

    const finalForm: RegisterBodyType = {
      "full-name": form.fullName,
      password: form.password,
      "phone-number": form.phoneNumber,
      email: form.email,
    };

    if (isFormValid()) {
      setLoading(true);
      try {
        const response = await authApiRequest.register(finalForm);
        Toast.show({
          type: "success",
          text1: "Đăng ký thành công",
          text2: "Bạn sẽ được chuyển hướng đến trang đăng nhập",
        });
        router.push("/(auth)/login");
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Đăng ký thất bại",
          text2: error.payload?.error?.reason_field || "Đã có lỗi xảy ra",
        });
      } finally {
        setLoading(false);
      }
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
      Animated.timing(fullNameInputAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(emailInputAnimation, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(phoneNumberInputAnimation, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(passwordInputAnimation, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(confirmPasswordInputAnimation, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 1000,
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

        <InputLogin
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          value={form.fullName}
          onChangeText={(value) => handleInputChange("fullName", value)}
          onBlur={() => handleBlur("fullName")}
          error={errors.fullName}
          touched={touched.fullName}
          loading={loading}
          animationStyle={{
            transform: [{ translateX: fullNameInputAnimation }],
          }}
        />
        <InputLogin
          label="Email"
          placeholder="Nhập email"
          value={form.email}
          onChangeText={(value) => handleInputChange("email", value)}
          onBlur={() => handleBlur("email")}
          error={errors.email}
          touched={touched.email}
          loading={loading}
          animationStyle={{
            transform: [{ translateX: emailInputAnimation }],
          }}
        />
        <InputLogin
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          value={form.phoneNumber}
          onChangeText={(value) => handleInputChange("phoneNumber", value)}
          onBlur={() => handleBlur("phoneNumber")}
          error={errors.phoneNumber}
          touched={touched.phoneNumber}
          loading={loading}
          keyboardType="numeric"
          animationStyle={{
            transform: [{ translateX: phoneNumberInputAnimation }],
          }}
        />

        <InputLogin
          label="Mật khẩu"
          placeholder="*********"
          value={form.password}
          onChangeText={(value) => handleInputChange("password", value)}
          onBlur={() => handleBlur("password")}
          error={errors.password}
          touched={touched.password}
          loading={loading}
          isPassword={true}
          isPasswordVisible={passwordVisible}
          onTogglePassword={togglePasswordVisibility}
          secureTextEntry={!passwordVisible}
          animationStyle={{
            transform: [{ translateX: passwordInputAnimation }],
          }}
        />

        <InputLogin
          label="Xác nhận mật khẩu"
          placeholder="*********"
          value={form.confirmPassword}
          onChangeText={(value) => handleInputChange("confirmPassword", value)}
          onBlur={() => handleBlur("confirmPassword")}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          loading={loading}
          isPassword={true}
          isPasswordVisible={confirmPasswordVisible}
          onTogglePassword={toggleConfirmPasswordVisibility}
          secureTextEntry={!confirmPasswordVisible}
          animationStyle={{
            transform: [{ translateX: confirmPasswordInputAnimation }],
          }}
        />

        <Animated.View
          style={{
            width: "100%",
            transform: [{ translateX: buttonAnimation }],
          }}
        >
          <TouchableOpacity
            className={`w-full py-2 rounded-lg items-center ${
              loading ? "bg-teal-200" : "bg-teal-300"
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">ĐĂNG KÝ</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View className="mt-10 mb-6 flex flex-row">
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