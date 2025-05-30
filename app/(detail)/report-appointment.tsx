import HeaderBack from "@/components/HeaderBack";
import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";

interface Report {
  id: string;
  date: string;
  title: string;
  nurseNote: string;
  customerNote: string;
  time: number;
  numberOfTimes: number;
  status: "done" | "not_done";
}

interface ReportAppointmentItemProps {
  report: Report;
  index: number;
}

const ReportAppointmentItem: React.FC<ReportAppointmentItemProps> = ({
  report,
  index,
}) => {
  const isCompleted = report.status === "done";

  return (
    <View className="mb-6">
      <View
        className={`flex-row items-center justify-between p-4 rounded-lg shadow ${
          isCompleted ? "bg-green-500" : "bg-[#64CBDD]"
        }`}
      >
        <View className="flex-1 mr-3">
          <Text className="text-white text-lg font-pbold flex-wrap">
            {`${index + 1}. ${report.title}`}
          </Text>
        </View>
        <View className="w-8 h-8 border-2 rounded flex items-center justify-center bg-white">
          {isCompleted && <Text className="text-green-500 font-pbold">✔</Text>}
        </View>
      </View>

      <View className="bg-white rounded-lg shadow p-4">
        <View className="flex-row flex-wrap justify-between p-2 gap-4">
          <View className="gap-1">
            <Text className="font-psemibold">Ghi chú của khách hàng: </Text>
            <Text className="text-base text-gray-400 font-pmedium">
              {report.customerNote}
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap justify-between p-2">
          <View>
            <Text className="text-base text-gray-400 font-pmedium">
              <Text className="font-psemibold text-gray-800">Thời gian: </Text>
              {report.time} phút
            </Text>
          </View>
          <View>
            <Text className="text-base text-gray-400 font-pmedium">
              <Text className="font-psemibold text-gray-800">Số lần: </Text>
              {report.numberOfTimes}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const ReportAppointment: React.FC = () => {
  const { listTask } = useLocalSearchParams();
  const parsedlistTask: any[] = listTask ? JSON.parse(String(listTask)) : [];

  const reports: Report[] = parsedlistTask.map((task) => ({
    id: task.id,
    date: format(new Date(task["est-date"]), "dd/MM/yyyy"),
    title: task.name,
    nurseNote: task["staff-advice"] || "Chưa có ghi chú",
    customerNote: task["client-note"] || "Chưa có ghi chú",
    time: task["est-duration"],
    numberOfTimes: task["total-unit"],
    status: task.status as "done" | "not_done",
  }));

  return (
    <FlatList
      data={reports}
      removeClippedSubviews={false}
      ListHeaderComponent={
        <View className="m-4 ml-0 mt-8">
          <HeaderBack />
        </View>
      }
      ListFooterComponent={
        <View className="flex-row justify-end mb-6">
          <TouchableOpacity
            className="px-6 py-3 bg-[#64CBDD] rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-pmedium">Quay lại</Text>
          </TouchableOpacity>
        </View>
      }
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <ReportAppointmentItem report={item} index={index} />
      )}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default ReportAppointment;
