import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import HeaderBack from "@/components/HeaderBack";

const DateAvailableScreen = () => {
  const { id, number, time } = useLocalSearchParams();

  const initialDate = time
    ? new Date(Array.isArray(time) ? time[0] : time)
    : new Date();

  const [dates, setDates] = useState<Date[]>(
    Array.from({ length: Number(number) }, (_, index) => {
      const date = new Date(initialDate);
      date.setDate(date.getDate() + index);
      return date;
    })
  );

  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(
    null
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null
  );
  const [isModalVisible, setModalVisible] = useState(false);

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${String(hour).padStart(2, "0")}:${minute}`;
  });

  const selectedDates = dates.map((date) => date.toISOString().split("T")[0]);

  const handleTimeSelect = (index: number, time: string) => {
    const newDates = [...dates];
    const [hours, minutes] = time.split(":").map(Number);
    newDates[index].setHours(hours, minutes);
    setDates(newDates);
    setModalVisible(false);
  };

  const handleDateSelect = (index: number, selectedDate: Date) => {
    const newDateString = selectedDate.toISOString().split("T")[0];
    const otherDates = selectedDates.filter((date, i) => i !== index);
    if (otherDates.includes(newDateString)) {
      Alert.alert("Thông báo", "Ngày đã được chọn. Vui lòng chọn ngày khác.");

      setTimeout(() => setSelectedDateIndex(null), 100);
      return;
    }

    const newDates = [...dates];
    newDates[index] = selectedDate;
    setDates(newDates);
    setSelectedDateIndex(null);
  };

  const openTimeModal = (index: number) => {
    setSelectedTimeIndex(index);
    setModalVisible(true);
  };

  const openDatePicker = (index: number) => {
    if (selectedDateIndex !== index) {
      setSelectedDateIndex(index);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <View className="flex flex-row">
        <HeaderBack />
        <Text className="text-xl font-bold mb-4 mt-2 ml-2">
          Ngày và giờ khả dụng
        </Text>
      </View>
      {dates.map((date, index) => {
        const isSelected = date.getHours() !== 0 || date.getMinutes() !== 0;

        return (
          <View key={index} className="mb-6">
            <Text className="text-lg font-semibold mb-2">Ngày {index + 1}</Text>

            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => openDatePicker(index)}
                className={`flex-1 border border-gray-300 p-2 rounded-full mr-2 ${
                  isSelected ? "bg-blue-100 border-blue-400" : "bg-gray-100"
                }`}
              >
                <Text className="text-gray-600 text-center font-pmedium">
                  {date.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openTimeModal(index)}
                className={`border border-gray-300 p-2 rounded-full w-28 ${
                  isSelected ? "bg-blue-100 border-blue-400" : "bg-gray-100"
                }`}
              >
                <Text className="text-gray-700 text-center font-pmedium">
                  {date.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedDateIndex === index && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) =>
                  handleDateSelect(index, selectedDate || date)
                }
              />
            )}
          </View>
        );
      })}
      <TouchableOpacity
        onPress={() => router.push("/select-type-and-time")}
        className="bg-[#64D1CB] px-6 py-3 rounded-2xl ml-auto mt-10"
      >
        <Text className="text-white text-base font-pbold text-center">
          Tiếp theo
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-4 rounded-xl w-96 max-h-96">
              <Text className="text-lg font-bold mb-4 text-center">
                Chọn giờ
              </Text>
              <FlatList
                data={timeSlots}
                keyExtractor={(item) => item}
                numColumns={3}
                contentContainerStyle={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleTimeSelect(selectedTimeIndex!, item)}
                    className="m-2 px-4 py-2 bg-blue-100 border border-blue-400 rounded-full"
                  >
                    <Text className="text-blue-600 text-center font-medium">
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

export default DateAvailableScreen;
