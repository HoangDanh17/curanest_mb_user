import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SystemOptionScreenProps {
  currentMonthYear: string;
  dates: Date[];
  selectedDate: Date | null;
  selectedTime: string | null;
  loadingTime: string | null;
  flatListRef: React.RefObject<FlatList>;
  onViewableItemsChanged: any;
  viewabilityConfig: any;
  handleDateSelect: (date: Date) => void;
  handleTimeSelect: (startTime: string, endTime: string) => void;
  getTimes: (selectedDate: Date | null) => string[];
  renderDateItem: ({ item }: { item: Date }) => JSX.Element;
  renderTimeItem: ({ item }: { item: string }) => JSX.Element;
  translateY: any;
  isLoading: boolean;
  duration: number; // Thêm duration vào props
}

const SystemOptionScreen: React.FC<SystemOptionScreenProps> = ({
  currentMonthYear,
  dates,
  selectedDate,
  selectedTime,
  loadingTime,
  flatListRef,
  onViewableItemsChanged,
  viewabilityConfig,
  handleDateSelect,
  handleTimeSelect,
  getTimes,
  renderDateItem,
  renderTimeItem,
  translateY,
  isLoading,
  duration,
}) => {
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(startDate.getTime() + duration * 60000); 
    let endHour = endDate.getHours();
    let endMinute = endDate.getMinutes();

    if (endHour > 22 || (endHour === 22 && endMinute > 0)) {
      endHour = 22;
      endMinute = 0;
    }

    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
  };

  const generateTimeOptions = (startHour: number, duration: number) => {
    const options: { timeRange: string; id: string }[] = [];
    const maxEndHour = 22; // End time is limited to 22:00

    for (let hour = startHour; hour < maxEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        const endTime = calculateEndTime(startTime, duration);

        const [endHour, endMinute] = endTime.split(":").map(Number);

        if (endHour > maxEndHour || (endHour === maxEndHour && endMinute > 0)) {
          return options; // Stop generating if end time exceeds 22:00
        }

        const latestStartHour = Math.floor((maxEndHour * 60 - duration) / 60);
        const latestStartMinute = ((maxEndHour * 60 - duration) % 60);

        if (hour > latestStartHour || (hour === latestStartHour && minute > latestStartMinute)) {
          return options;
        }

        const uniqueId = `${startTime}-${endTime}-${Math.random()}`;
        options.push({
          timeRange: `${startTime} - ${endTime}`,
          id: uniqueId,
        });
      }
    }

    return options;
  };

  const scrollViewStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(translateY.value, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
    };
  });

  useEffect(() => {
    if (selectedDate && flatListRef.current) {
      const index = dates.findIndex(
        (date) => date.toDateString() === selectedDate.toDateString()
      );
      if (index !== -1) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0, 
        });
      }
    }
  }, [selectedDate]);

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="flex-1 mb-20"
    >
      <Text className="text-lg mb-4 ml-4 my-4 text-gray-700 font-psemibold">
        {currentMonthYear ||
          dates[0].toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          })}
      </Text>
      <View className="mb-2">
        <FlatList
          ref={flatListRef}
          data={dates}
          renderItem={renderDateItem}
          keyExtractor={(item, index) => `${item.toDateString()}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={dates.length}
          getItemLayout={(data, index) => {
            const itemWidth = 63;
            const marginX = 4;
            const totalItemWidth = itemWidth + marginX * 2;
            
            return {
              length: totalItemWidth,
              offset: totalItemWidth * index,
              index,
            };
          }}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ 
                  index: info.index, 
                  animated: true,
                  viewPosition: 0, 
                });
              }
            });
          }}
        />
      </View>
      {selectedDate && (
        <>
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#64C1DB" />
            </View>
          ) : getTimes(selectedDate).length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-2xl text-gray-500 font-psemibold">
                Không có thời gian phù hợp
              </Text>
            </View>
          ) : (
            <Animated.View entering={FadeIn.duration(500)} style={scrollViewStyle}>
              <ScrollView
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View className="flex-col w-full">
                  {generateTimeOptions(8, duration).map((option) => (
                    <View key={option.id} className="w-full p-2">
                      {renderTimeItem({ item: option.timeRange })}
                    </View>
                  ))}
                </View>
                <Text className="text-center text-3xl text-gray-200 font-pbold mb-20">
                  ⦿
                </Text>
              </ScrollView>
            </Animated.View>
          )}
        </>
      )}
    </Animated.View>
  );
};

export default SystemOptionScreen;
