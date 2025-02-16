import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import HeaderBack from "@/components/HeaderBack";
import { AvailabilityData, DayOfWeek, NurseData } from "@/types/nurse";

const DetailNurseScreen = () => {
  const nurseData: NurseData = {
    name: "Nguyễn Thị Lan",
    position: "Điều dưỡng Tâm lý tại Bệnh viện Tâm thần Trung ương",
    rating: 4.8,
    reviews: 60,
    location: "Hà Nội",
    experience: "10+ năm",
    patientsChecked: 1000,
    slogan: "Chăm sóc tận tâm, đồng hành cùng sức khỏe của bạn.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7mn8k9IJ3sZ6p4YEBJHkTHA_RKj0spVaUhA&s",
    services: [
      "Vật lý trị liệu",
      "Tắm rửa, vệ sinh cho người lớn tuổi",
      "Vật lý trị liệu chấn thương",
      "Vật lý trị liệu chuyên sâu",
    ],
  };

  const [twoWeekDays, setTwoWeekDays] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const nurseAvailability: AvailabilityData = {
    "2025-01-17": ["08:00 - 09:00", "11:00 - 12:00"],
    "2025-01-16": [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
    ],
    "2025-01-14": ["10:00 - 11:00", "14:00 - 15:00"],
    "2025-01-13": ["08:00 - 09:00", "15:00 - 16:00", "16:00 - 17:00"],
  };

  useEffect(() => {
    const initializeTwoWeeks = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days: Date[] = [];
      for (let i = 0; i < 14; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() + i);
        days.push(day);
      }

      setTwoWeekDays(days);
      setSelectedDate(today);
    };

    initializeTwoWeeks();
  }, []);

  const getAvailableTimeSlots = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return nurseAvailability[dateString] || [];
  };

  const hasSlotsForDate = (date: Date) => {
    return getAvailableTimeSlots(date).length > 0;
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
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

  const TimeSlotGrid = () => {
    const availableSlots = selectedDate
      ? getAvailableTimeSlots(selectedDate)
      : [];

    if (availableSlots.length === 0) {
      return (
        <View className="p-4">
          <Text className="text-gray-500 text-center">
            Không có ca trống trong ngày này
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-row flex-wrap">
        {availableSlots.map((slot) => {
          const isSelected = selectedTimeSlot === slot;
          return (
            <View key={slot} className="w-1/3 px-1 py-1">
              <TouchableOpacity
                onPress={() => setSelectedTimeSlot(slot)}
                className={`py-2 rounded-full border ${
                  isSelected
                    ? "bg-[#64D1CB] border-[#64D1CB]"
                    : "bg-white border-[#64D1CB]"
                }`}
              >
                <Text
                  className={`text-sm font-medium text-center ${
                    isSelected ? "text-white" : "text-[#64D1CB]"
                  }`}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const handlePreviousWeek = () => {
    if (currentWeek === 2) {
      setCurrentWeek(1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek === 1) {
      setCurrentWeek(2);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView className="bg-white h-full ">
        <View className="pt-4 pl-4">
          <HeaderBack />
        </View>
        <View className="flex flex-row justify-center items-center">
          <View className="mt-2 rounded-xl p-5 w-full mb-4">
            {/* Nurse Info Section */}
            <View className="flex flex-row p-4 bg-gray-50 rounded-xl shadow-md">
              <Image
                source={{ uri: nurseData.image }}
                className="w-40 h-4w-40 rounded-lg mr-4"
                resizeMode="cover"
              />
              <View className="flex-1 justify-between">
                <Text className="text-lg font-bold text-gray-800">
                  {nurseData.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {nurseData.position}
                </Text>
                <View className="flex-row items-center mt-3">
                  <Text className="text-yellow-500 font-semibold text-base">
                    ⭐ {nurseData.rating}
                  </Text>
                  <Text className="text-gray-500 text-sm ml-2">
                    ({nurseData.reviews} đánh giá)
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Section */}
            <View className="flex-row justify-between mt-4 w-full">
              <View className="items-center flex-1">
                <Text className="text-[#64D1CB] font-psemibold">
                  {nurseData.location}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  📍 Nơi làm việc
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#64D1CB] font-psemibold">
                  {nurseData.experience}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  🕒 Kinh nghiệm
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#64D1CB] font-psemibold">
                  {nurseData.patientsChecked}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">👥 Bệnh nhân</Text>
              </View>
            </View>

            {/* Slogan Section */}
            <View className="bg-yellow-100 p-3 mt-4 rounded-md">
              <Text className="text-yellow-700 text-center font-medium italic">
                {nurseData.slogan}
              </Text>
            </View>

            {/* Services Section */}
            <View className="mt-4">
              <Text className="text-gray-700 font-pbold">Dịch vụ:</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {nurseData.services.map((service, index) => (
                  <View
                    key={index}
                    className="bg-[#FEB60D] px-4 py-2 rounded-lg border border-[#FEB60D] shadow-md"
                  >
                    <Text className="text-white text-sm font-psemibold ">
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Calendar Section Header */}
            <View className="mt-4 px-4">
              <Text className="text-gray-800 text-lg font-bold mt-2">
                Lịch làm việc 2 tuần tới
              </Text>
            </View>

            {/* Calendar Days */}
            <View className="flex-row justify-between mt-4 px-2">
              {twoWeekDays.slice(0, 7).map((item, index) => {
                const isSelected =
                  item.toDateString() === selectedDate?.toDateString();
                const hasSlots = hasSlotsForDate(item);
                const isDisabled =
                  item.getTime() < new Date().setHours(0, 0, 0, 0);
                const isToday =
                  item.toDateString() === new Date().toDateString();

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => !isDisabled && handleSelectDate(item)}
                    disabled={isDisabled}
                    className={`flex items-center justify-center p-2 rounded-xl ${
                      isDisabled
                        ? "bg-gray-50 border border-gray-200"
                        : isSelected
                        ? "bg-[#64D1CB] border border-[#64D1CB]"
                        : hasSlots
                        ? "bg-white border border-[#64D1CB]"
                        : "bg-white border border-gray-200"
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
                          : "text-[#64D1CB]"
                      }`}
                    >
                      {getDayOfWeek(
                        item.toLocaleString("en-US", { weekday: "long" })
                      )}
                    </Text>
                    <Text
                      className={`text-base font-bold mt-1 ${
                        isDisabled
                          ? "text-gray-400"
                          : isSelected
                          ? "text-white"
                          : isToday
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Second week */}
            <View className="flex-row justify-between mt-4 px-2">
              {twoWeekDays.slice(7, 14).map((item, index) => {
                const isSelected =
                  item.toDateString() === selectedDate?.toDateString();
                const hasSlots = hasSlotsForDate(item);
                const isDisabled =
                  item.getTime() < new Date().setHours(0, 0, 0, 0);
                const isToday =
                  item.toDateString() === new Date().toDateString();

                return (
                  <TouchableOpacity
                    key={index + 7}
                    onPress={() => !isDisabled && handleSelectDate(item)}
                    disabled={isDisabled}
                    className={`flex items-center justify-center p-2 rounded-xl ${
                      isDisabled
                        ? "bg-gray-50 border border-gray-200"
                        : isSelected
                        ? "bg-[#64D1CB] border border-[#64D1CB]"
                        : hasSlots
                        ? "bg-white border border-[#64D1CB]"
                        : "bg-white border border-gray-200"
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
                          : "text-[#64D1CB]"
                      }`}
                    >
                      {getDayOfWeek(
                        item.toLocaleString("en-US", { weekday: "long" })
                      )}
                    </Text>
                    <Text
                      className={`text-base font-bold mt-1 ${
                        isDisabled
                          ? "text-gray-400"
                          : isSelected
                          ? "text-white"
                          : isToday
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Slots Section */}
            {selectedDate && (
              <View className="mt-6">
                <Text className="text-gray-800 text-lg font-bold mb-4 px-4">
                  Các khung giờ hiện có
                </Text>
                <View className="px-3">
                  <TimeSlotGrid />
                </View>
              </View>
            )}

            {/* Booking Button */}
            <TouchableWithoutFeedback>
              <View
                className={`bg-[#A8E0E9] p-3 rounded-md mt-6 ${
                  !selectedTimeSlot && "opacity-50"
                }`}
              >
                <Text
                  className="text-white font-psemibold text-center"
                  onPress={() => router.push("/(create)/create-appoinment")}
                >
                  Đặt lịch
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View className="mb-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailNurseScreen;
