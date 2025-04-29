import { Text, View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import AppointmentCard from "@/components/AppointmentCard";
import { AppointmentProps } from "@/components/appointment/UpcomingScreen";
import { Image } from "react-native";

const InProgressScreen = ({ appointment }: AppointmentProps) => {
  const sortedAppointments = [...appointment].sort((a, b) => {
    const dateA = new Date(a["est-date"]).getTime();
    const dateB = new Date(b["est-date"]).getTime();
    return dateA - dateB;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Animated.FlatList
        data={sortedAppointments}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={false}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            layout={Layout.springify()}
          >
            <AppointmentCard
              id={item.id}
              avatar={item.nurse?.["nurse-picture"]}
              nurseName={item.nurse?.["nurse-name"]}
              time={item["est-date"]}
              status={item.status}
              packageId={item["cuspackage-id"]}
              nurseId={item["nursing-id"]}
              actTime={item["act-date"]}
              patientId={item["patient-id"]}
              duration={item["total-est-duration"]}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center my-4">
            <Image
              source={{
                uri: "https://cdni.iconscout.com/illustration/premium thumb/man-with-no-schedule-illustration-download-in-svg-png-gif-file-formats--calendar-appointment-empty-state-pack-people-illustrations-10920936.png",
              }}
              className="w-48 h-48 mb-2"
              resizeMode="contain"
            />
            <Text className="text-lg text-gray-600">
              Không có lịch hẹn sắp tới
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default InProgressScreen;
