import React from "react";
import { View, Text, Image } from "react-native";
import IconTime from "@/assets/icon/clock-arrow-up.png";
import IconCalendar from "@/assets/icon/calendar-range.png";
import { format } from "date-fns";
import { AppointmentCardProps, Status, StatusStyle } from "@/types/appointment";
const STATUS_STYLES: Partial<Record<Status, StatusStyle>> = {
  pending: {
    backgroundColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    borderColor: "border-2 border-yellow-500",
    label: "Chờ xác nhận",
  },
  upcoming: {
    backgroundColor: "bg-blue-50",
    textColor: "text-blue-600",
    label: "Đang thực hiện",
  },
  completed: {
    backgroundColor: "bg-green-50",
    textColor: "text-green-600",
    label: "Hoàn thành",
  },
  cancelled: {
    backgroundColor: "bg-red-50",
    textColor: "text-red-600",
    label: "Đã hủy",
  },
  accepted: {
    backgroundColor: "bg-teal-50",
    textColor: "text-teal-600",
    borderColor: "border-2 border-green-500",
    label: "Đã chấp nhận",
  },
};

const DEFAULT_STATUS_STYLE: StatusStyle = {
  backgroundColor: "bg-gray-50",
  textColor: "text-gray-600",
  borderColor: "border-gray-400",
  label: "Không xác định",
};

const AppointmentCard = ({
  id,
  avatar,
  nurseName,
  time,
  date,
  services,
  status,
}: AppointmentCardProps) => {
  const statusStyle = STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;
  const formattedDate = format(new Date(date), "dd/MM/yyyy");

  return (
    <View
      className={`bg-white rounded-xl p-4 mx-4 my-2 shadow-sm ${status === "pending" ||"accepted" ? statusStyle.borderColor:"bg-blue-50"}`}
    >
      <View
        className={`self-start ${statusStyle.backgroundColor} px-3 py-1 rounded-full mb-3`}
      >
        <Text className={`text-xs ${statusStyle.textColor} font-pbold`}>
          {statusStyle.label}
        </Text>
      </View>

      <View className="flex flex-row items-center mb-3">
        <Image source={{ uri: avatar }} className="w-12 h-12 rounded-full" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-pbold text-gray-800">
            {nurseName}
          </Text>

          <View className="flex flex-row items-center mt-2">
            <Image source={IconTime} className="w-4 h-4" />
            <Text className="text-sm text-gray-500 ml-1">{time}</Text>
            <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
            <Image source={IconCalendar} className="w-4 h-4" />
            <Text className="text-sm text-gray-500 ml-1">{formattedDate}</Text>
          </View>
        </View>
      </View>

      <View className="flex flex-row flex-wrap gap-2">
        {services.map((service, index) => (
          <View
            key={index}
            className={`${statusStyle.backgroundColor} px-3 py-1 rounded-full`}
          >
            <Text className={`text-sm ${statusStyle.textColor} font-psemibold`}>
              {service}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AppointmentCard;
