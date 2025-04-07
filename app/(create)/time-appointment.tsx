import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import HeaderBack from "@/components/HeaderBack";
import { useSearch } from "@/app/provider";
import WheelScrollPicker from "react-native-wheel-scrollview-picker";
import { ScrollView } from "react-native";

interface Schedule {
  [key: string]: string[];
}

interface SearchContext {
  isSearch: boolean;
}

interface CalendarDay {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

const generateSchedule = (isSearch: boolean): Schedule => {
  const schedule: Schedule = {};
  const startHour = 8;
  const endHour = 22;
  const interval = 30;
  const daysToGenerate = isSearch ? 3 : 14;

  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    const times: string[] = [];

    if (isSearch) {
      for (let j = 0; j < 4; j++) {
        const hour = startHour + j * 2;
        const minute = j % 2 === 0 ? 0 : 30;
        const time = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        times.push(time);
      }
    } else {
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const time = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;
          times.push(time);
        }
      }
    }

    schedule[dateKey] = times;
  }

  return schedule;
};

const TimeSelectScreen: React.FC = () => {
  const { id, day, totalDuration, packageInfo } = useLocalSearchParams();
  const { isSearch } = useSearch() as SearchContext;
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string>("08");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [loadingTime, setLoadingTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [pickerKey, setPickerKey] = useState<number>(0);

  const schedule = generateSchedule(isSearch);
  const duration = Number(totalDuration) || 90;
  const hours: string[] = Array.from({ length: 15 }, (_, i) =>
    String(i + 8).padStart(2, "0")
  );
  const minutes: string[] = ["00", "15", "30", "45"];

  const formatTimeWithAmPm = (time: string): string => {
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";

    if (hour === 0) {
      hour = 12;
    } else if (hour > 12) {
      hour -= 12;
    }

    return `${hour}:${minute} ${period}`;
  };

  const calculateEndTime = (time: string, duration: number): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    if (endDate.getHours() >= 22 && endDate.getMinutes() > 0) {
      endDate.setHours(22, 0, 0, 0);
    }

    return endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateEndTimeISO = (
    startTime: string,
    duration: number,
    dateString: string
  ): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date(dateString);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    if (endDate.getHours() >= 22 && endDate.getMinutes() > 0) {
      endDate.setHours(22, 0, 0, 0);
    }

    return endDate.toISOString();
  };

  const updateTime = useCallback(() => {
    const time = `${selectedHour}:${selectedMinute}`;
    setSelectedTime(time);
    const endTime = calculateEndTime(time, duration);
    setEndTime(endTime);
  }, [selectedHour, selectedMinute, duration]);

  const resetTime = useCallback(() => {
    setSelectedHour("08");
    setSelectedMinute("00");
    setPickerKey((prev) => prev + 1);
    const time = "08:00";
    setSelectedTime(time);
    const endTime = calculateEndTime(time, duration);
    setEndTime(endTime);
  }, [duration]);

  const formatSelectedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    setSelectedDate(todayString);
    setCurrentMonth(today.toISOString().slice(0, 7));
    updateTime();
  }, []);

  useEffect(() => {
    updateTime();
  }, [selectedHour, selectedMinute, updateTime]);

  const handleConfirm = async (): Promise<void> => {
    if (!selectedDate || !selectedTime) return;
    setLoadingTime(selectedTime);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const formattedDate = selectedDate;
      const startTimeISO = `${formattedDate}T${selectedTime}:00.000Z`;
      const endTimeISO = calculateEndTimeISO(
        selectedTime,
        duration,
        selectedDate
      );

      const dayNumber = Number(day || 0);
      if (dayNumber >= 2) {
        router.push({
          pathname: "/(create)/date-available",
          params: {
            id,
            number: day,
            totalDuration,
            date: formattedDate,
            startTime: startTimeISO,
            endTime: endTimeISO,
            packageInfo: packageInfo,
          },
        });
      } else if (isSearch) {
        router.push({
          pathname: "/(create)/date-available",
          params: {
            id,
            number: day,
            totalDuration,
            date: formattedDate,
            startTime: startTimeISO,
            endTime: endTimeISO,
            packageInfo: packageInfo,
          },
        });
      } else {
        router.push({
          pathname: "/(create)/date-available",
          params: {
            id,
            number: day,
            totalDuration,
            date: formattedDate,
            startTime: startTimeISO,
            endTime: endTimeISO,
            packageInfo: packageInfo,
          },
        });
      }
    } catch (error) {
      console.error("🚀 ~ handleConfirm ~ Error during navigation:", error);
    } finally {
      setLoadingTime(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 mt-4">
        <HeaderBack />
      </View>

      <View className="px-2">
        <Calendar
          onDayPress={(day: CalendarDay) => {
            setSelectedDate(day.dateString);
            resetTime();
          }}
          onMonthChange={(month: CalendarDay) => {
            setCurrentMonth(month.dateString.slice(0, 7));
            resetTime();
          }}
          markedDates={{
            [selectedDate || ""]: {
              selected: true,
              selectedColor: "#64C1DB",
            },
          }}
          theme={{
            selectedDayBackgroundColor: "#64C1DB",
            todayTextColor: "#64C1DB",
            arrowColor: "#64C1DB",
            textDayFontFamily: "font-pbold",
            textMonthFontFamily: "font-pbold",
            textDayHeaderFontFamily: "font-psemibold",
          }}
          minDate={new Date().toISOString().split("T")[0]}
          style={{ borderRadius: 8, marginBottom: 16 }}
        />
      </View>

      {selectedDate && (
        <View className="flex-1 px-4">
          <Text className="text-lg font-semibold mb-4 text-gray-900">
            Chọn thời gian
          </Text>
          <View className="flex-row justify-center items-center">
            {/* Hour Picker */}
            <WheelScrollPicker
              key={`hour-picker-${pickerKey}`}
              dataSource={hours}
              selectedIndex={hours.indexOf(selectedHour)}
              onValueChange={(hour: string | undefined) => {
                if (hour) {
                  setSelectedHour(hour);
                }
              }}
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
              wrapperHeight={180}
              itemHeight={60}
              highlightColor="#64C1DB"
              highlightBorderWidth={2}
              activeItemTextStyle={{
                color: "#64C1DB",
                fontSize: 24,
                fontWeight: "pbold",
              }}
              itemTextStyle={{
                color: "gray",
                fontSize: 18,
                fontWeight: "pbold",
              }}
            />

            {/* Separator */}
            <Text className="text-2xl mx-2 text-gray-500 font-bold">:</Text>

            {/* Minute Picker */}
            <WheelScrollPicker
              key={`minute-picker-${pickerKey}`}
              dataSource={minutes}
              selectedIndex={minutes.indexOf(selectedMinute)}
              onValueChange={(minute: string | undefined) => {
                if (minute) {
                  setSelectedMinute(minute);
                }
              }}
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
              wrapperHeight={180}
              itemHeight={60}
              highlightColor="#64C1DB"
              highlightBorderWidth={2}
              activeItemTextStyle={{
                color: "#64C1DB",
                fontSize: 24,
                fontWeight: "bold",
              }}
              itemTextStyle={{ color: "gray", fontSize: 18 }}
            />
          </View>

          {selectedTime && endTime && (
            <View className="mt-4">
              <View className="p-4 bg-white rounded-lg border border-gray-200">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">Ngày đặt:</Text>
                  <Text className="text-base font-pbold">
                    {formatSelectedDate(selectedDate)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">Thời gian bắt đầu dự kiến:</Text>
                  <Text className="text-base font-pbold">
                    {formatTimeWithAmPm(selectedTime)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">Thời gian kết thúc dự kiến:</Text>
                  <Text className="text-base font-pbold">{endTime}</Text>
                </View>
                {/* Duration Row */}
                <View className="flex-row justify-between">
                  <Text className="text-base font-pmedium">
                    Tổng thời gian:
                  </Text>
                  <Text className="text-base font-pbold">{duration} phút</Text>
                </View>
              </View>
              <Pressable
                className={`mt-4 p-4 rounded-lg mb-8 ${
                  loadingTime ? "bg-gray-400" : "bg-[#64C1DB]"
                }`}
                onPress={handleConfirm}
                disabled={!!loadingTime}
              >
                {loadingTime ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-center text-white font-pbold">
                    Xác nhận thời gian
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default TimeSelectScreen;
