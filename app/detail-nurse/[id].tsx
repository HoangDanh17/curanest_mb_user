import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";

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

  const [currentWeekDays, setCurrentWeekDays] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate] = useState<Date>(new Date());

  useEffect(() => {
    const currentDay = currentDate.getDay();
    const currentMonday = new Date(currentDate);
    currentMonday.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentMonday);
      day.setDate(currentMonday.getDate() + i);
      days.push(day);
    }
  
    setCurrentWeekDays(days);
    setSelectedDate(currentDate);
  }, [currentDate]);
  
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    return `${getDayOfWeek(date.toLocaleString("en-US", { weekday: "long" }))} ${day}`;
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView className="bg-gray-100 flex-1">
      <ScrollView>
        <View className="flex flex-row justify-center items-center">
          <View className="mt-2 bg-white rounded-xl shadow-md p-5 w-11/12 mb-4">
            <Image
              source={{ uri: nurseData.image }}
              className="w-32 h-32 rounded-lg mb-4 self-center"
            />

            <Text className="text-lg font-pbold text-center">
              {nurseData.name}
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              {nurseData.position}
            </Text>

            <View className="flex-row items-center mt-2 justify-center">
              <Text className="text-yellow-500 font-psemibold">
                ⭐ {nurseData.rating}
              </Text>
              <Text className="text-gray-500 text-sm ml-1">
                ({nurseData.reviews} đánh giá)
              </Text>
            </View>

            <View className="flex-row justify-between mt-4 w-full">
              <View className="items-center flex-1">
                <Text className="text-blue-600 font-psemibold">
                  {nurseData.location}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  📍 Nơi làm việc
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-blue-600 font-psemibold">
                  {nurseData.experience}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  🕒 Kinh nghiệm
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-blue-600 font-psemibold">
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
                    className="bg-blue-100 px-4 py-2 rounded-full border border-blue-200 shadow-sm"
                  >
                    <Text className="text-blue-600 text-sm font-medium">
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-gray-700 font-pbold">Lịch làm việc:</Text>
              <FlatList
                horizontal
                data={currentWeekDays}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectDate(item)}
                    className={`flex-col items-center mx-2 bg-gray-100 p-3 rounded-md ${
                      item.toDateString() === selectedDate?.toDateString()
                        ? "bg-blue-100"
                        : ""
                    }`}
                  >
                    <Text className="text-gray-600 text-sm">
                      {formatDate(item)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* <View className="mt-4">
              <Text className="text-gray-700 font-pbold">Các giờ :</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {nurseData.services.map((service, index) => (
                  <View
                    key={index}
                    className="bg-blue-100 px-4 py-2 rounded-full border border-blue-200 shadow-sm"
                  >
                    <Text className="text-blue-600 text-sm font-medium">
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </View> */}

            <TouchableOpacity className="bg-blue-500 p-3 rounded-md mt-6">
              <Text className="text-white font-psemibold text-center">
                Đặt lịch
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-20"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailNurseScreen;