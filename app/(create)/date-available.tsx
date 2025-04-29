import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Image,
  FlatList,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar } from "react-native-calendars";
import HeaderBack from "@/components/HeaderBack";
import WheelScrollPicker from "react-native-wheel-scrollview-picker";
import { CheckTimeNurse, ListNurseData } from "@/types/nurse";
import { format, addMinutes, formatISO, subHours } from "date-fns";
import nurseApiRequest from "@/app/api/nurseApi";
import appointmentApiRequest from "@/app/api/appointmentApi";

const DateAvailableScreen = () => {
  const {
    id,
    day,
    totalDuration,
    packageInfo,
    timeInter,
    patient,
    nurseInfo,
    discount,
  } = useLocalSearchParams();
  const nurseData = nurseInfo ? JSON.parse(nurseInfo as string) : null;
  const [listNurseData, setListNurseData] = useState<ListNurseData[]>([]);
  const [checkTime, setCheckTime] = useState<CheckTimeNurse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const duration = Number(totalDuration) || 0;
  const numDays = Math.max(Number(day), 1);
  const interval = Number(timeInter) === 0 ? 1 : Number(timeInter);

  const [dates, setDates] = useState<Date[]>(
    Array.from({ length: numDays }, (_, index) => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 1 + index * interval);
      newDate.setHours(8, 0, 0, 0);
      return newDate;
    })
  );

  const [nurseNames, setNurseNames] = useState<string[]>(
    nurseInfo
      ? Array(numDays).fill(nurseData?.["nurse-name"] || "Chưa chọn")
      : Array(numDays).fill("Chưa chọn")
  );

  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [selectedNurseIndex, setSelectedNurseIndex] = useState<number | null>(null);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [isNurseModalVisible, setNurseModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState<string>("08");
  const [tempMinute, setTempMinute] = useState<string>("00");
  const [pickerKey, setPickerKey] = useState<number>(0);

  const hours: string[] = Array.from({ length: 14 }, (_, i) =>
    String(i + 8).padStart(2, "0")
  );
  const minutes: string[] = ["00", "15", "30", "45"];

  const formatDateForApi = (date: Date): string => {
    try {
      return formatISO(subHours(date, 7)).replace(/\+[0-9]{2}:[0-9]{2}/, "Z");
    } catch (error) {
      console.error("Error formatting date for API:", error);
      return "";
    }
  };

  const fetchListNurse = async (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }
      const dateFormat = formatDateForApi(parsedDate);
      if (!dateFormat) {
        throw new Error("Failed to format date");
      }
      const response = await appointmentApiRequest.getListNurseAvailableTime(
        String(id),
        dateFormat,
        Number(totalDuration)
      );
      console.log("🚀 ~ fetchListNurse ~ dateFormat:", dateFormat);
      console.log("🚀 ~ fetchListNurse ~ totalDuration:", totalDuration);
      console.log("🚀 ~ fetchListNurse ~ id:", id);
      setListNurseData(response.payload.data || []);
    } catch (error) {
      console.error("Error fetching nurses:", error);
      setListNurseData([]);
    }
  };

  const checkNurseTime = async () => {
    try {
      const nursesDates = dates.map((date, index) => {
        if (!nurseInfo) {
          return {
            "est-start-date": formatDateForApi(date),
            "nurse-id": null,
            "nurse-name": null,
          };
        }
        const selectedNurse = listNurseData.find(
          (nurse) => nurse["nurse-name"] === nurseNames[index]
        );
        return {
          "est-start-date": formatDateForApi(date),
          "nurse-id": selectedNurse?.["nurse-id"] || nurseData?.["nurse-id"] || null,
          "est-duration": Number(totalDuration),
        };
      }).filter((item) => item["est-start-date"]); // Filter out invalid dates

      if (nursesDates.length === 0) {
        console.warn("No valid dates to check nurse time");
        setCheckTime([]);
        return;
      }

      console.log("🚀 ~ nursesDates ~ nursesDates:", nursesDates);
      const response = await appointmentApiRequest.checkNurseTime({
        "nurses-dates": nursesDates,
      });

      setCheckTime(response.payload.data || []);
      console.log(
        "🚀 ~ checkNurseTime ~ response.payload.data:",
        response.payload.data
      );
    } catch (error) {
      console.error("Error checking nurse times:", error);
      setCheckTime([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await checkNurseTime();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dates, nurseNames]);

  const formatTimeWithAmPm = (time: string): string => {
    try {
      const [hour, minute] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
      return format(date, "hh:mm a");
    } catch (error) {
      console.error("Error formatting time:", error);
      return time;
    }
  };

  const calculateEndTime = (date: Date) => {
    try {
      const endDate = addMinutes(date, duration);
      if (endDate.getHours() >= 22 && endDate.getMinutes() > 0) {
        endDate.setHours(22, 0, 0, 0);
      }
      return format(endDate, "hh:mm a");
    } catch (error) {
      console.error("Error calculating end time:", error);
      return "N/A";
    }
  };

  const formatSelectedDate = (date: Date): string => {
    try {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting selected date:", error);
      return "N/A";
    }
  };

  const formatDateToVietnamese = (date: Date): string => {
    try {
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
    } catch (error) {
      console.error("Error formatting Vietnamese date:", error);
      return "N/A";
    }
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
    try {
      const newDates = [...dates];
      const [hours, minutes] = [parseInt(tempHour), parseInt(tempMinute)];
      newDates[index].setHours(hours, minutes, 0, 0);
      setDates(newDates);
      setTimeModalVisible(false);
      setTempHour("08");
      setTempMinute("00");
      setPickerKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error selecting time:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thời gian. Vui lòng thử lại.");
    }
  };

  const handleDateSelect = (index: number, day: { dateString: string }) => {
    try {
      const selectedDate = new Date(day.dateString);
      if (isNaN(selectedDate.getTime())) {
        throw new Error("Invalid selected date");
      }

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
    } catch (error) {
      console.error("Error selecting date:", error);
      Alert.alert("Lỗi", "Không thể cập nhật ngày. Vui lòng thử lại.");
    }
  };

  const openTimeModal = (index: number) => {
    try {
      setSelectedTimeIndex(index);
      setTempHour(dates[index].getHours().toString().padStart(2, "0"));
      setTempMinute(dates[index].getMinutes().toString().padStart(2, "0"));
      setTimeModalVisible(true);
    } catch (error) {
      console.error("Error opening time modal:", error);
      Alert.alert("Lỗi", "Không thể mở chọn giờ. Vui lòng thử lại.");
    }
  };

  const openCalendar = (index: number) => {
    setSelectedDateIndex(index);
    setCalendarModalVisible(true);
  };

  const openNurseModal = async (index: number, date: string) => {
    try {
      await fetchListNurse(date);
      setSelectedNurseIndex(index);
      setNurseModalVisible(true);
    } catch (error) {
      console.error("Error opening nurse modal:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách điều dưỡng. Vui lòng thử lại.");
    }
  };

  const handleNurseSelect = (nurseName: string) => {
    try {
      if (selectedNurseIndex !== null) {
        const newNurseNames = [...nurseNames];
        newNurseNames[selectedNurseIndex] = nurseName;
        setNurseNames(newNurseNames);
      }
      setNurseModalVisible(false);
      setSelectedNurseIndex(null);
    } catch (error) {
      console.error("Error selecting nurse:", error);
      Alert.alert("Lỗi", "Không thể chọn điều dưỡng. Vui lòng thử lại.");
    }
  };

  const handleConfirm = () => {
    try {
      const unavailableDates = dates
        .map((date, index) => {
          const dateString = formatDateForApi(date);
          if (!dateString) {
            return `Ngày ${index + 1} (Ngày không hợp lệ)`;
          }
          const check = checkTime.find(
            (ct) => ct["est-start-date"] === dateString
          );
          if (!check || !check["is-availability"]) {
            return `Ngày ${index + 1} (${formatSelectedDate(date)})`;
          }
          return null;
        })
        .filter((d) => d !== null);

      if (unavailableDates.length > 0) {
        Alert.alert(
          "Thông báo",
          `Các ngày/giờ sau không khả dụng: ${unavailableDates.join(
            ", "
          )}. Vui lòng chọn giờ khác.`
        );
        return;
      }

      const appointmentData = dates.map((date, index) => {
        if (!nurseInfo) {
          return {
            date: formatDateForApi(date),
            "nursing-id": null,
          };
        }
        const selectedNurse = listNurseData.find(
          (nurse) => nurse["nurse-name"] === nurseNames[index]
        );
        return {
          date: formatDateForApi(date),
          "nursing-id": selectedNurse?.["nurse-id"] || nurseData?.["nurse-id"] || null,
          "nurse-name": nurseNames[index],
        };
      }).filter((item) => item.date); // Filter out invalid dates

      if (appointmentData.length === 0) {
        Alert.alert("Lỗi", "Không có ngày hợp lệ để xác nhận.");
        return;
      }

      router.push({
        pathname: "/(create)/confirm-appointment",
        params: {
          packageInfo: packageInfo,
          patient: patient,
          listDate: JSON.stringify(appointmentData),
          discount: discount,
          duration: duration,
          day: day,
        },
      });
    } catch (error) {
      console.error("Error confirming appointment:", error);
      Alert.alert("Lỗi", "Không thể xác nhận lịch hẹn. Vui lòng thử lại.");
    }
  };

  const getMinDateForIndex = (index: number) => {
    try {
      if (index === 0) {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 1);
        return minDate.toISOString().split("T")[0];
      }
      const previousDate = new Date(dates[index - 1]);
      previousDate.setDate(previousDate.getDate() + interval);
      return previousDate.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error getting min date:", error);
      return new Date().toISOString().split("T")[0];
    }
  };

  const isAllAvailable = isLoading
    ? false
    : dates.every((date) => {
        const dateString = formatDateForApi(date);
        if (!dateString) return false;
        const check = checkTime.find(
          (ct) => ct["est-start-date"] === dateString
        );
        return check && check["is-availability"];
      });

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
        const dateString = formatDateForApi(date);
        const check = checkTime.find(
          (ct) => ct["est-start-date"] === dateString
        );
        const isAvailable = isLoading
          ? true
          : check
          ? check["is-availability"]
          : false;

        return (
          <View
            key={index}
            className={`bg-white rounded-xl p-4 mb-4 shadow-sm border ${
              isLoading
                ? "border-gray-200"
                : isAvailable
                ? "border-gray-200"
                : "border-red-500 bg-red-50"
            }`}
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
                <Text className="text-base font-medium text-center text-gray-700">
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
                    Thời gian bắt đầu:
                  </Text>
                  <Text className="text-base font-pbold">
                    {formatTimeWithAmPm(startTime)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">
                    Thời gian kết thúc:
                  </Text>
                  <Text className="text-base font-pbold">{endTime}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base font-pmedium">
                    Tổng thời gian:
                  </Text>
                  <Text className="text-base font-pbold">{duration} phút</Text>
                </View>
                {nurseInfo && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base font-pmedium">Điều dưỡng:</Text>
                    <Text className="text-base font-pbold">
                      {nurseNames[index] || "Chưa chọn"}
                    </Text>
                  </View>
                )}
                {!isLoading && !isAvailable && nurseInfo && (
                  <TouchableOpacity
                    onPress={() => openNurseModal(index, dateString)}
                    className="w-full py-3 rounded-xl self-end my-2 bg-blue-600 active:bg-blue-700"
                  >
                    <Text className="text-lg font-semibold text-center text-white">
                      Chọn điều dưỡng
                    </Text>
                  </TouchableOpacity>
                )}
                {!isLoading && !isAvailable && (
                  <Text className="text-red-500 text-sm mt-2">
                    Vui lòng {nurseInfo ? "đổi điều dưỡng hoặc " : ""}giờ khác.
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        onPress={handleConfirm}
        disabled={isLoading || !isAllAvailable}
        className={`px-6 py-3 rounded-xl self-end mt-6 mb-10 ${
          isLoading || !isAllAvailable
            ? "bg-gray-400"
            : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        <Text className="text-lg font-semibold text-center text-white">
          Tiếp Theo
        </Text>
      </TouchableOpacity>

      {nurseInfo && (
        <Modal
          visible={isNurseModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setNurseModalVisible(false)}
        >
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/50"
            activeOpacity={1}
            onPress={() => setNurseModalVisible(false)}
          >
            <View className="bg-white rounded-2xl p-6 w-11/12 shadow-lg max-h-[80%]">
              <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
                Chọn Điều Dưỡng
              </Text>
              <FlatList
                data={listNurseData}
                keyExtractor={(item) => item["nurse-id"]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected =
                    selectedNurseIndex !== null &&
                    item["nurse-name"] === nurseNames[selectedNurseIndex];
                  return (
                    <TouchableOpacity
                      onPress={() => handleNurseSelect(item["nurse-name"])}
                      className={`p-3 border-b border-gray-200 flex-row items-center ${
                        isSelected ? "border-2 rounded-2xl" : "bg-white"
                      } active:bg-gray-100`}
                    >
                      {item["nurse-picture"] && (
                        <Image
                          source={{ uri: item["nurse-picture"] }}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <View>
                        <Text
                          className={`text-base font-pmedium ${
                            isSelected ? "text-blue-600" : "text-gray-700"
                          }`}
                        >
                          {item["nurse-name"] || "Không xác định"}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {item["current-work-place"] || "N/A"}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          Đánh giá: {item.rate ? item.rate.toFixed(1) : "N/A"} ★
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                style={{ maxHeight: 350 }}
              />
              <TouchableOpacity
                onPress={() => setNurseModalVisible(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg mt-4"
              >
                <Text className="text-gray-800 text-center font-semibold">
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

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

      <Modal
        visible={isCalendarModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50"
          activeOpacity={1}
          onPress={() => setCalendarModalVisible(false)}
        >
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
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

export default DateAvailableScreen;