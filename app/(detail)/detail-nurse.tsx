import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import HeaderBack from "@/components/HeaderBack";
import { DayOfWeek, DetailNurse } from "@/types/nurse";
import nurseApiRequest from "@/app/api/nurseApi";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { NurseSchedule } from "@/types/appointment";
import { format, addDays, startOfDay } from "date-fns";

const formatDateToYYYYMMDD = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

const DetailNurseScreen = () => {
  const { idNurse, id } = useLocalSearchParams();
  const [detailData, setDetailData] = useState<DetailNurse>();
  const [twoWeekDays, setTwoWeekDays] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<NurseSchedule[]>([]);

  const today = startOfDay(new Date());

  async function fetchAppointments(dateFrom: string, dateTo: string) {
    try {
      const response = await appointmentApiRequest.getNurseDate(
        String(idNurse),
        dateFrom,
        dateTo
      );
      setAppointments(response.payload.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await nurseApiRequest.getDetailNurse(idNurse);
      setDetailData(response.payload.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeTwoWeeks = () => {
    const days: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const day = startOfDay(addDays(today, i));
      days.push(day);
    }
    setTwoWeekDays(days);
    const dateFrom = formatDateToYYYYMMDD(days[0]); 
    const dateTo = formatDateToYYYYMMDD(days[days.length - 1]);
    fetchAppointments(dateFrom, dateTo);
  };

  useEffect(() => {
    initializeTwoWeeks();
    fetchData();
  }, []);

  const hasAppointmentsForDate = (date: Date): boolean => {
    const dateString = formatDateToYYYYMMDD(date);
    return appointments.some((appointment) => {
      const appointmentDate = startOfDay(new Date(appointment["est-date"]));
      const appointmentDateString = formatDateToYYYYMMDD(appointmentDate);
      return (
        appointmentDateString === dateString && appointment.status !== "cancel"
      );
    });
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    router.push({
      pathname: "/detail-schedule",
      params: {
        id: String(id),
        idNurse: String(idNurse),
        selectedDate: date.toISOString(),
        detailData: JSON.stringify(detailData),
      },
    });
  };

  const getDayOfWeek = (day: string): string => {
    const daysOfWeek: DayOfWeek = {
      Monday: "T2",
      Tuesday: "T3",
      Wednesday: "T4",
      Thursday: "T5",
      Friday: "T6",
      Saturday: "T7",
      Sunday: "CN",
    };
    return daysOfWeek[day] || day;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="bg-transparent h-full mt-4">
        <View className="pt-4 pl-4">
          <HeaderBack />
        </View>
        <View className="flex flex-row justify-center items-center">
          <View className="mt-2 rounded-xl p-5 w-full mb-4 bg-white shadow-md">
            <View className="flex flex-row p-4 bg-gray-50 rounded-xl">
              <Image
                source={{ uri: detailData?.["nurse-picture"] }}
                className="w-40 h-32 rounded-lg mr-4"
                resizeMode="contain"
              />
              <View className="flex-1 justify-between">
                <Text className="text-lg font-bold text-gray-800">
                  {detailData?.["nurse-name"]}
                </Text>
                <Text className="text-md font-pmedium text-gray-600 mt-1">
                  {detailData?.["current-work-place"]}
                </Text>
                <View className="flex-row items-center mt-3">
                  <Text className="text-yellow-500 font-psemibold text-lg">
                    ⭐ {detailData?.rate}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 w-full">
              <View className="border-b border-gray-300 pb-2 mb-2 gap-2">
                <Text className="text-md text-gray-700 font-pbold">
                  📍 Nơi làm việc
                </Text>
                <Text className="text-[#64D1CB] font-psemibold mb-2">
                  {detailData?.city}
                </Text>
              </View>

              <View className="border-b border-gray-300 pb-2 mb-2 gap-2">
                <Text className="text-md text-gray-700 font-pbold">
                  🕒 Kinh nghiệm
                </Text>
                <Text className="text-[#64D1CB] font-psemibold mb-2">
                  {detailData?.experience}
                </Text>
              </View>

              <View className="border-b border-gray-300 pb-2 mb-2 gap-2">
                <Text className="text-md text-gray-700 font-pbold">
                  📓 Học vấn
                </Text>
                <Text className="text-[#64D1CB] font-psemibold mb-2">
                  {detailData?.["education-level"]}
                </Text>
              </View>
            </View>

            <View className="bg-yellow-100 p-3 mt-4 rounded-2xl">
              <Text className="text-yellow-700 text-center font-medium italic">
                {detailData?.slogan}
              </Text>
            </View>

            <View className="mt-4">
              <Text className="text-gray-700 font-pbold">Dịch vụ:</Text>
              <View className="mt-2 gap-4">
                {detailData?.certificate &&
                  detailData.certificate.split("-").map((service, index) => (
                    <View
                      key={index}
                      className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-100 shadow-md"
                    >
                      <Text className="text-gray-700 text-sm font-psemibold">
                        • {service.trim()}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            <View className="mt-4 px-4">
              <Text className="text-gray-800 text-lg font-bold mt-2">
                Lịch làm việc
              </Text>
            </View>

            <FlatList
              data={twoWeekDays}
              keyExtractor={(item) => item.toISOString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
              renderItem={({ item }) => {
                const isSelected =
                  selectedDate &&
                  formatDateToYYYYMMDD(item) ===
                    formatDateToYYYYMMDD(selectedDate);
                const hasAppointment = hasAppointmentsForDate(item);
                const isDisabled = item.getTime() < today.getTime();
                const isToday =
                  formatDateToYYYYMMDD(item) === formatDateToYYYYMMDD(today);

                return (
                  <TouchableOpacity
                    onPress={() => !isDisabled && handleSelectDate(item)}
                    disabled={isDisabled}
                    className={`flex items-center justify-center p-2 rounded-xl mr-2 ${
                      isDisabled
                        ? "bg-gray-50 border border-gray-200"
                        : isSelected
                        ? "bg-[#64D1CB] border border-[#64D1CB]"
                        : hasAppointment
                        ? "bg-green-100 border border-green-400"
                        : "bg-white on border border-gray-200"
                    }`}
                    style={{
                      width: 45,
                      height: 65,
                    }}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isDisabled
                          ? "text-gray-400"
                          : isSelected
                          ? "text-white"
                          : hasAppointment
                          ? "text-green-600"
                          : "text-[#64D1CB]"
                      }`}
                    >
                      {getDayOfWeek(format(item, "EEEE"))}
                    </Text>
                    <Text
                      className={`text-base font-bold mt-1 ${
                        isDisabled
                          ? "text-gray-400"
                          : isSelected
                          ? "text-white"
                          : isToday
                          ? "text-green-600"
                          : hasAppointment
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(create)/choose-profile",
                  params: {
                    id: String(id),
                    nurseInfo: JSON.stringify(detailData),
                  },
                })
              }
              className="bg-[#A8E0E9] p-3 rounded-md mt-6"
            >
              <Text className="text-white font-psemibold text-center">
                Đặt lịch
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailNurseScreen;
