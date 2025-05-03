import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import IconCalendar from "@/assets/icon/calendar-range.png";
import CompletedScreen from "@/components/appointment/CompletedScreen";
import InProgressScreen from "@/components/appointment/InProgressScreen";
import UpcomingScreen from "@/components/appointment/UpcomingScreen";
import { Patient } from "@/types/patient";
import patientApiRequest from "@/app/api/patientApi";
import appointmentApiRequest from "@/app/api/appointmentApi";
import { AppointmentList, AppointmentListNurse } from "@/types/appointment";
import nurseApiRequest from "@/app/api/nurseApi";
import { ListNurseData } from "@/types/nurse";
import { useFocusEffect } from "expo-router";

const Tab = createMaterialTopTabNavigator();

export default function Schedule() {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<AppointmentList[]>([]);
  const [searchResult, setSearchResult] = useState<ListNurseData[]>([]);
  const [appointmentsWithNurse, setAppointmentsWithNurse] = useState<
    AppointmentListNurse[]
  >([]);
  const [selectName, setSelectName] = useState<string | null>();
  async function fetchPatientList() {
    try {
      const response = await patientApiRequest.getAllPatient();
      setPatientList(response.payload.data);
    } catch (error) {
      console.error("Error fetching patient list:", error);
    }
  }

  async function fetchAppointments(patientId: string) {
    try {
      const response = await appointmentApiRequest.getListAppointment(
        patientId
      );
      setAppointments(response.payload.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }

  const fetchDataNurse = async () => {
    try {
      const response = await nurseApiRequest.getListNurseAll();
      setSearchResult(response.payload.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatientList();
      fetchDataNurse();
    }, [])
  );

  useEffect(() => {
    if (selectedProfile) {
      const selectedPatient = patientList.find(
        (patient) => patient.id === selectedProfile
      );
      if (selectedPatient) {
        fetchAppointments(selectedPatient.id);
      }
    }
  }, [selectedProfile, patientList]);

  useEffect(() => {
    if (appointments.length > 0 && searchResult.length > 0) {
      const updatedAppointments: AppointmentListNurse[] = appointments.map(
        (appt) => ({
          ...appt,
          nurse:
            searchResult.find((n) => n["nurse-id"] === appt["nursing-id"]) ||
            null,
        })
      );
      setAppointmentsWithNurse(updatedAppointments);
    }
  }, [appointments, searchResult]);

  const upcomingAppointments = appointmentsWithNurse.filter(
    (appt) =>
      appt.status === "waiting" ||
      appt.status === "changed" ||
      appt.status === "confirmed"
  );
  const inProgressAppointments = appointmentsWithNurse.filter(
    (appt) => appt.status === "upcoming"
  );
  const completedAppointments = appointmentsWithNurse.filter(
    (appt) => appt.status === "success"
  );

  return (
    <>
      <View className="bg-white flex flex-row items-center justify-between p-4">
        <Text className="text-lg font-pbold mt-6 text-teal-400">
          Lịch hẹn sắp tới
        </Text>
        <Image source={IconCalendar} className="mt-6" tintColor={"#db64bb"} />
      </View>

      <View className="bg-white px-2 pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          <View className="flex flex-row gap-3">
            {patientList.map((patient, index) => (
              <TouchableOpacity
                key={index}
                className={`flex flex-row items-center px-4 py-2.5 rounded-full ${
                  selectedProfile === patient.id
                    ? "bg-[#64DBDB]"
                    : "border border-gray-800"
                }`}
                onPress={() => {
                  setSelectedProfile(patient.id);
                  setSelectName(patient["full-name"]);
                }}
              >
                <Image
                  source={{
                    uri: "https://media.istockphoto.com/id/1459373176/vi/vec-to/n%E1%BB%81n-b%E1%BB%8B-m%E1%BA%A5t-n%C3%A9t-tr%E1%BB%ABu-t%C6%B0%E1%BB%A3ng-m%C3%B9a-xu%C3%A2n-m%C3%B9a-h%C3%A8-bi%E1%BB%83n.jpg?s=612x612&w=0&k=20&c=7qcezfnEnWLDiqaxq5ahyhNl6zTCLZbNQ9wQjeRT7F0=",
                  }}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <Text
                  className={`text-sm font-pmedium ${
                    selectedProfile === patient.id
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {patient["full-name"]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {selectedProfile ? (
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: {
              fontSize: 12,
              textTransform: "none",
              fontWeight: 700,
            },
            tabBarActiveTintColor: "#4B70F5",
            tabBarInactiveTintColor: "#888888",
          }}
        >
          <Tab.Screen
            name="Upcoming"
            options={{
              title: `Đang chờ (${upcomingAppointments.length})`,
              tabBarIndicatorStyle: { backgroundColor: "#FFAD60" },
              tabBarActiveTintColor: "#FFAD60",
            }}
          >
            {() => (
              <UpcomingScreen
                appointment={upcomingAppointments}
                selectName={String(selectName)}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="InProgress"
            options={{
              title: `Sắp tới (${inProgressAppointments.length})`,
              tabBarIndicatorStyle: { backgroundColor: "#4B70F5" },
            }}
          >
            {() => (
              <InProgressScreen
                appointment={inProgressAppointments}
                selectName={String(selectName)}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Completed"
            options={{
              title: `Hoàn thành (${completedAppointments.length})`,
              tabBarIndicatorStyle: { backgroundColor: "#00FF9C" },
              tabBarActiveTintColor: "#00FF9C",
            }}
          >
            {() => (
              <CompletedScreen
                appointment={completedAppointments}
                selectName={String(selectName)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      ) : (
        <View className="flex-1 justify-center items-center bg-white">
          <Image
            source={{
              uri: "https://img.freepik.com/free-vector/select-concept-illustration_114360-383.jpg?w=360",
            }}
            className="w-48 h-48 mb-2"
            resizeMode="contain"
          />
          <Text className="text-lg text-gray-600 font-psemibold">
            Vui lòng chọn hồ sơ trước
          </Text>
        </View>
      )}
    </>
  );
}
