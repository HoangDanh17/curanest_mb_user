import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBack from "@/components/HeaderBack";
import { router, useLocalSearchParams } from "expo-router";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { AppointmentDetail, GetReport } from "@/types/appointment";
import { DetailNurse, FeedbackType } from "@/types/nurse";
import nurseApiRequest from "@/app/api/nurseApi";
import invoiceApiRequest from "@/app/api/invoiceApi";
import { addMinutes, format, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const DetailAppointmentScreen = () => {
  const { id, packageId, nurseId, date, status, actTime, selectName } =
    useLocalSearchParams();
  const [appointments, setAppointments] = useState<AppointmentDetail>();
  const [detailNurseData, setDetailNurseData] = useState<DetailNurse>();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [medicalReport, setMedicalReport] = useState<GetReport>();
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackRate, setFeedbackRate] = useState(0);
  const [feedbackData, setFeedbackData] = useState<FeedbackType | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isMedicalReportLoading, setIsMedicalReportLoading] = useState(true);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  async function fetchMedicalRecord() {
    try {
      setIsMedicalReportLoading(true);
      const response = await appointmentApiRequest.getMedicalReport(String(id));
      setMedicalReport(response.payload.data);
    } catch (error) {
      console.error("Error fetching medical report:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải báo cáo y tế!",
        position: "top",
      });
    } finally {
      setIsMedicalReportLoading(false);
    }
  }

  async function fetchFeedback(medicalId: string) {
    try {
      setIsFeedbackLoading(true);
      const response = await nurseApiRequest.getFeedback(medicalId);
      const data = response.payload.data;
      if (Object.keys(data).length === 0) {
        setFeedbackData(null);
        setFeedbackContent("");
        setFeedbackRate(0);
      } else {
        setFeedbackData(data);
        setFeedbackContent(data.content || "");
        setFeedbackRate(parseInt(data.star, 10) || 0);
      }
    } catch (error) {
      setFeedbackData(null);
      setFeedbackContent("");
      setFeedbackRate(0);
    } finally {
      setIsFeedbackLoading(false);
    }
  }

  const areAllTasksDone = () => {
    if (!appointments?.tasks || appointments.tasks.length === 0) {
      return false;
    }
    return appointments.tasks.every((task) => task.status === "done");
  };

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
      if (!nurseId) return;
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
      const invoiceData = response.payload.data[0];

      if (invoiceData) {
        router.push({
          pathname: "/(detail)/payment",
          params: {
            id: String(invoiceData["cuspackage-id"]),
            qrCode: String(invoiceData["qr-code"]),
          },
        });
      }
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRate === 0 || !feedbackContent.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập nội dung và chọn số sao!",
        position: "top",
      });
      return;
    }
    if (!medicalReport?.id) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không tìm thấy ID báo cáo y tế!",
        position: "top",
      });
      return;
    }
    try {
      const body: FeedbackType = {
        content: feedbackContent,
        "medical-record-id": String(medicalReport.id),
        "nurse-id": String(nurseId),
        "patient-name": String(selectName),
        service: String(appointments?.package.name),
        star: String(feedbackRate),
      };
      await nurseApiRequest.submitFeedback(body);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: feedbackData
          ? "Đánh giá của bạn đã được cập nhật!"
          : "Đánh giá của bạn đã được gửi!",
        position: "top",
      });
      setFeedbackContent("");
      setFeedbackRate(0);
      setIsFeedbackModalVisible(false);
      if (medicalReport.id) {
        await fetchFeedback(String(medicalReport.id));
      }
    } catch (error) {
      console.error("Error submitting/updating feedback:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể gửi/cập nhật đánh giá. Vui lòng thử lại!",
        position: "top",
      });
    }
  };

  const handleCancelAppointment = async () => {
    if (!packageId) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không tìm thấy ID gói dịch vụ!",
        position: "top",
      });
      return;
    }
    setIsCancelLoading(true);
    try {
      await appointmentApiRequest.cancelAppointment(String(packageId));
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Lịch hẹn đã được hủy!",
        position: "top",
      });
      setIsCancelModalVisible(false);
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể hủy lịch hẹn! Vui lòng thử lại.",
        position: "top",
      });
    } finally {
      setIsCancelLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setFeedbackRate(i)}>
          <Ionicons
            name={i <= feedbackRate ? "star" : "star-outline"}
            size={30}
            color={i <= feedbackRate ? "#FFD700" : "#A0A0A0"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAppointmentDetail();
      await fetchMedicalRecord();
      if (nurseId) {
        await fetchNurseInfo();
      }
      if (medicalReport?.id) {
        await fetchFeedback(String(medicalReport.id));
      }
    };

    fetchData();
  }, [medicalReport?.id]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          backgroundColor: "bg-amber-100",
          textColor: "text-amber-800",
          text: "Sắp tới",
        };
      case "waiting":
        return {
          backgroundColor: "bg-indigo-100",
          textColor: "text-indigo-800",
          text: "Chờ xác nhận",
        };
      case "success":
        return {
          backgroundColor: "bg-emerald-100",
          textColor: "text-emerald-800",
          text: "Hoàn thành",
        };
      case "confirmed":
        return {
          backgroundColor: "bg-sky-100",
          textColor: "text-sky-800",
          text: "Đã xác nhận",
        };
      case "cancel":
        return {
          backgroundColor: "bg-red-100",
          textColor: "text-red-800",
          text: "Đã hủy",
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
      return format(endTime, "hh:mm a");
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

  const handleOpenFeedbackModal = async () => {
    if (medicalReport?.id) {
      await fetchFeedback(String(medicalReport.id));
    } else {
      setFeedbackData(null);
      setFeedbackContent("");
      setFeedbackRate(0);
      if (!medicalReport?.id) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Báo cáo y tế không khả dụng!",
          position: "top",
        });
      }
    }
    setIsFeedbackModalVisible(true);
  };

  let formattedActTime = "Chưa bắt đầu";
  if (actTime && typeof actTime === "string") {
    try {
      const parsedActTime = parseISO(actTime);
      if (!isNaN(parsedActTime.getTime())) {
        formattedActTime = format(parsedActTime, "hh:mm a");
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
              borderRadius={9999}
            />
          ) : (
            <Image
              source={{
                uri:
                  detailNurseData?.["nurse-picture"] ||
                  "https://www.nursetogether.com/wp-content/uploads/2024/09/Registered-Nurse-Illustration-transparent.png",
              }}
              className="w-36 h-36 border-4 border-gray-200"
              borderRadius={9999}
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
              <Text className="text-gray-500 font-pmedium">
                {formattedActTime}
              </Text>
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
            {appointments?.package?.["payment-status"] === "unpaid" &&
              status !== "cancel" && (
                <TouchableOpacity
                  className="px-6 py-4 rounded-lg bg-[#1f1f1fe3]"
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

            {status !== "cancel" &&
              status === "confirmed" &&
              appointments?.package?.["payment-status"] === "unpaid" && (
                <TouchableOpacity
                  className="px-6 py-4 rounded-lg bg-red-500"
                  onPress={() => setIsCancelModalVisible(true)}
                  disabled={isCancelLoading}
                >
                  {isCancelLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-pbold text-center">
                      🗑️ Hủy lịch hẹn
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
                        Ghi chú:{" "}
                        {service["client-note"].length > 0
                          ? service["client-note"]
                          : "Không có ghi chú"}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-500 break-words">
                          Trạng thái:{" "}
                          {service.status === "done"
                            ? "Hoàn thành"
                            : "Chưa hoàn thành"}
                        </Text>
                        {service.status === "done" && (
                          <Text className="ml-2 text-green-500">✔</Text>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 font-pmedium">
                    Không có nhiệm vụ nào
                  </Text>
                )}
              </View>
            </View>

            <View className="mt-4 mx-2">
              <View className="flex-row justify-between items-center">
                <Text className="font-psemibold text-gray-700">
                  Tổng chi phí:
                </Text>
                <Text className="font-psemibold text-blue-600 break-words">
                  {appointments?.package?.["total-fee"]?.toLocaleString() ||
                    "0"}
                  VND
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="font-psemibold text-gray-700">
                  Tổng thời gian:
                </Text>
                <Text className="font-psemibold text-blue-600 break-words">
                  {totalDuration} phút
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-4 items-center justify-center">
          <TouchableOpacity
            className={`flex-1 w-full px-6 py-4 rounded-lg ${
              areAllTasksDone() ? "bg-green-500" : "bg-[#64CBDB]"
            }`}
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
          <View className="gap-2">
            <Text>
              {medicalReport && medicalReport?.["nursing-report"] !== ""
                ? medicalReport?.["nursing-report"]
                : "Chưa có báo cáo"}
            </Text>
          </View>
          {status === "success" && feedbackData && (
            <View className="mt-4 p-4 bg-gray-100 rounded-lg">
              <Text className="text-lg font-psemibold text-gray-700 mb-2">
                Đánh giá của bạn
              </Text>
              <View className="flex-row mb-2">
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={
                      i < parseInt(feedbackData.star) ? "star" : "star-outline"
                    }
                    size={20}
                    color={
                      i < parseInt(feedbackData.star) ? "#FFD700" : "#A0A0A0"
                    }
                  />
                ))}
              </View>
              <Text className="text-gray-600 font-pmedium">
                {feedbackData.content || "Không có nội dung phản hồi"}
              </Text>
            </View>
          )}
          {status === "success" && !feedbackData && (
            <TouchableOpacity
              className="mt-4 px-6 py-4 rounded-lg bg-sky-400 border shadow-2xl"
              onPress={handleOpenFeedbackModal}
              disabled={isMedicalReportLoading}
            >
              <Text className="text-white font-pbold text-center">
                ⭐ Gửi đánh giá
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="mb-10"></View>

        <Modal
          visible={isCancelModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-lg w-[90%]">
              <Text className="text-xl font-pbold text-center mb-4">
                Xác nhận hủy lịch hẹn
              </Text>
              {isCancelLoading ? (
                <View className="flex justify-center items-center my-4">
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : (
                <>
                  <Text className="text-base text-gray-500 mb-4 text-center">
                    Bạn có chắc chắn muốn hủy lịch hẹn này không?
                  </Text>
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      className="flex-1 bg-gray-300 py-3 px-4 rounded-lg mr-2"
                      onPress={() => setIsCancelModalVisible(false)}
                    >
                      <Text className="text-gray-800 font-pmedium text-center">
                        Hủy
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-red-500 py-3 px-4 rounded-lg ml-2"
                      onPress={handleCancelAppointment}
                    >
                      <Text className="text-white font-pmedium text-center">
                        Xác nhận
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={isFeedbackModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-lg w-[90%]">
              <Text className="text-xl font-pbold text-center mb-4">
                {feedbackData ? "Chỉnh sửa đánh giá" : "Gửi đánh giá"}
              </Text>
              {isFeedbackLoading ? (
                <View className="flex justify-center items-center my-4">
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : (
                <>
                  <Text className="text-base text-gray-500 mb-4">
                    Vui lòng nhập nội dung và chọn số sao:
                  </Text>
                  <View className="flex-row justify-center mb-4">
                    {renderStars()}
                  </View>
                  <TextInput
                    placeholder="Nhập nội dung đánh giá..."
                    value={feedbackContent}
                    onChangeText={setFeedbackContent}
                    multiline
                    numberOfLines={4}
                    className="border rounded-lg p-2 mb-4 h-32 text-gray-700"
                    style={{ textAlignVertical: "top", textAlign: "left" }}
                  />
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      className="flex-1 bg-gray-300 py-3 px-4 rounded-lg mr-2"
                      onPress={() => {
                        setFeedbackContent("");
                        setFeedbackRate(0);
                        setIsFeedbackModalVisible(false);
                      }}
                    >
                      <Text className="text-gray-800 font-pmedium text-center">
                        Hủy
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-[#64CBDB] py-3 px-4 rounded-lg ml-2"
                      onPress={handleFeedbackSubmit}
                    >
                      <Text className="text-white font-pmedium text-center">
                        Gửi
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailAppointmentScreen;
