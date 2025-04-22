import HeaderBack from "@/components/HeaderBack";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ListNurseData } from "@/types/nurse";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { CreateAppointment } from "@/types/appointment";
import invoiceApiRequest from "@/app/api/invoiceApi";
import { WebView } from "react-native-webview";
import { URL } from "react-native-url-polyfill"; // Dùng để parse URL

interface Service {
  id: string;
  name: string;
  quantity: number;
  baseCost: number;
  additionalCost: number;
  totalCost: number;
  duration: number;
  note: string;
  totalUnit: number;
}

interface PackageData {
  day: string;
  description: string;
  packageId: string;
  packageName: string;
  serviceId: string;
  services: Service[];
  totalDuration: number;
  totalPrice: number;
  discountedPrice?: number;
}

interface PatientData {
  address: string;
  city: string;
  "desc-pathology": string;
  district: string;
  dob: string;
  "full-name": string;
  id: string;
  "note-for-nurse": string;
  "phone-number": string;
  ward: string;
}

interface Appointment {
  day: number;
  date: string;
  formattedDate: string;
  startTime: string;
  endTime: string;
  duration: string;
}

const safeParse = (data: any, name: string) => {
  try {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data || null;
  } catch (error) {
    console.error(`Lỗi parse ${name}:`, error);
    return null;
  }
};

const convertToISODate = (dateStr: string, timeStr: string) => {
  const [day, month, year] = dateStr.split("/");

  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours, 10).toString();
  if (period === "PM" && hours !== "12") {
    hours = (parseInt(hours, 10) + 12).toString();
  } else if (period === "AM" && hours === "12") {
    hours = "00";
  }

  const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);

  if (isNaN(date.getTime())) {
    throw new Error("Ngày giờ không hợp lệ");
  }

  date.setHours(date.getHours() - 7); // Trừ 7 tiếng
  return date.toISOString();
};

