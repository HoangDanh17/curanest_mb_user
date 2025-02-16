import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Logo from "@/assets/images/logo-app.png";
import WelcomeImage from "@/assets/images/homepage.png";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonMenu from "@/components/ButtonMenu";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Patient, PatientRes } from "@/types/patient";
import patientApiRequest from "@/app/api/patientApi";
import { calculateAge } from "@/lib/utils";

const { width, height } = Dimensions.get("window");

const buttonData = [
  {
    id: "1",
    icon: "search",
    label: "Tìm kiếm Điều Dưỡng",
    bgColor: "bg-emerald-400",
  },
  { id: "2", icon: "history", label: "Lịch sử GD", bgColor: "bg-blue-400" },
  { id: "3", icon: "article", label: "Tin tức", bgColor: "bg-purple-400" },
];

const HomeScreen = () => {
  const [loading, setLoading] = useState(false);
  const [patientList, setPatientList] = useState<Patient[]>();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }
  
  async function fetchPatientList() {
    try {
      const response = await patientApiRequest.getAllPatient();
      setPatientList(response.payload.data);
    } catch (error) {
      console.error("Error fetching patient list:", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchPatientList();
    }, [])
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-col items-start ml-4">
            <Text className="text-md font-psemibold text-gray-400">
              Chào mừng trở lại
            </Text>
            <Text className="text-lg font-pbold">0789456</Text>
          </View>
          <View>
            <Image
              source={Logo}
              style={{
                width: width * 0.3,
                height: height * 0.14,
                resizeMode: "contain",
              }}
            />
          </View>
        </View>

        <View style={{ margin: width * 0.05 }}>
          <Image
            source={WelcomeImage}
            style={{
              width: "100%",
              height: height * 0.25,
              borderTopLeftRadius: 30,
              borderBottomRightRadius: 30,
              marginTop: -25,
            }}
            className="shadow-xl"
            resizeMode="contain"
          />
        </View>
        <Text className="ml-4 text-lg font-pbold">Chức năng</Text>
        <View className="flex justify-center">
          <FlatList
            data={buttonData}
            renderItem={({ item }) => (
              <ButtonMenu
                icon={item.icon as keyof typeof MaterialIcons.glyphMap}
                label={item.label}
                bgColor={item.bgColor}
                onPress={() => {
                  if (item.id === "1") {
                    router.push("/(tabs)/search");
                  } else if (item.id === "3") {
                    router.push("/(news)/news");
                  } else {
                    alert(`Bạn đã nhấn vào ${item.label}`);
                  }
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={{
              paddingHorizontal: width * 0.06,
              paddingVertical: height * 0.02,
            }}
            ItemSeparatorComponent={() => (
              <View style={{ width: width * 0.05 }} />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View className="flex flex-row items-center justify-between mx-4 mt-4">
          <Text className=" text-lg font-pbold">Hồ sơ bệnh nhân</Text>
          <TouchableOpacity
            className="bg-green-600 p-1 px-6 rounded-2xl"
            onPress={() => router.push("/create-patient")}
          >
            <Text className="text-white font-psemibold">Tạo hồ sơ</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-4">
          <FlatList
            data={patientList}
            renderItem={({ item }) => (
              <View
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-4 mr-6"
                style={{
                  width: width * 0.75,
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <View className="bg-indigo-200 p-4 border-b border-gray-100">
                  <Text className="text-xl font-pbold text-blue-800">
                    {item["full-name"]}
                  </Text>
                </View>

                <View className="p-4 gap-2">
                  <View className="flex-row items-center justify-between ">
                    <Text className="text-gray-600 font-pmedium">
                      Số điện thoại:
                    </Text>
                    <Text className="text-black font-psemibold ml-2">
                      {item["phone-number"]}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 font-pmedium">Tuổi:</Text>
                    <Text className="text-black font-psemibold ml-2">
                      {calculateAge(item.dob)}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-600 font-pmedium mb-2">
                      Địa chỉ:
                    </Text>
                    <View className="bg-gray-100 rounded-xl p-3">
                      <Text className="text-gray-800 font-pmedium">
                        {item.address}
                        {item.ward ? `, ${item.ward}` : ""}
                        {item.district ? `, ${item.district}` : ""}
                        {item.city ? `, ${item.city}` : ""}
                      </Text>
                    </View>
                  </View>

                  <View className="flex flex-row justify-between">
                    <TouchableOpacity
                      className="bg-blue-500 py-2 px-2 rounded-xl flex-1 mr-2"
                      onPress={() => router.push("/create-appoinment")}
                    >
                      <Text className="text-white font-psemibold text-center">
                        Đặt lịch
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-orange-400 py-2 px-2 rounded-xl flex-1 mr-2"
                      onPress={() => router.push({ pathname: "/update-patient/[id]", params: { id: item.id } })}
                    >
                      <Text className="text-white font-psemibold text-center">
                        Sửa hồ sơ
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ListEmptyComponent={() => (
              <Text className="mt-14 font-psemibold text-gray-400 items-center ml-10">
                Không có hồ sơ bệnh nhân nào
              </Text>
            )}
          />
        </View>
        <View className="mb-10"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
