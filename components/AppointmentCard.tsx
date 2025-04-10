import React from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import IconTime from "@/assets/icon/clock-arrow-up.png";
import IconCalendar from "@/assets/icon/calendar-range.png";
import { format } from "date-fns";
import { AppointmentCardProps, Status, StatusStyle } from "@/types/appointment";
import { router } from "expo-router";

const STATUS_STYLES: Partial<Record<Status, StatusStyle>> = {
  waiting: {
    backgroundColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-2 border-amber-500",
    label: "Chờ xác nhận",
  },
  confirmed: {
    backgroundColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-2 border-indigo-500",
    label: "Đã xác nhận",
  },
  success: {
    backgroundColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-2 border-emerald-500",
    label: "Hoàn thành",
  },
  refused: {
    backgroundColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-2 border-red-500",
    label: "Từ chối chuyển",
  },
  changed: {
    backgroundColor: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-2 border-violet-500",
    label: "Chờ đổi điều dưỡng",
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
  status,
  packageId,
  nurseId,
  patientId,
}: AppointmentCardProps) => {
  const statusStyle = STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;
  const formattedDate = format(time, "dd/MM/yyyy");
  const formattedTime = format(time, "HH:mm a");

  const handleClick = () => {
    router.push({
      pathname: "/detail-appointment/[id]",
      params: {
        id: String(id),
        packageId: packageId,
        nurseId: nurseId,
        patientId: patientId,
        date: time,
        status: status,
      },
    });
  };

  const renderAvatar = () => {
    if (!avatar) {
      return (
        <ActivityIndicator size="large" color="#64CBDB" className="w-12 h-12" />
      );
    }
    return (
      <Image
        source={{ uri: avatar }}
        className="w-12 h-12 rounded-2xl shadow"
      />
    );
  };

  const displayNurseName = avatar ? nurseName : "Đang tìm kiếm điều dưỡng...";

  return (
    <TouchableOpacity
      onPress={handleClick}
      className={`bg-white rounded-xl p-4 mx-4 my-2 shadow-sm ${statusStyle.borderColor}`}
    >
      <View
        className={`self-start ${statusStyle.backgroundColor} px-3 py-1 rounded-full mb-3`}
      >
        <Text className={`text-xs ${statusStyle.textColor} font-pbold`}>
          {statusStyle.label}
        </Text>
      </View>

      <View className="flex flex-row items-center mb-3">
        {renderAvatar()}
        <View className="ml-3 flex-1">
          <Text className="text-base font-pbold text-gray-800">
            {displayNurseName}
          </Text>

          <View className="flex flex-row items-center mt-2">
            <Image source={IconTime} className="w-4 h-4 mr-1" />
            <Text className="text-sm text-gray-500 ml-1">{formattedTime}</Text>
            <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
            <Image source={IconCalendar} className="w-4 h-4 mr-1" />
            <Text className="text-sm text-gray-500 ml-1">{formattedDate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AppointmentCard;
