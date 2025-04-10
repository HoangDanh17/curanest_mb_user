import React from "react";
import { View, FlatList } from "react-native";

import {
  AppointmentListNurse,
} from "@/types/appointment";
import AppointmentCard from "@/components/AppointmentCard";

export interface AppointmentProps {
  appointment: AppointmentListNurse[];
}

const UpcomingScreen = ({ appointment }: AppointmentProps) => {
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 8 }}>
      <FlatList
        data={appointment}
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
            status={item.status}
          />
        )}
      />
    </View>
  );
};

export default UpcomingScreen;
