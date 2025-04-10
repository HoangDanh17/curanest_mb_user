import React from "react";
import { View, FlatList } from "react-native";

import { AppointmentCardProps } from "@/types/appointment";
import AppointmentCard from "@/components/AppointmentCard";
import { AppointmentProps } from "@/components/appointment/UpcomingScreen";

const CompletedScreen = ({ appointment }: AppointmentProps) => (
  <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 8 }}>
    <FlatList
      data={appointment}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AppointmentCard
          id={item.id}
          avatar={item.nurse?.["nurse-picture"]}
          nurseName={item.nurse?.["nurse-name"]}
          time={item["est-date"]}
          status={item.status}
          packageId={item["cuspackage-id"]}
          nurseId={item["nursing-id"]}
          patientId={item["patient-id"]}
        />
      )}
    />
  </View>
);

export default CompletedScreen;
