import { View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import AppointmentCard from "@/components/AppointmentCard";
import { AppointmentProps } from "@/components/appointment/UpcomingScreen";

const InProgressScreen = ({ appointment }: AppointmentProps) => {
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 8 }}>
      <Animated.FlatList
        data={appointment}
        keyExtractor={(item) => item.id}
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
              patientId={item["patient-id"]}
            />
          </Animated.View>
        )}
      />
    </View>
  );
};

export default InProgressScreen;
