import HeaderBack from "@/components/HeaderBack";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import appointmentApiRequest from "@/app/api/appointmentApi";
import {
  Appointment,
  CreateAppointment,
  PackageData,
  PatientData,
  Service,
} from "@/types/appointment";
import invoiceApiRequest from "@/app/api/invoiceApi";
import { addMinutes, format } from "date-fns";

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

const ConfirmScreen = () => {
  const { packageInfo, patient, listDate, duration, discount, day } =
    useLocalSearchParams();
  const packageData: PackageData | null = safeParse(packageInfo, "packageInfo");
  const patientData: PatientData | null = safeParse(patient, "patient");
  let listDateData: Appointment[] | null = safeParse(listDate, "listDate");

  if (listDateData) {
    listDateData = listDateData.map((appointment) => {
      if (appointment["nursing-id"] === null) {
        const { "nursing-id": _, ...rest } = appointment;
        return rest;
      }
      return appointment;
    });
  }

  const durationMinutes = Number(duration) || 0;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

    const submitListDateData = listDateData.map((appointment) => {
      const { "nurse-name": _, ...rest } = appointment;
      const formattedDate = rest.date.includes("+07:00")
        ? rest.date.replace("+07:00", "Z")
        : rest.date;
      return {
        ...rest,
        date: formattedDate,
      };
    });

    const submitData: CreateAppointment = {
      "date-nurse-mappings": submitListDateData,
      "patient-address": `${patientData.address},${patientData.ward},${patientData.district},${patientData.city}`,
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

    try {
      const response = await appointmentApiRequest.createAppointment(
        submitData
      );
      if (response) {
        const invoiceData = await fetchInvoice(response.payload["object-id"]);

        if (invoiceData) {
          router.push({
            pathname: "/(detail)/payment",
            params: {
              id: String(invoiceData[0]["cuspackage-id"]),
              qrCode: String(invoiceData[0]["qr-code"]),
            },
          });
        } else {
          throw new Error("Không lấy được dữ liệu invoice");
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="p-4 mt-4"
      >
        <View className="flex-row items-center mb-2">
          <HeaderBack />
          <Text className="text-2xl font-pbold mb-2 my-4 ml-4">Xác nhận</Text>
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
                  {listDateData.map((appointment, index) => {
                    const startTime = new Date(appointment.date);
                    const endTime = addMinutes(startTime, durationMinutes);
                    return (
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
                            {`Ngày ${index + 1}: ${format(
                              new Date(appointment.date),
                              "dd/MM/yyyy"
                            )}`}
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
                            {`${format(startTime, "HH:mm")} - ${format(
                              endTime,
                              "HH:mm"
                            )}`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
                <Text className="text-sm font-pmedium text-gray-400 mt-2 text-center">
                  Cuộn để xem thêm
                </Text>
              </View>
            ) : (
              listDateData.map((appointment, index) => {
                const startTime = new Date(appointment.date);
                const endTime = addMinutes(startTime, durationMinutes);
                return (
                  <View
                    key={index}
                    className="pb-2 border-b border-gray-200 last:border-b-0"
                  >
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color="#6b7280"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-base font-pmedium text-gray-700">
                        {`Ngày ${index + 1}: ${format(
                          new Date(appointment.date),
                          "dd/MM/yyyy"
                        )}`}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#6b7280"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-sm font-pmedium text-gray-600">
                        {`${format(startTime, "HH:mm")} - ${format(
                          endTime,
                          "HH:mm"
                        )}`}
                      </Text>
                    </View>
                    {appointment["nurse-name"] && (
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="person"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-sm font-pmedium text-gray-600">
                          {appointment["nurse-name"]}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )
          ) : (
            <Text className="text-base font-pmedium text-gray-400">
              Chưa có thông tin ngày giờ
            </Text>
          )}
        </View>

        <Text className="text-lg font-pbold mb-2 text-teal-500">
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
                    (Chi phí cơ bản: {service.baseCost.toLocaleString()} VND +{" "}
                    {service.additionalCost.toLocaleString()} VND)
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
                    {service.note.length > 0 ? service.note : "Không ghi chú"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        <Text className="text-lg font-pbold mt-2 text-teal-500">Xác nhận</Text>
        <View className="p-4 bg-white rounded-lg shadow">
          <View className="flex-row justify-between">
            <Text className="text-gray-600 font-pbold">Tổng thời gian:</Text>
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
        </View>
      </View>
    </View>
  );
};

export default ConfirmScreen;
