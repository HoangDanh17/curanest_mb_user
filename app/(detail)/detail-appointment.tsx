import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBack from "@/components/HeaderBack";
import { router, useLocalSearchParams } from "expo-router";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { AppointmentDetail } from "@/types/appointment";
import { DetailNurse } from "@/types/nurse";
import nurseApiRequest from "@/app/api/nurseApi";
import invoiceApiRequest from "@/app/api/invoiceApi";
import { addMinutes, format, parseISO } from "date-fns";
import { WebView } from "react-native-webview";
import { URL } from "react-native-url-polyfill";

const DetailAppointmentScreen = () => {
  const { id, packageId, nurseId, date, status, actTime } =
    useLocalSearchParams();
  const [appointments, setAppointments] = useState<AppointmentDetail>();
  const [detailNurseData, setDetailNurseData] = useState<DetailNurse>();
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  async function fetchAppointmentDetail() {
    try {
      if (!packageId || !date) return;
      const response = await appointmentApiRequest.getAppointmentDetail(
        String(packageId),
        String(date)
      );
      if (response.payload?.data) {
        setAppointments(response.payload.data);
      }
    } catch (error: any) {
      console.error("Error fetching appointment detail:", error);
    }
  }

  async function fetchNurseInfo() {
    try {
      if (!nurseId) return; // Silently skip if no nurseId
      const response = await nurseApiRequest.getDetailNurse(String(nurseId));
      if (response.payload?.data) {
        setDetailNurseData(response.payload.data);
      }
    } catch (error: any) {
      console.error("Error fetching nurse info:", error);
    }
  }

  const handlePayment = async () => {
    setIsLoadingPayment(true);
    try {
      if (!packageId) return;
      const response = await invoiceApiRequest.getInvoice(String(packageId));
      const invoiceData = response.payload.data;

      if (invoiceData && invoiceData.length > 0) {
        const payosUrl = invoiceData[0]["payos-url"];
        if (payosUrl) {
          setPaymentUrl(payosUrl);
        }
      }
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleNavigationChange = (navState: any) => {
    const { url } = navState;
    if (
      url.includes("https://curanest.com.vn/payment-result-success") ||
      url.includes("https://curanest.com.vn/payment-result-fail")
    ) {
      const parsedUrl = new URL(url);
      const responseCode = parsedUrl.searchParams.get("code");

      if (responseCode === "00") {
        setPaymentUrl("");
        router.replace("/(tabs)/schedule");
      } else {
        setPaymentUrl("");
      }
    }
  };

  useEffect(() => {
    fetchAppointmentDetail();
    if (nurseId) {
      fetchNurseInfo();
    }
  }, []);

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

  let formattedDate = "Không xác định";
  let formattedTime = "Không xác định";
  if (date && typeof date === "string") {
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = format(parsedDate, "dd/MM/yyyy");
        formattedTime = format(parsedDate, "hh:mm a");
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
  }

  const statusStyle = getStatusStyle(String(status));
  const certificates = detailNurseData?.certificate
    ? detailNurseData.certificate.split(" - ").map((cert) => `• ${cert}`)
    : [];

  const totalDuration = appointments?.tasks
    ? appointments.tasks.reduce(
        (sum, task) => sum + (task["est-duration"] || 0),
        0
      )
    : 0;

  const calculateEndTime = () => {
    if (!date || typeof date !== "string") return "Không xác định";
    try {
      const endTime = addMinutes(new Date(date), totalDuration);
      return format(endTime, "HH:mm a");
    } catch (error) {
      console.error("Error calculating end time:", error);
      return "Không xác định";
    }
  };

  const handleViewReport = () => {
    if (!id || !appointments?.tasks || appointments.tasks.length === 0) return;
    router.push({
      pathname: "/report-appointment",
      params: {
        id: String(id),
        listTask: JSON.stringify(appointments.tasks),
      },
    });
  };

  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        style={{ flex: 1 }}
      />
    );
  }

  let formattedActTime = "Chưa bắt đầu";
  if (actTime && typeof actTime === "string") {
    try {
      const parsedActTime = parseISO(actTime);
      if (!isNaN(parsedActTime.getTime())) {
        formattedActTime = format(parsedActTime, "dd/MM/yyyy - hh:mm a");
      }
    } catch (error) {
      console.error("Error formatting actTime:", error);
    }
  }

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
            <Image
              source={{
                uri:
                  detailNurseData?.["nurse-picture"] ||
                  "https://www.nursetogether.com/wp-content/uploads/2024/09/Registered-Nurse-Illustration-transparent.png",
              }}
              className="w-36 h-36 border-4 border-gray-200"
              borderRadius={99999}
            />
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
              <Text className="font-psemibold text-gray-700">
                Thời gian đến:
              </Text>
              <Text className="text-gray-500 font-pmedium">{formattedActTime}</Text>
            </View>
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">
                Trạng thái lịch:
              </Text>
              <View
                className={`px-3 py-1 ${statusStyle.backgroundColor} rounded-full`}
              >
                <Text className={`${statusStyle.textColor} font-pmedium`}>
                  {statusStyle.text}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
              <Text className="font-psemibold text-gray-700">Thanh toán:</Text>
              <View
                className={`px-3 py-1 ${
                  appointments?.package?.["payment-status"] === "unpaid"
                    ? "bg-amber-100"
                    : ""
                } rounded-full`}
              >
                <Text
                  className={`${
                    appointments?.package?.["payment-status"] === "unpaid"
                      ? "text-amber-800"
                      : "text-emerald-400"
                  } font-pmedium`}
                >
                  {appointments?.package?.["payment-status"] === "unpaid"
                    ? "Chưa thanh toán"
                    : "✓ Đã thanh toán"}
                </Text>
              </View>
            </View>
            {appointments?.package?.["payment-status"] === "unpaid" && (
              <TouchableOpacity
                className="px-6 py-4 rounded-lg bg-[#1f1f1fe3] "
                onPress={handlePayment}
                disabled={isLoadingPayment}
              >
                {isLoadingPayment ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-[#FFFFFF] font-pbold text-center">
                    💳 Thanh toán
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <View>
              <View className="flex-col justify-between">
                <Text className="font-psemibold text-gray-700">
                  Gói dịch vụ:
                </Text>
                <Text className="text-blue-800 font-psemibold break-words">
                  {appointments?.package?.name || "Chưa có dữ liệu"}
                </Text>
              </View>
              <View className="mt-2">
                {appointments?.tasks && appointments.tasks.length > 0 ? (
                  appointments.tasks.map((service, index) => (
                    <View
                      key={service.id || index}
                      className="p-3 border-b border-gray-200"
                    >
                      <Text className="text-gray-700 font-pbold break-words">
                        {index + 1}. {service.name || "Không có tên"}
                      </Text>
                      <View className="flex-row flex-wrap justify-between">
                        <Text className="text-gray-500 break-words">
                          Thời gian: {service["est-duration"] || 0} phút
                        </Text>
                        <Text className="text-gray-500 break-words">
                          x{service["total-unit"] || 0} lần
                        </Text>
                      </View>
                      <Text className="text-gray-500 break-words">
                        Ghi chú: {service["client-note"] || "Không có ghi chú"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 font-pmedium">
                    Không có nhiệm vụ nào
                  </Text>
                )}
              </View>
            </View>

            <View className="mt-4">
              <Text className="font-psemibold text-gray-700">
                Tổng chi phí:{" "}
                <Text className="text-blue-600 break-words">
                  {appointments?.package?.["total-fee"]?.toLocaleString() ||
                    "0"}{" "}
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

        <View className="mt-4  items-center justify-center">
          <TouchableOpacity
            className="px-6 py-4 rounded-lg bg-[#64CBDB] w-[90%]"
            onPress={handleViewReport}
          >
            <Text className="text-white font-pmedium text-center">
              📋 Xem báo cáo tiến trình task
            </Text>
          </TouchableOpacity>
        </View>

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
