import React from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import IconTime from "@/assets/icon/clock-arrow-up.png";
import { MaterialIcons } from "@expo/vector-icons"; // Using MaterialIcons from expo/vector-icons
import { addMinutes, format } from "date-fns";
import { AppointmentCardProps, Status, StatusStyle } from "@/types/appointment";
import { router } from "expo-router";

const COLOR_MAP: Record<string, string> = {
  "text-amber-600": "#d97706",
  "text-indigo-600": "#4f46e5",
  "text-emerald-600": "#059669",
  "text-sky-600": "#0284c7",
  "text-violet-600": "#7c3aed",
  "text-gray-600": "#4b5563",
};

const STATUS_STYLES: Record<Status, StatusStyle> = {
  waiting: {
    backgroundColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-2 border-amber-500",
    label: "Chờ xác nhận",
  },
  upcoming: {
    backgroundColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-2 border-indigo-500",
    label: "Sắp tới",
  },
  success: {
    backgroundColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-2 border-emerald-500",
    label: "Hoàn thành",
  },
  confirmed: {
    backgroundColor: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-2 border-sky-500",
    label: "Đã xác nhận",
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
  duration,
}: AppointmentCardProps) => {
  const statusStyle = STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;
  const formattedDate = format(time, "dd/MM/yyyy");
  const formattedTime = format(time, "HH:mm a");

  const handleClick = () => {
    router.push({
      pathname: "/detail-appointment",
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

  const calculateEndTime = () => {
    try {
      if (!duration) return "Không xác định";
      const endTime = addMinutes(time, duration);
      return format(endTime, "HH:mm a");
    } catch (error) {
      console.error("Error calculating end time:", error);
      return "Không xác định";
    }
  };

  return (
    <TouchableOpacity
      onPress={handleClick}
      className={`bg-white rounded-xl p-4 mx-4 my-2 shadow-sm ${statusStyle.borderColor}`}
    >
      <View
        className={`self-start ${statusStyle.backgroundColor} px-3 py-1 rounded-full mb-3 flex-row items-center`}
      >
        <Text className={`text-xs ${statusStyle.textColor} font-pbold mr-2`}>
          {statusStyle.label} -
        </Text>
        <View className="flex-row items-center">
          <MaterialIcons
            name="calendar-today"
            size={16}
            color={
              (statusStyle.textColor && COLOR_MAP[statusStyle.textColor]) ||
              "#4b5563"
            }
            style={{ marginRight: 6 }}
          />
          <Text className={`text-sm font-psemibold ${statusStyle.textColor}`}>
            {formattedDate}
          </Text>
        </View>
      </View>

      <View className="flex flex-row items-center mb-3">
        {renderAvatar()}
        <View className="ml-3 flex-1">
          <Text className="text-base font-pbold text-gray-800">
            {displayNurseName}
          </Text>

          <View className="flex flex-row items-center mt-2">
            <Image source={IconTime} className="w-4 h-4 mr-1" />
            <Text className="text-sm text-gray-500 ml-1 font-pmedium">{formattedTime}</Text>
            <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
            <Text className="text-sm text-gray-500 ml-1 font-pmedium">
              {calculateEndTime()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AppointmentCard;
