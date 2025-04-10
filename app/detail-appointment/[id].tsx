import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBack from "@/components/HeaderBack";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { AppointmentDetail } from "@/types/appointment";
import { DetailNurse } from "@/types/nurse";
import nurseApiRequest from "@/app/api/nurseApi";
import { addMinutes, format } from "date-fns";

const DetailAppointmentScreen = () => {
  const { id, packageId, nurseId, patientId, date, status } =
    useLocalSearchParams();
  const [appointments, setAppointments] = useState<AppointmentDetail>();
  const [detailNurseData, setDetailNurseData] = useState<DetailNurse>();

  async function fetchAppointmentDetail() {
    try {
      const response = await appointmentApiRequest.getAppointmentDetail(
        String(packageId),
        String(date)
      );
      setAppointments(response.payload.data);
    } catch (error) {
      console.error("Error fetching patient list:", error);
    }
  }

  async function fetchNurseInfo() {
    try {
      const response = await nurseApiRequest.getDetailNurse(nurseId);
      setDetailNurseData(response.payload.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchAppointmentDetail();
      if (nurseId) {
        fetchNurseInfo();
      }
    }, [])
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "waiting":
        return {
          backgroundColor: "bg-amber-100",
          textColor: "text-amber-800",
          text: "Chờ xác nhận",
        };
      case "confirmed":
        return {
          backgroundColor: "bg-indigo-100",
          textColor: "text-indigo-800",
          text: "Đã xác nhận",
        };
      case "success":
        return {
          backgroundColor: "bg-emerald-100",
          textColor: "text-emerald-800",
          text: "Hoàn thành",
        };
      case "refused":
        return {
          backgroundColor: "bg-red-100",
          textColor: "text-red-800",
          text: "Từ chối chuyển",
        };
      default:
        return {
          backgroundColor: "bg-gray-100",
          textColor: "text-gray-800",
          text: "Không xác định",
        };
    }
  };

  const statusStyle = getStatusStyle(String(status));
  const certificates = detailNurseData?.certificate
    ? detailNurseData.certificate.split(" - ").map((cert) => `• ${cert}`)
    : [];
  const formattedDate = format(new Date(String(date)), "dd/MM/yyyy");
  const formattedTime = format(new Date(String(date)), "hh:mm a");
  const totalDuration = appointments?.tasks
    ? appointments.tasks.reduce((sum, task) => sum + task["est-duration"], 0)
    : 0;

  const calculateEndTime = () => {
    const endTime = addMinutes(String(date), totalDuration);
    return format(endTime, "HH:mm a");
  };

  return (
    <SafeAreaView className="bg-white p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderBack />
        <View className="flex-1 items-center relative">
          {detailNurseData ? (
            <Image
              source={{
                uri:
                  detailNurseData?.["nurse-picture"] ||
                  "https://chuphinhthe.com/upload/product/4709-tam-8496.jpg",
              }}
              className="w-36 h-36 border-4 border-gray-200"
              borderRadius={99999}
            />
          ) : (
            <View className="w-36 h-36 border-4 border-gray-200 rounded-full justify-center items-center">
              <ActivityIndicator size="large" color="#64CBDB" />
            </View>
          )}
          {detailNurseData && (
            <View className="mt-2 items-center absolute top-[100]">
              <View className="px-3 py-1 rounded-full border bg-white">
                <Text className="text-gray-700 font-pmedium text-sm">
                  {detailNurseData?.rate?.toFixed(2) || "N/A"} ★
                </Text>
              </View>
            </View>
          )}
          {detailNurseData && (
            <View className="mt-4 items-center">
              <View className="bg-yellow-100 px-3 py-1 rounded-full mb-1">
                <Text className="text-yellow-700 font-pmedium text-sm">
                  {detailNurseData?.slogan || "Chưa có slogan"}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Text className="text-xl font-psemibold mb-4 text-blue-600 text-center">
            Thông tin điều dưỡng
          </Text>
          {detailNurseData ? (
            <View className="space-y-4 gap-4">
              <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
                <Text className="font-psemibold text-gray-700">Tên:</Text>
                <Text className="text-gray-500 font-pmedium">
                  {detailNurseData?.["nurse-name"] || "Chưa có dữ liệu"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
                <Text className="font-psemibold text-gray-700">
                  Nơi làm việc:
                </Text>
                <Text className="text-gray-500 font-pmedium">
                  {detailNurseData?.["current-work-place"] || "Chưa có dữ liệu"}
                </Text>
              </View>
              <View className="flex-col border-b border-gray-200 pb-2">
                <Text className="font-psemibold text-gray-700">
                  Trình độ học vấn:
                </Text>
                <Text className="text-gray-500 font-pmedium flex-1 p-2">
                  {detailNurseData?.["education-level"] || "Chưa có dữ liệu"}
                </Text>
              </View>
              <View className="flex-col border-b border-gray-200 pb-2">
                <Text className="font-psemibold text-gray-700">
                  Kinh nghiệm làm việc:
                </Text>
                <Text className="text-gray-500 font-pmedium flex-1 p-2">
                  {detailNurseData?.experience || "Chưa có dữ liệu"}
                </Text>
              </View>
              <View className="flex-col pb-2">
                <Text className="font-psemibold text-gray-700">Chứng chỉ:</Text>
                {certificates.length > 0 ? (
                  certificates.map((cert, index) => (
                    <View className="bg-slate-100 my-2" key={index}>
                      <Text className="text-gray-500 font-pmedium p-2">
                        {cert}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 font-pmedium p-2">
                    Chưa có chứng chỉ
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View className="space-y-4 gap-4 min-h-[300px] justify-center items-center">
              <ActivityIndicator size="large" color="#64CBDB" />
              <Text className="text-gray-500 font-pmedium">
                Đang tìm kiếm điều dưỡng...
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Text className="text-xl font-psemibold mb-4 text-blue-600 text-center">
            Thông tin lịch hẹn - {formattedDate}
          </Text>
          <View className="space-y-4 gap-4">
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Thời gian:</Text>
              <Text className="text-gray-500 font-pmedium">
                {formattedTime} • {calculateEndTime()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Trạng thái:</Text>
              <View
                className={`px-3 py-1 ${statusStyle.backgroundColor} rounded-full`}
              >
                <Text className={`${statusStyle.textColor} font-pmedium`}>
                  {statusStyle.text}
                </Text>
              </View>
            </View>

            <View>
              <View className="flex-col justify-between">
                <Text className="font-psemibold text-gray-700">
                  Gói dịch vụ:
                </Text>
                <Text className="text-blue-800 font-psemibold break-words">
                  {appointments?.package.name || "Chưa có dữ liệu"}
                </Text>
              </View>
              <View className="mt-2">
                {appointments?.tasks.map((service, index) => (
                  <View
                    key={service.id}
                    className="p-3 border-b border-gray-200"
                  >
                    <Text className="text-gray-700 font-pbold break-words">
                      {index + 1}. {service.name}
                    </Text>
                    <View className="flex-row flex-wrap justify-between">
                      <Text className="text-gray-500 break-words">
                        Thời gian: {service["est-duration"]} phút
                      </Text>
                      <Text className="text-gray-500 break-words">
                        x{service["total-unit"]} lần
                      </Text>
                    </View>
                    <Text className="text-gray-500 break-words">
                      Ghi chú: {service["client-note"]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4">
              <Text className="font-psemibold text-gray-700">
                Tổng chi phí:{" "}
                <Text className="text-blue-600 break-words">
                  {appointments?.package["total-fee"].toLocaleString() || "0"}{" "}
                  VND
                </Text>
              </Text>
              <Text className="font-psemibold text-gray-700">
                Tổng thời gian:{" "}
                <Text className="text-blue-600 break-words">
                  {totalDuration} phút
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className={`flex-1 px-6 py-4 rounded-lg mt-4 bg-[#64CBDB]`}
          onPress={() =>
            router.push({
              pathname: "/report-appointment/[id]",
              params: {
                id: String(id),
                listTask: JSON.stringify(appointments?.tasks),
              },
            })
          }
        >
          <Text className="text-white font-pmedium text-center break-words items-center">
            📋 Xem báo cáo tiến trình task
          </Text>
        </TouchableOpacity>
        <View className="mt-6 p-2 rounded-2xl">
          <Text className="text-xl font-psemibold mb-4 text-blue-600">
            Lời khuyên từ điều dưỡng
          </Text>
          <View className="space-y-4 gap-2">
            <Text>Chú ý hơn trong việc kiểm tra sức khỏe</Text>
          </View>
        </View>
        <View className="mb-20"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailAppointmentScreen;
