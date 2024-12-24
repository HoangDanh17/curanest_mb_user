import React from "react";
import { View, FlatList } from "react-native";

import { AppointmentCardProps } from "@/types/appointment";
import AppointmentCard from "@/components/AppointmentCard";

const appointments: AppointmentCardProps[] = [
  {
    id: "1",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "completed",
  },
  {
    id: "2",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "completed",
  },
];

const CompletedScreen = () => (
  <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 8 }}>
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AppointmentCard
          id={item.id}
          avatar={item.avatar}
          nurseName={item.nurseName}
          time={item.time}
          date={item.date}
          services={item.services}
          status={item.status}
        />
      )}
    />
  </View>
);

export default CompletedScreen;
