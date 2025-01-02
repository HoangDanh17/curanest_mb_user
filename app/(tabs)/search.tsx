import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import DoctorCard from "@/components/DoctorCard";
import DATA from "@/data/NurseData";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type SelectedFilter = {
  district: string | null;
  service: string | null;
};

const SearchNurseScreen = () => {
  const [text, onChangeText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>({
    district: null,
    service: null,
  });

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = ["50%", "50%"];

  const filters = {
    districts: ["Quận 1", "Quận 2", "Quận 3","Quận 4","Quận 5","Quận 6","Quận 7","Quận 8"],
    services: ["Dịch vụ 1", "Dịch vụ 2", "Dịch vụ 3"],
  };

  const handleFilterSelect = (type: keyof SelectedFilter, value: string) => {
    setSelectedFilter((prev) => {
      if (prev[type] === value) {
        return { ...prev, [type]: null };
      } else {
        return { ...prev, [type]: value };
      }
    });
  };

  const handlePressCard = (id: string) => {
    router.push({
      pathname: "/detail-nurse/[id]",
      params: { id },
    });
  };

  const clearFilters = () => {
    setSelectedFilter({ district: null, service: null });
    console.log("Filters cleared");
  };

  const confirmFilters = () => {
    closeBottomSheet();
  };

  const openBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const renderHeader = () => (
    <View style={{ marginBottom: 16 }}>
      <Image
        className="rounded-xl"
        style={StyleSheet.absoluteFill}
        source={{
          uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzQI0ZnD1laFG92t0h-fYm-e25ZAomYYKYTCzaMhB-_wu5trmb2KYrhkVNaqsabqRLWto&usqp=CAU",
        }}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginLeft: 16,
          marginTop: 16,
        }}
      >
        Tìm kiếm điều dưỡng
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          margin: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 24,
            borderWidth: 2,
            borderColor: "black",
            paddingHorizontal: 16,
            flex: 1,
          }}
        >
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={{ flex: 1, fontSize: 16, color: "#555" }}
            onChangeText={onChangeText}
            value={text}
            placeholder="Tìm kiếm điều dưỡng"
            placeholderTextColor="#888"
          />
        </View>
        <TouchableOpacity onPress={openBottomSheet} style={{ marginLeft: 8 }}>
          <View
            style={{
              padding: 12,
              borderWidth: 2,
              borderColor: "#64D1CB",
              borderRadius: 24,
            }}
          >
            <Ionicons name="filter" size={20} color="#64D1CB" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flex: 1, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <DoctorCard
                data={DATA}
                handlePress={handlePressCard}
                ListHeaderComponent={renderHeader}
              />
            </View>

            <BottomSheetModal
              ref={bottomSheetModalRef}
              snapPoints={snapPoints}
              enablePanDownToClose
              backdropComponent={renderBackdrop}
              backgroundStyle={{
                backgroundColor: "white",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: -4,
                },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
              handleIndicatorStyle={{
                backgroundColor: "#DEDEDE",
                width: 40,
                height: 4,
              }}
            >
              <BottomSheetView style={{ paddingHorizontal: 16 }}>
                <Text
                  style={{ fontWeight: "600", color: "#555", marginBottom: 8 }}
                >
                  Quận
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {filters.districts.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => handleFilterSelect("district", item)}
                      style={{
                        marginRight: 8,
                        marginBottom: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 15,
                        borderWidth: 2,
                        backgroundColor:
                          selectedFilter.district === item
                            ? "#64D1CB"
                            : "white",
                        borderColor: "#64D1CB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color:
                            selectedFilter.district === item ? "white" : "#555",
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text
                  style={{
                    fontWeight: "600",
                    color: "#555",
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  Dịch vụ
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {filters.services.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => handleFilterSelect("service", item)}
                      style={{
                        marginRight: 8,
                        marginBottom: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 15,
                        borderWidth: 2,
                        backgroundColor:
                          selectedFilter.service === item ? "#64D1CB" : "white",
                        borderColor: "#64D1CB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color:
                            selectedFilter.service === item ? "white" : "#555",
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 16,
                  }}
                >
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: "white",
                      borderWidth: 2,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: 12,
                        color: "black",
                      }}
                    >
                      Xóa filter
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmFilters}
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: "#64D1CB",
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: 12,
                        color: "white",
                      }}
                    >
                      Xác nhận
                    </Text>
                  </TouchableOpacity>
                </View>
              </BottomSheetView>
            </BottomSheetModal>
          </View>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default SearchNurseScreen;
