import React from "react";
import { View, SectionList, Text } from "react-native";
import { AppointmentListNurse, StatusStyle } from "@/types/appointment";
import AppointmentCard from "@/components/AppointmentCard";

// Define status styles for headers (matching AppointmentCard)
const STATUS_STYLES: Record<string, StatusStyle> = {
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
  waiting: {
    backgroundColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-2 border-amber-500",
    label: "Chờ xác nhận",
  },
};

// Color map for text colors
const COLOR_MAP: Record<string, string> = {
  "text-amber-600": "#d97706",
  "text-sky-600": "#0284c7",
  "text-violet-600": "#7c3aed",
};

export interface AppointmentProps {
  appointment: AppointmentListNurse[];
}

const UpcomingScreen = ({ appointment }: AppointmentProps) => {
  // Group appointments by status
  const groupedAppointments = {
    confirmed: appointment.filter((item) => item.status === "confirmed"),
    changed: appointment.filter((item) => item.status === "changed"),
    waiting: appointment.filter((item) => item.status === "waiting"),
  };

  // Create sections for SectionList in the desired order
  const sections = [
    {
      title: "confirmed",
      data: groupedAppointments.confirmed,
    },
    {
      title: "changed",
      data: groupedAppointments.changed,
    },
    {
      title: "waiting",
      data: groupedAppointments.waiting,
    },
  ].filter((section) => section.data.length > 0); // Only include sections with data

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 8 }}>
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
            duration={item["total-est-duration"]}
            status={item.status}
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
                borderLeftColor: statusStyle.textColor && COLOR_MAP[statusStyle.textColor] || "#4b5563",
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
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-base font-pmedium">
              Không có lịch hẹn nào
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default UpcomingScreen;