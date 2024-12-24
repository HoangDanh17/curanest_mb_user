import { router } from "expo-router";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomeBackground = require("@/assets/images/welcome.png");
const Logo = require("@/assets/images/logo-app.png");

const WelcomePage = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative flex-col items-center justify-center">
        <View className="absolute top-[0] right-[-40] w-40 h-40 rounded-full bg-teal-400" />
        <View className="absolute top-20 left-[-80] w-40 h-40 rounded-full bg-teal-400" />
        <ImageBackground
          source={Logo}
          resizeMode="contain"
          className="w-[180px] h-[180px] mb-4"
        />
        <ImageBackground
          source={WelcomeBackground}
          resizeMode="cover"
          className="w-full h-[300px] items-center"
        />
        <Text className="text-xl font-bold mt-4">
          CHÀO MỪNG TỚI{" "}
          <Text className="text-teal-500 underline decoration-4 underline-offset-8">
            CURANEST
          </Text>
        </Text>
        <View className="w-full px-5 mt-10">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="bg-teal-400 py-3 rounded-xl items-center"
            style={{ borderEndColor: "#000", borderBottomWidth: 1 }}
          >
            <Text className="text-white font-semibold text-xl">ĐĂNG NHẬP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 rounded-xl items-center bg-slate-400/20 mt-4"
            onPress={() => router.push("/(auth)/register")}
          >
            <Text className="text-black/20 font-semibold ">
              ĐĂNG KÝ TÀI KHOẢN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomePage;
