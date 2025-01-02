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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import HeaderBack from "@/components/HeaderBack";

type NurseData = {
  name: string;
  position: string;
  rating: number;
  reviews: number;
  location: string;
  experience: string;
  patientsChecked: number;
  slogan: string;
  image: string;
  services: string[];
};

interface DayOfWeek {
  [key: string]: string;
}

type AvailabilityData = {
  [key: string]: string[];
};

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

  const [currentWeekDays, setCurrentWeekDays] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const nurseAvailability: AvailabilityData = {
    "2024-12-25": ["08:00 - 09:00", "11:00 - 12:00"],
    "2024-12-26": [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
    ],
    "2025-01-07": ["10:00 - 11:00", "14:00 - 15:00"],
    "2025-01-08": ["08:00 - 09:00", "15:00 - 16:00", "16:00 - 17:00"],
  };

  useEffect(() => {
    const updateWeekDays = (referenceDate: Date) => {
      const currentDay = referenceDate.getDay();
      const currentMonday = new Date(referenceDate);
      currentMonday.setDate(
        referenceDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
      );

      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentMonday);
        day.setDate(currentMonday.getDate() + i);
        days.push(day);
      }

      setCurrentWeekDays(days);
      setSelectedDate(new Date(referenceDate));
    };

    updateWeekDays(currentDate);
  }, [currentDate]);

  const getAvailableTimeSlots = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return nurseAvailability[dateString] || [];
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);

    if (newDate.getTime() >= new Date().setHours(0, 0, 0, 0)) {
      setCurrentDate(newDate);
    }
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
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

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView>
        <HeaderBack/>
        <View className="flex flex-row justify-center items-center">
          <View className="mt-2 rounded-xl p-5 w-full mb-4">
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

            <View className="bg-yellow-100 p-3 mt-4 rounded-md">
              <Text className="text-yellow-700 text-center font-medium italic">
                {nurseData.slogan}
              </Text>
            </View>

            <View className="mt-4">
              <Text className="text-gray-700 font-pbold">Dịch vụ:</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {nurseData.services.map((service, index) => (
                  <View
                    key={index}
                    className="bg-[#64D1CB] px-4 py-2 rounded-lg border border-blue-200 shadow-md"
                  >
                    <Text className="text-white text-sm font-psemibold ">
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4 flex-row justify-between items-center px-4">
              <Text className="text-gray-800 text-lg font-bold">
                Lịch làm việc tuần này
              </Text>

              <View className="flex-row mt-4">
                <TouchableOpacity
                  onPress={handlePreviousWeek}
                  className="p-2 bg-gray-100 rounded-full"
                  disabled={
                    currentWeekDays[0] &&
                    currentWeekDays[0].getTime() <
                      new Date().setHours(0, 0, 0, 0)
                  }
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={
                      currentWeekDays[0] &&
                      currentWeekDays[0].getTime() <
                        new Date().setHours(0, 0, 0, 0)
                        ? "lightgray"
                        : "gray"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNextWeek}
                  className="p-2 bg-gray-100 rounded-full ml-4"
                >
                  <Ionicons name="chevron-forward" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row justify-between flex-1 mx-2">
                {currentWeekDays.map((item, index) => {
                  const isSelected =
                    item.toDateString() === selectedDate?.toDateString();
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSelectDate(item)}
                      className={`flex justify-center items-center p-2 rounded-2xl ${
                        isSelected
                          ? "bg-[#64D1CB] border border-[#64D1CB]"
                          : "bg-white border-2 border-[#64D1CB]"
                      }`}
                      style={{
                        width: 45,
                        height: 60,
                      }}
                    >
                      <Text
                        className={`text-md font-pbold ${
                          isSelected ? "text-white" : "text-[#64D1CB]"
                        }`}
                      >
                        {item.getDate()}
                      </Text>
                      <Text
                        className={`text-sm font-semibold ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {getDayOfWeek(
                          item.toLocaleString("en-US", { weekday: "long" })
                        )}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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

            <TouchableWithoutFeedback>
              <View
                className={`bg-[#A8E0E9] p-3 rounded-md mt-6 ${
                  !selectedTimeSlot && "opacity-50"
                }`}
              >
                <Text className="text-white font-psemibold text-center" onPress={()=>router.push("/(create)/create-appoinment")}>
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
