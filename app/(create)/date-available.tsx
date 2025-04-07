import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar } from "react-native-calendars";
import HeaderBack from "@/components/HeaderBack";
import WheelScrollPicker from "react-native-wheel-scrollview-picker";
import { Text } from "react-native";

const DateAvailableScreen = () => {
  const { id, day, totalDuration, packageInfo, timeInter, patient } =
    useLocalSearchParams();

  const duration = Number(totalDuration);
  const numDays = Math.max(Number(day), 1);
  const interval = Number(timeInter);

  const [dates, setDates] = useState<Date[]>(
    Array.from({ length: numDays }, (_, index) => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + index * interval);
      newDate.setHours(8, 0, 0, 0);
      return newDate;
    })
  );

  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(
    null
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null
  );
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState<string>("08");
  const [tempMinute, setTempMinute] = useState<string>("00");
  const [pickerKey, setPickerKey] = useState<number>(0);

  const hours: string[] = Array.from({ length: 14 }, (_, i) =>
    String(i + 8).padStart(2, "0")
  );
  const minutes: string[] = ["00", "15", "30", "45"];

  const selectedDates = dates.map((date) => date.toISOString().split("T")[0]);

  const formatTimeWithAmPm = (time: string): string => {
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return `${hour}:${minute} ${period}`;
  };

  const calculateEndTime = (date: Date) => {
    const endDate = new Date(date.getTime() + duration * 60000);
    if (endDate.getHours() >= 22 && endDate.getMinutes() > 0) {
      endDate.setHours(22, 0, 0, 0);
    }
    const hours = endDate.getHours();
    const minutes = endDate.getMinutes().toString().padStart(2, "0");
    let hour12 = hours % 12 || 12;
    const period = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${period}`;
  };

  const formatSelectedDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateToVietnamese = (date: Date): string => {
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const weekday = weekdays[date.getDay()];
    return `${weekday}, ${day} ${month}, ${year}`;
  };

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleHourChange = debounce((hour: string | undefined) => {
    if (hour) setTempHour(hour);
  }, 200);

  const handleMinuteChange = debounce((minute: string | undefined) => {
    if (minute) setTempMinute(minute);
  }, 200);

  const handleTimeSelect = (index: number) => {
    const newDates = [...dates];
    const [hours, minutes] = [parseInt(tempHour), parseInt(tempMinute)];
    newDates[index].setHours(hours, minutes, 0, 0);
    setDates(newDates);
    setTimeModalVisible(false);
    setTempHour("08");
    setTempMinute("00");
    setPickerKey((prev) => prev + 1);
  };

  const handleDateSelect = (index: number, day: { dateString: string }) => {
    const selectedDate = new Date(day.dateString);

    if (index > 0) {
      const previousDate = new Date(dates[index - 1]);
      previousDate.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      const timeDiff =
        (selectedDate.getTime() - previousDate.getTime()) /
        (1000 * 60 * 60 * 24);
      if (timeDiff < interval) {
        const minRequiredDate = new Date(previousDate);
        minRequiredDate.setDate(minRequiredDate.getDate() + interval);
        Alert.alert(
          "Thông báo",
          `Ngày ${index + 1} phải cách ngày ${index} (${formatSelectedDate(
            previousDate
          )}) ít nhất ${interval} ngày. Vui lòng chọn từ ngày ${formatSelectedDate(
            minRequiredDate
          )} trở đi.`
        );
        return;
      }
    }

    const newDates = [...dates];
    for (let i = index; i < numDays; i++) {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + (i - index) * interval);
      newDate.setHours(dates[i].getHours(), dates[i].getMinutes(), 0, 0);
      newDates[i] = newDate;
    }

    for (let i = index + 1; i < numDays; i++) {
      const currentDate = new Date(newDates[i]);
      currentDate.setHours(0, 0, 0, 0);
      const prevDate = new Date(newDates[i - 1]);
      prevDate.setHours(0, 0, 0, 0);

      const timeDiff =
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (timeDiff < interval) {
        const minRequiredDate = new Date(prevDate);
        minRequiredDate.setDate(minRequiredDate.getDate() + interval);
        Alert.alert(
          "Thông báo",
          `Ngày ${i + 1} (${formatSelectedDate(
            newDates[i]
          )}) phải cách ngày ${i} (${formatSelectedDate(
            prevDate
          )}) ít nhất ${interval} ngày. Vui lòng chọn lại từ ngày ${formatSelectedDate(
            minRequiredDate
          )} trở đi.`
        );
        return;
      }
    }

    setDates(newDates);
    setCalendarModalVisible(false);
    setSelectedDateIndex(null);
  };

  const openTimeModal = (index: number) => {
    setSelectedTimeIndex(index);
    setTempHour(dates[index].getHours().toString().padStart(2, "0"));
    setTempMinute(dates[index].getMinutes().toString().padStart(2, "0"));
    setTimeModalVisible(true);
  };

  const openCalendar = (index: number) => {
    setSelectedDateIndex(index);
    setCalendarModalVisible(true);
  };

  const handleConfirm = () => {
    const appointmentData = dates.map((date, index) => ({
      day: index + 1,
      date: formatSelectedDate(date),
      formattedDate: formatDateToVietnamese(date),
      startTime: formatTimeWithAmPm(
        `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      ),
      endTime: calculateEndTime(date),
      duration: `${duration} phút`,
    }));

    console.log("🚀 ~ appointmentData ~ appointmentData:", appointmentData);

    router.push({
      pathname: "/(create)/confirm-appointment",
      params: {
        packageInfo: packageInfo,
        patient: patient,
        listDate: JSON.stringify(appointmentData),
      },
    });
  };

  const getMinDateForIndex = (index: number) => {
    if (index === 0) {
      return new Date().toISOString().split("T")[0];
    }
    const previousDate = new Date(dates[index - 1]);
    previousDate.setDate(previousDate.getDate() + interval);
    return previousDate.toISOString().split("T")[0];
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-6 py-4"
      nestedScrollEnabled={true}
    >
      <View className="flex-row items-center mb-6 mt-6">
        <HeaderBack />
        <Text className="text-2xl font-bold text-gray-800 ml-4 mt-2">
          Ngày và Giờ Khả Dụng
        </Text>
      </View>

      {dates.map((date, index) => {
        const startTime = `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
        const endTime = calculateEndTime(date);

        return (
          <View
            key={index}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200"
          >
            <Text className="text-lg font-semibold text-gray-700 mb-3">
              Ngày {index + 1}
            </Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => openCalendar(index)}
                className="flex-1 bg-gray-100 p-3 rounded-lg border border-gray-300 active:bg-gray-200"
              >
                <Text className="text-gray-700 text-base font-medium text-center">
                  {formatDateToVietnamese(date)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openTimeModal(index)}
                className="ml-3 w-32 bg-gray-100 p-3 rounded-lg border border-gray-300 active:bg-gray-200"
              >
                <Text className="text-gray-700 text-base font-medium text-center">
                  {date.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-4">
              <View className="p-4 bg-white rounded-lg border border-gray-200">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">Ngày đặt:</Text>
                  <Text className="text-base font-pbold">
                    {formatSelectedDate(date)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">
                    Thời gian bắt đầu dự kiến:
                  </Text>
                  <Text className="text-base font-pbold">
                    {formatTimeWithAmPm(startTime)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">
                    Thời gian kết thúc dự kiến:
                  </Text>
                  <Text className="text-base font-pbold">{endTime}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-base font-pmedium">
                    Tổng thời gian:
                  </Text>
                  <Text className="text-base font-pbold">{duration} phút</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        onPress={handleConfirm}
        className="bg-blue-600 px-6 py-3 rounded-xl self-end mt-6 active:bg-blue-700 mb-10"
      >
        <Text className="text-white text-lg font-semibold text-center">
          Tiếp Theo
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isTimeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-11/12 shadow-lg">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Chọn Giờ
            </Text>
            <View className="flex-row justify-center items-center">
              <WheelScrollPicker
                key={`hour-picker-${pickerKey}`}
                dataSource={hours}
                selectedIndex={hours.indexOf(tempHour)}
                onValueChange={handleHourChange}
                renderItem={(
                  hour: string,
                  index: number,
                  isSelected: boolean
                ) => (
                  <Text
                    className={`${
                      isSelected
                        ? "text-[#64C1DB] text-2xl font-bold"
                        : "text-gray-500 text-lg"
                    }`}
                  >
                    {hour}
                  </Text>
                )}
                wrapperHeight={200}
                itemHeight={50}
                highlightColor="#64C1DB"
                highlightBorderWidth={2}
                activeItemTextStyle={{
                  color: "#64C1DB",
                  fontSize: 24,
                  fontWeight: "bold",
                }}
                itemTextStyle={{
                  color: "gray",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              />
              <Text className="text-2xl mx-2 text-gray-500 font-bold">:</Text>
              <WheelScrollPicker
                key={`minute-picker-${pickerKey}`}
                dataSource={minutes}
                selectedIndex={minutes.indexOf(tempMinute)}
                onValueChange={handleMinuteChange}
                renderItem={(
                  minute: string,
                  index: number,
                  isSelected: boolean
                ) => (
                  <Text
                    className={`${
                      isSelected
                        ? "text-[#64C1DB] text-2xl font-bold"
                        : "text-gray-500 text-lg"
                    }`}
                  >
                    {minute}
                  </Text>
                )}
                wrapperHeight={200}
                itemHeight={50}
                highlightColor="#64C1DB"
                highlightBorderWidth={2}
                activeItemTextStyle={{
                  color: "#64C1DB",
                  fontSize: 24,
                  fontWeight: "bold",
                }}
                itemTextStyle={{
                  color: "gray",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                selectedTimeIndex !== null &&
                handleTimeSelect(selectedTimeIndex)
              }
              className="bg-blue-600 px-4 py-2 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-semibold">
                Xác Nhận
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal chọn ngày bằng Calendar */}
      <Modal
        visible={isCalendarModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl w-11/12 shadow-lg">
            <Calendar
              current={
                selectedDateIndex !== null
                  ? dates[selectedDateIndex].toISOString().split("T")[0]
                  : undefined
              }
              onDayPress={(day: any) =>
                selectedDateIndex !== null &&
                handleDateSelect(selectedDateIndex, day)
              }
              markedDates={{
                [dates[selectedDateIndex || 0]?.toISOString().split("T")[0]]: {
                  selected: true,
                  selectedColor: "#64C1DB",
                },
              }}
              minDate={getMinDateForIndex(selectedDateIndex || 0)}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#64C1DB",
                selectedDayBackgroundColor: "#64C1DB",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#64C1DB",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                arrowColor: "#64C1DB",
                monthTextColor: "#64C1DB",
                textDayFontFamily: "font-pmedium",
                textMonthFontFamily: "font-pbold",
                textDayHeaderFontFamily: "font-psemibold",
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={{
                borderRadius: 10,
                elevation: 4,
                padding: 12,
              }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DateAvailableScreen;
