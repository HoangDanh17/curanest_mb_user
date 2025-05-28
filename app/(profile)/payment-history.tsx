import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  Pressable,
  Platform,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Patient } from "@/types/patient";
import patientApiRequest from "@/app/api/patientApi";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { InvoiceList } from "@/types/invoice";
import { format, isSameDay } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import invoiceApiRequest from "@/app/api/invoiceApi";
import { router } from "expo-router";

export const STATUS_STYLES: Record<
  string,
  { textColor: string; backgroundColor: string; label: string }
> = {
  paid: {
    textColor: "text-emerald-800",
    backgroundColor: "bg-emerald-100",
    label: "Đã thanh toán",
  },
  unpaid: {
    textColor: "text-amber-800",
    backgroundColor: "bg-amber-100",
    label: "Chưa thanh toán",
  },
};

const PaymentHistoryScreen = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [invoiceList, setInvoiceList] = useState<InvoiceList[]>([]);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const handlePayment = async (packageId: string) => {
    try {
      setPaymentLoading(packageId);
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
      setPaymentLoading(null);
    }
  };

  const handleViewDetails = async (packageId: string) => {
    router.push({
      pathname: "/detail-payment",
      params: {
        id: String(packageId),
      },
    });
  };

  async function fetchPatientList() {
    try {
      setIsLoading(true);
      const response = await patientApiRequest.getAllPatient();
      setPatientList(response.payload.data);
    } catch (error) {
      console.error("Error fetching patient list:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchInvoiceList() {
    try {
      setIsLoading(true);
      const patientIds = patientList.map((patient) => patient.id);
      const body = {
        "patient-ids": patientIds.length > 0 ? patientIds : ["123"],
      };
      const response = await appointmentApiRequest.getInvoiceList(body);
      setInvoiceList(response.payload.data);
    } catch (error) {
      console.error("Error fetching invoice list:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPatientList();
  }, []);

  useEffect(() => {
    if (patientList.length > 0) {
      fetchInvoiceList();
    }
  }, [patientList]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm dd/MM/yyyy");
  };

  const handleDateChange = (event: any, selected: Date | undefined) => {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "dismissed" || !selected) {
      return;
    }
    setSelectedDate(selected);
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Tìm theo ngày";
    return date.toLocaleDateString("vi-VN");
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(true);
  };

  const filteredData = invoiceList.filter((item) => {
    const invoiceDate = new Date(item["created-at"]);
    return !selectedDate || isSameDay(invoiceDate, selectedDate);
  });

  const buttonStyle = {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
  };

  useEffect(() => {
    const handleBackPress = () => {
      router.push("/(tabs)/profile");
      return true;
    };

    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    }

    return () => {
      if (Platform.OS === "android") {
        BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
      }
    };
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          className="rounded-full mt-4"
        >
          <Ionicons name="chevron-back" size={30} color="#64C1DB" />
        </TouchableOpacity>
        <View className="flex-row justify-end gap-2">
          <Pressable style={buttonStyle} onPress={handleShowDatePicker}>
            <Text className="text-sm text-gray-800">
              {formatDate(selectedDate)}
            </Text>
          </Pressable>
          {selectedDate && (
            <Pressable style={buttonStyle} onPress={clearDate}>
              <Text className="text-sm text-gray-800">Xóa ngày</Text>
            </Pressable>
          )}
        </View>
      </View>

      {showDatePicker && (
        <View className="w-4/5 self-center">
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            onChange={handleDateChange}
          />
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
          {filteredData.length === 0 ? (
            <View className="flex justify-center items-center py-8">
              <MaterialIcons name="search-off" size={48} color="#666" />
              <Text className="text-gray-500 text-lg mt-2">
                Không có dữ liệu hóa đơn cho ngày đã chọn
              </Text>
            </View>
          ) : (
            filteredData.map((invoice) => (
              <View
                key={invoice.id}
                className="bg-white rounded-xl p-4 mb-4 shadow-sm"
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${
                      STATUS_STYLES[invoice.status]?.backgroundColor ||
                      "bg-gray-100"
                    }`}
                  >
                    <MaterialIcons
                      name="attach-money"
                      size={24}
                      color={
                        STATUS_STYLES[invoice.status]?.textColor
                          ?.replace("text-", "")
                          ?.replace("-800", "-600") || "#1976d2"
                      }
                    />
                  </View>

                  <View className="flex-1 gap-2">
                    <View className="flex w-auto items-start">
                      <Text
                        className={`text-md font-bold inline-flex items-center p-2 px-4 rounded-full ${
                          STATUS_STYLES[invoice.status]?.textColor ||
                          "text-gray-800"
                        } ${
                          STATUS_STYLES[invoice.status]?.backgroundColor ||
                          "bg-gray-100"
                        }`}
                      >
                        {STATUS_STYLES[invoice.status]?.label || invoice.status}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#666"
                      />
                      <Text className="ml-2 text-gray-800 font-pbold text-sm">
                        {formatDateTime(invoice["created-at"])}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text className="text-md font-bold text-blue-600">
                      + {formatCurrency(invoice["total-fee"])}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-center mt-4 gap-4">
                  {invoice.status === "unpaid" && (
                    <Pressable
                      className="bg-amber-500 rounded-lg px-4 py-2"
                      onPress={() => handlePayment(invoice["cuspackage-id"])}
                      disabled={paymentLoading === invoice["cuspackage-id"]}
                    >
                      {paymentLoading === invoice["cuspackage-id"] ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-sm">
                          Thanh toán ngay
                        </Text>
                      )}
                    </Pressable>
                  )}

                  <Pressable
                    className="bg-blue-500 rounded-lg px-4 py-2"
                    onPress={() => handleViewDetails(invoice["cuspackage-id"])}
                  >
                    <Text className="text-white font-bold text-sm">
                      Xem chi tiết
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
          <View className="mb-10"></View>
        </ScrollView>
      )}
    </View>
  );
};

export default PaymentHistoryScreen;
