import { View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { AppointmentCardProps } from "@/types/appointment";
import AppointmentCard from "@/components/AppointmentCard";
import { useCallback, useState } from "react";

const appointments: AppointmentCardProps[] = [
  {
    id: "1",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "2",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "3",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "4",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "5",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "6",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "7",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "8",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "9",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "10",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "11",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "12",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "13",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "14",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "15",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
  {
    id: "16",
    avatar:
      "https://www.careerstaff.com/wp-content/uploads/2023/07/hospital-setting-nurse-career.png",
    nurseName: "Dr. Cynthia Chisom",
    time: "4:00 PM - 4:45 PM",
    date: new Date("2024-05-10"),
    services: ["Khám tổng quát", "Tiêm vaccine"],
    status: "upcoming",
  },
];

const InProgressScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(appointments);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setData([...appointments].sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 8 }}>
      <Animated.FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            layout={Layout.springify()}
          >
            <AppointmentCard
              id={item.id}
              avatar={item.avatar}
              nurseName={item.nurseName}
              time={item.time}
              date={item.date}
              services={item.services}
              status={item.status}
            />
          </Animated.View>
        )}
      />
    </View>
  );
};

export default InProgressScreen;
