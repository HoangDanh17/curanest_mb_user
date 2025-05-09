import React from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import AppointmentCard from "@/components/AppointmentCard";
import { AppointmentProps } from "@/components/appointment/UpcomingScreen";

const CompletedScreen = ({ appointment, selectName }: AppointmentProps) => {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <FlatList
        data={appointment}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <View>
            <AppointmentCard
              id={item.id}
              avatar={item.nurse?.["nurse-picture"]}
              nurseName={item.nurse?.["nurse-name"]}
              time={item["est-date"]}
              status={item.status}
              packageId={item["cuspackage-id"]}
              actTime={item["act-date"]}
              nurseId={item["nursing-id"]}
              patientId={item["patient-id"]}
              duration={item["total-est-duration"]}
              selectName={String(selectName)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center ">
            <Image
              source={{
                uri: "https://cdni.iconscout.com/illustration/premium/thumb/man-with-no-schedule-illustration-download-in-svg-png-gif-file-formats--calendar-appointment-empty-state-pack-people-illustrations-10920936.png",
              }}
              className="w-48 h-48 mb-2"
              resizeMode="contain"
            />
            <Text className="text-lg text-gray-600">
              Không có lịch hẹn hoàn thành
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default CompletedScreen;