import appointmentApiRequest from "@/app/api/appointmentApi";
import patientApiRequest from "@/app/api/patientApi";
import { Patient } from "@/types/patient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppointmentList } from "@/types/appointment";
import { STATUS_STYLES } from "@/components/AppointmentCard";

const AppointmentHistoryScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<AppointmentList[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  async function fetchAppointments(patientId: string) {
    try {
      setIsLoading(true);
      const response = await appointmentApiRequest.getListAppointment(
        patientId
      );
      setAppointments(response.payload.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPatientList();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      fetchAppointments(selectedProfile);
    }
  }, [selectedProfile]);

  // Lọc appointment theo ngày được chọn
  const filteredAppointments = appointments.filter((appointment) => {
    if (!selectedDate) return true;
    const appointmentDate = new Date(appointment["est-date"]).toDateString();
    return appointmentDate === selectedDate.toDateString();
  });

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedProfile) {
      fetchAppointments(selectedProfile);
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Xử lý khi chọn ngày từ date picker
  const handleDateChange = (event: any, selected: Date | undefined) => {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "dismissed" || !selected) {
      return;
    }
    setSelectedDate(selected);
  };

  // Xóa ngày đã chọn
  const clearDate = () => {
    setSelectedDate(null);
  };

  // Format ngày hiển thị
  const formatDate = (date: Date | null) => {
    if (!date) return "Tìm theo ngày";
    return date.toLocaleDateString("vi-VN");
  };

  // Xử lý khi nhấn nút chọn ngày
  const handleShowDatePicker = () => {
    if (!selectedProfile) {
      alert("Vui lòng chọn hồ sơ bệnh nhân trước!");
      return;
    }
    setShowDatePicker(true);
  };

  return (
    <View className="flex-1 p-4 px-2 bg-white">
      {/* Danh sách bệnh nhân */}
      <View className="bg-white pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          <View className="flex flex-row gap-3">
            {patientList.map((patient, index) => (
              <TouchableOpacity
                key={index}
                className={`flex flex-row items-center px-4 py-2.5 rounded-full ${
                  selectedProfile === patient.id
                    ? "bg-[#64DBDB]"
                    : "border border-gray-800"
                }`}
                onPress={() => {
                  setSelectedProfile(patient.id);
                  setSelectedDate(null); // Reset ngày khi chọn bệnh nhân mới
                }}
              >
                <Image
                  source={{
                    uri: "https://media.istockphoto.com/id/1459373176/vi/vec-to/n%E1%BB%81n-b%E1%BB%8B-m%E1%BA%A5t-n%C3%A9t-tr%E1%BB%ABu-t%C6%B0%E1%BB%A3ng-m%C3%B9a-xu%C3%A2n-m%C3%B9a-h%C3%A8-bi%E1%BB%83n.jpg?s=612x612&w=0&k=20&c=7qcezfnEnWLDiqaxq5ahyhNl6zTCLZbNQ9wQjeRT7F0=",
                  }}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <Text
                  className={`text-sm font-pmedium ${
                    selectedProfile === patient.id
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {patient["full-name"]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="flex-row justify-end mb-4 items-center gap-2">
        <Pressable
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          onPress={handleShowDatePicker}
        >
          <Text className="text-sm text-gray-800">
            {formatDate(selectedDate)}
          </Text>
        </Pressable>
        {selectedDate && (
          <Pressable
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
            onPress={clearDate}
          >
            <Text className="text-sm text-gray-800">Xóa ngày</Text>
          </Pressable>
        )}
      </View>

      {/* Date Picker */}
      {showDatePicker && selectedProfile && (
        <View className="w-4/5 self-center">
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            onChange={handleDateChange}
          />
        </View>
      )}

      {/* Danh sách appointment */}
      {isLoading ? (
        <View className="flex justify-center items-center my-4">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView
          className="p-2"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          fadingEdgeLength={0}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0000ff"]}
              tintColor="#0000ff"
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {!isLoading && filteredAppointments.length === 0 ? (
            <View className="flex-1 justify-center items-center my-4">
              <Image
                source={{
                  uri: "https://cdni.iconscout.com/illustration/premium/thumb/man-with-no-schedule-illustration-download-in-svg-png-gif-file-formats--calendar-appointment-empty-state-pack-people-illustrations-10920936.png",
                }}
                className="w-64 h-64 mb-2"
                resizeMode="contain"
              />
              <Text className="text-lg text-gray-600">
                Không có lịch hẹn phù hợp
              </Text>
            </View>
          ) : (
            filteredAppointments.map((appointment) => (
              <View
                key={appointment.id}
                className="mb-4 border border-gray-200 rounded-xl bg-white p-4"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-col items-start">
                    <Text
                      className={`text-sm font-pmedium ${
                        STATUS_STYLES[appointment.status].textColor
                      } px-2 py-1 rounded-2xl ${
                        STATUS_STYLES[appointment.status].backgroundColor
                      } ${STATUS_STYLES[appointment.status].borderColor}`}
                    >
                      {STATUS_STYLES[appointment.status].label}
                    </Text>
                    <Text className="text-md font-pmedium mt-2">
                      Lịch hẹn -{" "}
                      {new Date(appointment["est-date"]).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-teal-400 px-4 py-2 rounded-lg"
                    onPress={() => {
                      router.push({
                        pathname: "/detail-appointment",
                        params: {
                          id: String(appointment.id),
                          packageId: appointment["cuspackage-id"],
                          nurseId: appointment["nursing-id"],
                          patientId: appointment["patient-id"],
                          date: appointment["est-date"],
                          status: appointment.status,
                        },
                      });
                    }}
                  >
                    <Text className="text-white font-psemibold">Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default AppointmentHistoryScreen;
