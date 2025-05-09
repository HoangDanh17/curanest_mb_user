import React from "react";
import { View, SectionList, Text, Image } from "react-native";
import { AppointmentListNurse, StatusStyle } from "@/types/appointment";
import AppointmentCard from "@/components/AppointmentCard";

const STATUS_STYLES: Record<string, StatusStyle> = {
  waiting: {
    backgroundColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-2 border-amber-500",
    label: "Chờ xác nhận",
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

const COLOR_MAP: Record<string, string> = {
  "text-amber-600": "#d97706",
  "text-sky-600": "#0284c7",
  "text-violet-600": "#7c3aed",
};

export interface AppointmentProps {
  appointment: AppointmentListNurse[];
  selectName: string;
}

const UpcomingScreen = ({ appointment, selectName }: AppointmentProps) => {
  const sortAppointmentsByDate = (appointments: AppointmentListNurse[]) => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a["est-date"]).getTime();
      const dateB = new Date(b["est-date"]).getTime();
      return dateA - dateB;
    });
  };

  const groupedAppointments = {
    waiting: sortAppointmentsByDate(
      appointment.filter((item) => item.status === "waiting")
    ),
    confirmed: sortAppointmentsByDate(
      appointment.filter((item) => item.status === "confirmed")
    ),
    changed: sortAppointmentsByDate(
      appointment.filter((item) => item.status === "changed")
    ),
  };

  const sections = [
    {
      title: "waiting",
      data: groupedAppointments.waiting,
    },
    {
      title: "changed",
      data: groupedAppointments.changed,
    },
    {
      title: "confirmed",
      data: groupedAppointments.confirmed,
    },
  ].filter((section) => section.data.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentCard
            id={item.id}
            avatar={item.nurse?.["nurse-picture"]}
            nurseName={item.nurse?.["nurse-name"]}
            packageId={item["cuspackage-id"]}
            nurseId={item["nursing-id"]}
            patientId={item["patient-id"]}
            time={item["est-date"]}
            actTime={item["act-date"]}
            duration={item["total-est-duration"]}
            status={item.status}
            selectName={String(selectName)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => {
          const statusStyle = STATUS_STYLES[title] || {
            textColor: "text-gray-600",
            label: title,
          };
          return (
            <View
              className={`px-4 py-2 ${statusStyle.backgroundColor} border-l-4`}
              style={{
                borderLeftColor:
                  (statusStyle.textColor && COLOR_MAP[statusStyle.textColor]) ||
                  "#4b5563",
              }}
            >
              <Text className={`text-lg font-pbold ${statusStyle.textColor}`}>
                {statusStyle.label}
              </Text>
            </View>
          );
        }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center my-4">
            <Image
              source={{
                uri: "https://cdni.iconscout.com/illustration/premium/thumb/man-with-no-schedule-illustration-download-in-svg-png-gif-file-formats--calendar-appointment-empty-state-pack-people-illustrations-10920936.png",
              }}
              className="w-48 h-48 mb-2"
              resizeMode="contain"
            />
            <Text className="text-lg text-gray-600">Không có lịch hẹn</Text>
          </View>
        }
      />
    </View>
  );
};

export default UpcomingScreen;