const ConfirmScreen = () => {
  const { packageInfo, patient, listDate, nurseInfo, discount, day } =
    useLocalSearchParams();
  const packageData: PackageData | null = safeParse(packageInfo, "packageInfo");
  const patientData: PatientData | null = safeParse(patient, "patient");
  const listDateData: Appointment[] | null = safeParse(listDate, "listDate");
  const parsedNurseData: ListNurseData | null = safeParse(
    nurseInfo,
    "nurseInfo"
  );

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(""); // State để lưu payos-url và hiển thị WebView

  const fetchInvoice = async (svcpackageId: string) => {
    try {
      const response = await invoiceApiRequest.getInvoice(svcpackageId);
      return response.payload.data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return null;
    }
  };

  const convertDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours > 0 ? `${hours} tiếng` : ""} ${
      minutes > 0 ? `${minutes} phút` : ""
    }`.trim();
  };

  const handleNavigationChange = (navState: any) => {
    const { url } = navState;
    if (
      url.includes("https://curanest.com.vn/payment-result-success") ||
      url.includes("https://curanest.com.vn/payment-result-fail")
    ) {
      setPaymentUrl(""); // Đóng WebView

      const parsedUrl = new URL(url);
      const responseCode = parsedUrl.searchParams.get("code");
      console.log("Response Code:", responseCode);

      if (responseCode === "00") {
        setIsSuccess(true);
        setIsModalVisible(true);
      } else {
        setIsSuccess(false);
        setIsModalVisible(true);
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!listDateData || !packageData || !patientData) {
      console.log("Dữ liệu đầu vào không đầy đủ:", {
        listDateData,
        packageData,
        patientData,
      });
      setIsLoading(false);
      return;
    }

    const submitData: CreateAppointment = {
      dates: listDateData
        .map((appointment) => {
          try {
            return convertToISODate(appointment.date, appointment.startTime);
          } catch (error) {
            console.error("Lỗi khi chuyển đổi ngày giờ:", error);
            return null;
          }
        })
        .filter((date) => date !== null),
      "patient-id": patientData?.id || "",
      "svcpackage-id": packageData?.packageId || "",
      "task-infos": packageData.services.map((service) => ({
        "client-note": service.note || "",
        "est-duration": service.duration,
        "svctask-id": service.id,
        "total-cost": service.totalCost,
        "total-unit": service.totalUnit,
      })),
    };

    if (parsedNurseData && parsedNurseData["nurse-id"]) {
      submitData["nursing-id"] = parsedNurseData["nurse-id"];
    }

    try {
      const response = await appointmentApiRequest.createAppointment(
        submitData
      );
      if (response) {
        const invoiceData = await fetchInvoice(response.payload["object-id"]);

        if (invoiceData && invoiceData.length > 0) {
          const payosUrl = invoiceData[0]["payos-url"];
          if (payosUrl) {
            setPaymentUrl(payosUrl);
          } else {
            throw new Error("Không tìm thấy payos-url trong invoice data");
          }
        } else {
          throw new Error("Không lấy được dữ liệu invoice");
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi API:", error);
      setIsSuccess(false);
      setIsModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    setIsModalVisible(false);
    router.push("/(tabs)/home");
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const totalPrice = packageData?.totalPrice || 0;
  const totalServices = packageData?.services.length || 0;
  const totalDuration = packageData?.totalDuration || 0;
  const formattedDuration = convertDuration(totalDuration);

  const discountPercent = Number(discount) || 0;
  const numberOfDays = Number(day) || 1;
  const totalPricePerDay = totalPrice / numberOfDays;
  const discountedPricePerDay =
    discountPercent > 0
      ? totalPricePerDay * (1 - discountPercent / 100)
      : totalPricePerDay;
  const totalPriceWithDays = totalPrice;
  const discountedPriceWithDays =
    discountPercent > 0
      ? totalPriceWithDays * (1 - discountPercent / 100)
      : totalPriceWithDays;
  const hasDiscount = discountPercent > 0;

  if (!packageData || !patientData) {
    return (
      <View className="flex-1 bg-white mt-4">
        <Text className="text-center text-lg">
          Không có dữ liệu gói hoặc bệnh nhân
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {paymentUrl ? (
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationChange}
          style={{ flex: 1 }}
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            className="p-4 mt-4"
          >
            <View className="flex-row items-center mb-2">
              <HeaderBack />
              <Text className="text-2xl font-pbold mb-2 my-4 ml-4">
                Xác nhận
              </Text>
            </View>
            <Text className="text-lg font-pbold mb-2 text-teal-500">
              Khách hàng
            </Text>

            <View className="flex-row items-center mb-4 justify-center ml-4 mr-4 border rounded-2xl p-4 border-t-2 border-b-2">
              <Image
                source={{
                  uri: "https://st2.depositphotos.com/5266903/9710/i/450/depositphotos_97109236-stock-photo-medical-volunteer-circled-icon.jpg",
                }}
                className="w-20 h-20 rounded-lg mr-4"
              />
              <View className="flex-1">
                <Text className="text-lg font-pbold mb-1">
                  {patientData["full-name"]}
                </Text>
                <Text className="text-sm text-gray-500 mb-1 font-pmedium">
                  {patientData["phone-number"]}
                </Text>
                <Text className="text-sm text-gray-500 font-pmedium">
                  {`${patientData.address}, ${patientData.ward}, ${patientData.district}, ${patientData.city}`}
                </Text>
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-lg font-pbold mb-2 text-teal-500">
                Thông tin ngày giờ
              </Text>
              {listDateData && listDateData.length > 0 ? (
                listDateData.length > 3 ? (
                  <View className="border border-gray-300 rounded-lg bg-white p-4 shadow-sm">
                    <ScrollView
                      style={{ maxHeight: 160 }}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      {listDateData.map((appointment, index) => (
                        <View
                          key={index}
                          className="mb-4 pb-2 border-b border-gray-200 last:border-b-0"
                        >
                          <View className="flex-row items-center mb-1">
                            <MaterialIcons
                              name="calendar-today"
                              size={16}
                              color="#6b7280"
                              style={{ marginRight: 8 }}
                            />
                            <Text className="text-base font-pmedium text-gray-700">
                              {`Ngày ${appointment.day}: ${appointment.formattedDate}`}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <MaterialIcons
                              name="access-time"
                              size={16}
                              color="#6b7280"
                              style={{ marginRight: 8 }}
                            />
                            <Text className="text-sm font-pmedium text-gray-600">
                              {`${appointment.startTime} - ${appointment.endTime}`}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                    <Text className="text-sm font-pmedium text-gray-400 mt-2 text-center">
                      Cuộn để xem thêm
                    </Text>
                  </View>
                ) : (
                  listDateData.map((appointment, index) => (
                    <View
                      key={index}
                      className="mb-4 pb-2 border-b border-gray-200 last:border-b-0"
                    >
                      <View className="flex-row items-center mb-1">
                        <MaterialIcons
                          name="calendar-today"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-base font-pmedium text-gray-700">
                          {`Ngày ${appointment.day}: ${appointment.formattedDate}`}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="access-time"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-sm font-pmedium text-gray-600">
                          {`${appointment.startTime} - ${appointment.endTime}`}
                        </Text>
                      </View>
                    </View>
                  ))
                )
              ) : (
                <Text className="text-base font-pmedium text-gray-400">
                  Chưa có thông tin ngày giờ
                </Text>
              )}
            </View>
            {parsedNurseData && (
              <View className="mb-6">
                <Text className="text-lg font-pbold mb-2 text-teal-500">
                  Điều dưỡng đã chọn
                </Text>
                <View className="flex-row items-center p-4">
                  <Image
                    source={{
                      uri:
                        parsedNurseData["nurse-picture"] === ""
                          ? "https://i.pinimg.com/564x/a7/ff/90/a7ff9069f727d093e578528e2355ccff.jpg"
                          : parsedNurseData["nurse-picture"],
                    }}
                    className="w-16 h-16 rounded-lg mr-4"
                  />
                  <View>
                    <Text className="text-lg font-pbold">
                      {parsedNurseData["nurse-name"]}
                    </Text>
                    <Text className="text-sm text-gray-500 font-pmedium mt-2">
                      {parsedNurseData["current-work-place"]}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Text className="text-lg font-pbold mb-2 mt-2 text-teal-500">
              Gói dịch vụ đã chọn
            </Text>
            {packageData.services.map((service: Service, index: number) => (
              <View key={index} className="p-4 pt-2">
                <View className="pb-4 border-b border-gray-200">
                  <View className="gap-2">
                    <Text className="text-base font-pbold">
                      {index + 1}. {service.name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base text-gray-500 font-psemibold">
                        {convertDuration(service.duration)}
                      </Text>
                      <Text className="text-base text-gray-500 font-psemibold">
                        -
                      </Text>
                      <Text className="text-base font-pbold">
                        {service.totalCost.toLocaleString()} VND
                      </Text>
                    </View>
                    {service.additionalCost > 0 && (
                      <Text className="text-sm text-red-500 font-pmedium">
                        (Chi phí cơ bản: {service.baseCost.toLocaleString()} VND
                        + {service.additionalCost.toLocaleString()} VND)
                      </Text>
                    )}
                    <Text className="text-base font-psemibold text-gray-500">
                      Số lượng: {service.totalUnit}
                    </Text>
                    <View className="flex-row flex-wrap">
                      <Text className="text-base font-pbold mb-2 mr-2">
                        Ghi chú:
                      </Text>
                      <Text
                        className="text-base text-gray-600 font-pmedium flex-1"
                        style={{ flexWrap: "wrap" }}
                      >
                        {service.note.length > 0
                          ? service.note
                          : "Không ghi chú"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <Text className="text-lg font-pbold mt-2 text-teal-500">
              Xác nhận
            </Text>
            <View className="p-4 bg-white rounded-lg shadow">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-pbold">
                  Tổng thời gian:
                </Text>
                <Text className="text-red-600 font-pbold">
                  {totalDuration} phút
                </Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-gray-600 font-pbold">
                  Tổng giá {numberOfDays > 1 ? "1 ngày" : ""}:
                </Text>
                <View className="flex-col items-end">
                  {hasDiscount && (
                    <Text className="text-gray-500 font-pmedium line-through">
                      {totalPricePerDay.toLocaleString()} VND
                    </Text>
                  )}
                  <Text className="text-red-600 font-pbold">
                    {Math.round(discountedPricePerDay).toLocaleString()} VND
                  </Text>
                </View>
              </View>
              {numberOfDays > 1 && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-600 font-pbold">
                    Tổng giá ({numberOfDays} ngày):
                  </Text>
                  <View className="flex-col items-end">
                    {hasDiscount && (
                      <Text className="text-gray-500 font-pmedium line-through">
                        {totalPriceWithDays.toLocaleString()} VND
                      </Text>
                    )}
                    <Text className="text-red-600 font-pbold">
                      {Math.round(discountedPriceWithDays).toLocaleString()} VND
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-300">
            <View className="flex-row justify-between items-center w-full">
              <View>
                <View className="flex-col items-start">
                  <Text className="text-lg font-pbold text-red-500">
                    {Math.round(discountedPriceWithDays).toLocaleString()} VND
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 font-pmedium">
                  {totalServices} dịch vụ • {formattedDuration}
                </Text>
              </View>
              {!isModalVisible && (
                <TouchableOpacity
                  className="bg-[#64CbDB] py-3 px-6 rounded-lg"
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-pbold">Thanh toán</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-[90%]">
            <Image
              source={{
                uri: isSuccess
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbY8UK-BaW-W8oLqpI_Hd2kBMdjW6Q3CKBg&s"
                  : "https://cdn-icons-png.flaticon.com/512/6659/6659895.png",
              }}
              className="w-32 h-32 mx-auto mb-4 bg-white"
            />
            <Text className="text-xl font-pbold text-center mb-4">
              {isSuccess ? "Thành công!" : "Thất bại!"}
            </Text>
            <Text className="text-base text-gray-500 text-center mb-6">
              {isSuccess
                ? "Thanh toán đã được thực hiện thành công."
                : "Đã có lỗi xảy ra khi thực hiện thanh toán."}
            </Text>
            {isSuccess ? (
              <TouchableOpacity
                className="bg-[#64CbDB] py-3 px-6 rounded-lg"
                onPress={handleGoHome}
              >
                <Text className="text-white font-pbold text-center">
                  Về trang chủ
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="bg-[#64CbDB] py-3 px-6 rounded-lg"
                onPress={handleCloseModal}
              >
                <Text className="text-white font-pbold text-center">Đóng</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmScreen;
