import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import HeaderBack from "@/components/HeaderBack";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { format, addDays, parseISO } from "date-fns";

interface NurseSchedule {
  "appointment-id": string;
  "patient-id": string;
  "est-date": string;
  "est-end-time": string;
  status: string;
  "total-est-duration": number;
  "est-travel-time": number;
}

interface ScheduleItem {
  startHour: number;
  endHour: number;
  title: string;
}

const DetailScheduleListScreen = () => {
  const router = useRouter();
  const { idNurse, id, selectedDate } = useLocalSearchParams();
  const dateStr = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;
  console.log("🚀 ~ DetailScheduleListScreen ~ idNurse:", idNurse);
  const currentDate = dateStr ? parseISO(dateStr) : new Date();
  const nextDate = addDays(currentDate, 1);
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);

  async function fetchNurseDateTime() {
    console.log(
      "🚀 ~ fetchNurseDateTime ~ format(currentDate, 'yyyy-MM-dd'):",
      format(currentDate, "yyyy-MM-dd")
    );
    console.log(
      "🚀 ~ fetchNurseDateTime ~ format(nextDate, 'yyyy-MM-dd'):",
      format(nextDate, "yyyy-MM-dd")
    );
    console.log("🚀 ~ fetchNurseDateTime ~ idNurse:", idNurse);
    try {
      const response = await appointmentApiRequest.getNurseDate(
        String(idNurse),
        format(currentDate, "yyyy-MM-dd"),
        format(nextDate, "yyyy-MM-dd")
      );
      console.log("🚀 ~ fetchNurseDateTime ~ response.payload.data:", response.payload?.data);

      if (response.payload?.data) {
        const schedules: NurseSchedule[] = response.payload.data;
        const transformedSchedules: ScheduleItem[] = schedules
          .map((schedule) => {
            // Validate est-end-time format
            const timeRange = schedule["est-end-time"];
            if (!timeRange || !/^\d{2}:\d{2} - \d{2}:\d{2}$/.test(timeRange)) {
              console.warn(
                `Invalid est-end-time format for appointment ${schedule["appointment-id"]}: ${timeRange}`
              );
              return null;
            }

            try {
              const [startTime, endTime] = timeRange.split(" - ");
              const startDateTime = parseISO(
                `${schedule["est-date"]}T${startTime}`
              );
              const endDateTime = parseISO(`${schedule["est-date"]}T${endTime}`);

              // Validate parsed dates
              if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                console.warn(
                  `Invalid date/time for appointment ${schedule["appointment-id"]}: ${schedule["est-date"]}T${startTime} or ${schedule["est-date"]}T${endTime}`
                );
                return null;
              }

              return {
                startHour:
                  startDateTime.getHours() + startDateTime.getMinutes() / 60,
                endHour: endDateTime.getHours() + endDateTime.getMinutes() / 60,
                title: `Lịch hẹn ${schedule["appointment-id"]}`,
              };
            } catch (error) {
              console.warn(
                `Error parsing date/time for appointment ${schedule["appointment-id"]}:`,
                error
              );
              return null;
            }
          })
          .filter((item): item is ScheduleItem => item !== null);

        setScheduleData(transformedSchedules);
      }
    } catch (error: any) {
      console.error("Error fetching nurse schedule:", error);
    }
  }

  useEffect(() => {
    if (idNurse && dateStr) {
      fetchNurseDateTime();
    }
  }, [idNurse, dateStr]);

  const startHour = 8;
  const endHour = 23;
  const HOUR_HEIGHT = 80;
  const CARD_GAP = 8;

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-4 flex-row items-center mt-4">
        <HeaderBack />
        <Text className="flex-1 text-center text-lg font-pbold">
          Lịch ngày {format(currentDate, "dd/MM/yyyy")}
        </Text>
        <TouchableOpacity
          className="bg-[#64CBDB] p-2 px-6 rounded-2xl"
          onPress={() =>
            router.push({
              pathname: "/(create)/choose-profile",
              params: { id: id },
            })
          }
        >
          <Text className="text-white font-pbold">Đặt lịch</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-around items-center mb-4">
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-cyan-500 rounded-full mr-2" />
          <Text className="font-pbold text-gray-400">Ca sáng</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-orange-500 rounded-full mr-2" />
          <Text className="font-pbold text-gray-400">Ca chiều</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-indigo-700 rounded-full mr-2" />
          <Text className="font-pbold text-gray-400">Ca tối</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative pt-6 pb-6">
          <View
            style={{
              left: 20,
              top: 0,
              height: (hours.length - 0.9) * HOUR_HEIGHT,
            }}
            className="absolute w-0.5 bg-pink-300"
          />

          {hours.map((hour, index) => {
            const topOffset = index * HOUR_HEIGHT;
            const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;

            let dotColor = "bg-indigo-700";
            if (hour >= 8 && hour < 12) {
              dotColor = "bg-cyan-500";
            } else if (hour >= 12 && hour < 17) {
              dotColor = "bg-orange-500";
            }

            return (
              <View
                key={hour}
                style={{ top: topOffset }}
                className="absolute flex-row items-center"
              >
                <View
                  style={{ marginLeft: 14 }}
                  className={`w-4 h-4 ${dotColor} rounded-full`}
                />
                <Text className="text-gray-500 ml-4 font-psemibold">
                  {hourStr}
                </Text>
              </View>
            );
          })}

          {scheduleData.map((item, index) => {
            const startOffset = (item.startHour - startHour) * HOUR_HEIGHT;
            const endOffset = (item.endHour - startHour) * HOUR_HEIGHT;
            const cardHeight = endOffset - startOffset - CARD_GAP;
            const startTime = format(
              new Date(
                0,
                0,
                0,
                Math.floor(item.startHour),
                (item.startHour % 1) * 60
              ),
              "HH:mm"
            );
            const endTime = format(
              new Date(
                0,
                0,
                0,
                Math.floor(item.endHour),
                (item.endHour % 1) * 60
              ),
              "HH:mm"
            );

            return (
              <View
                key={index}
                style={{ top: startOffset, height: cardHeight }}
                className="absolute left-36 right-4 bg-pink-100 border border-pink-400 rounded-lg p-4 justify-center z-10"
              >
                <Text className="text-pink-600 font-psemibold text-sm">
                  {item.title} {startTime} - {endTime}
                </Text>
              </View>
            );
          })}

          <View style={{ height: (hours.length - 1) * HOUR_HEIGHT }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailScheduleListScreen;