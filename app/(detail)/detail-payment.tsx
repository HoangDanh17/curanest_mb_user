import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { AppointmentDetail, AppointmentList } from "@/types/appointment";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, addMinutes } from "date-fns";
import invoiceApiRequest from "@/app/api/invoiceApi";
import { STATUS_STYLES } from "@/app/(profile)/payment-history";
import { fetchPatientName } from "@/app/_layout";

export async function fetchAppointmentDetail(
  id: string
): Promise<AppointmentList[] | null> {
  try {
    const response = await appointmentApiRequest.getAppointmentPaymentDetail(id);
    return response.payload.data;
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return null;
  }
}

export async function fetchAppointmentDetailName(
  id: string,
  date: string
): Promise<AppointmentDetail | null> {
  try {
    const response = await appointmentApiRequest.getAppointmentDetail(id, date);
    return response.payload.data;
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return null;
  }
}

const DetailPaymentScreen = () => {
  const { id } = useLocalSearchParams();
  const [appointments, setAppointments] = useState<AppointmentList[] | null>(null);
  const [detailAppointment, setDetailAppointment] = useState<AppointmentDetail | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointment = async () => {
      if (typeof id === "string") {
        const data = await fetchAppointmentDetail(id);
        if (data) {
          // Đảo ngược danh sách lịch hẹn
          const reversedData = [...data].reverse();
          const detail = await fetchAppointmentDetailName(id, reversedData[0]["est-date"]);
          setDetailAppointment(detail);
          setAppointments(reversedData);
        }
      }
    };
    loadAppointment();
  }, [id]);

  useEffect(() => {
    const handleBackPress = () => {
      router.push("/payment-history");
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

  const getEndTime = (estDate: string, duration: number) => {
    const startDate = new Date(estDate);
    const endDate = addMinutes(startDate, duration);
    return format(endDate, "dd/MM/yyyy HH:mm a");
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(String(id));
      if (!id) return;
      const response = await invoiceApiRequest.getInvoice(String(id));
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

  const handleDetail = async (appointment: AppointmentList) => {
    const patientName = await fetchPatientName(appointment["patient-id"]);
    router.push({
      pathname: "/detail-appointmentHistory",
      params: {
        id: String(appointment.id),
        packageId: appointment["cuspackage-id"],
        nurseId: appointment["nursing-id"],
        patientId: appointment["patient-id"],
        date: appointment["est-date"],
        status: appointment.status,
        actTime: appointment["act-date"],
        selectName: String(patientName),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.push("/payment-history")}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={30} color="#64C1DB" />
        </TouchableOpacity>

        {appointments && appointments.length > 0 ? (
          <View style={styles.card}>
            <View className="flex-row items-center justify-between">
              <Text style={styles.cardTitle} className="mt-2">
                Thông tin chung
              </Text>
              <View className="flex w-auto items-center">
                <Text
                  className={`text-md font-bold inline-flex items-center p-2 px-4 rounded-full ${
                    STATUS_STYLES[appointments[0]["is-paid"] === true ? "paid" : "unpaid"]?.textColor || "text-gray-800"
                  } ${
                    STATUS_STYLES[appointments[0]["is-paid"] === true ? "paid" : "unpaid"]?.backgroundColor || "bg-gray-100"
                  }`}
                >
                  {STATUS_STYLES[appointments[0]["is-paid"] === true ? "paid" : "unpaid"]?.label || appointments[0]["is-paid"]}
                </Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Thời lượng:</Text>
                <Text style={styles.value}>
                  {appointments[0]["total-est-duration"]} phút
                </Text>
              </View>
              <View className="flex-col items-start gap-2">
                <Text style={styles.label}>Gói dịch vụ:</Text>
                <Text style={styles.value}>
                  {detailAppointment?.package.name}
                </Text>
              </View>
              <View className="flex-col items-start gap-2">
                <Text style={styles.label}>Địa chỉ:</Text>
                <Text style={styles.value}>
                  {appointments[0]["patient-address"]}
                </Text>
              </View>
            </View>

            <Text style={[styles.cardTitle, styles.subTitle]}>
              Danh sách lịch hẹn
            </Text>
            {appointments.map((appointment, index) => (
              <View key={index} style={styles.subCard}>
                <Text style={styles.subCardTitle}>
                  Lịch hẹn ngày {index + 1}
                </Text>
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Giờ bắt đầu:</Text>
                    <Text style={styles.value}>
                      {format(new Date(appointment["est-date"]), "dd/MM/yyyy HH:mm a")}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Giờ kết thúc:</Text>
                    <Text style={styles.value}>
                      {getEndTime(appointment["est-date"], appointment["total-est-duration"])}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleDetail(appointment)}
                  >
                    <Text style={styles.detailButtonText}>Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Nút Thanh toán ngay - Chỉ hiển thị nếu chưa thanh toán */}
            {appointments && appointments.length > 0 && !appointments[0]["is-paid"] && (
              <TouchableOpacity
                style={[styles.payButton, paymentLoading === id && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={paymentLoading === id}
              >
                <Text style={styles.payButtonText}>
                  {paymentLoading === id ? "Đang xử lý..." : "Thanh toán ngay"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "column",
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    width: 120,
  },
  value: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  subCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  subCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  payButton: {
    backgroundColor: "#64C1DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 20,
  },
  payButtonDisabled: {
    backgroundColor: "#A0D8E8",
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailButton: {
    borderWidth: 1,
    borderColor: "#64C1DB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64C1DB",
  },
});

export default DetailPaymentScreen;