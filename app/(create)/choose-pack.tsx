import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBack from "@/components/HeaderBack";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import serviceApiRequest from "@/app/api/serviceApi";
import { ServicePack, ServiceTask } from "@/types/service";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Image } from "react-native";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const ServiceCategoryCard = ({
  package: pkg,
  isExpanded,
  onToggle,
  onChoose,
  tasks,
  fetchTasks,
}: {
  package: ServicePack;
  isExpanded: boolean;
  onToggle: () => void;
  onChoose: (pkg: ServicePack) => void;
  tasks: ServiceTask[] | null;
  fetchTasks: (packageId: string) => Promise<void>;
}) => {
  const totalDuration = tasks
    ? tasks.reduce((sum, task) => sum + task["est-duration"], 0)
    : 0;
  const totalPrice = tasks
    ? tasks.reduce((sum, task) => sum + task.cost, 0)
    : 0;

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withTiming(isExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isExpanded, animationProgress]);

  const iconStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      animationProgress.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  useEffect(() => {
    if (Platform.OS === "ios") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } else {
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }
  }, [isExpanded]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
    };
  });

  return (
    <View className="border-b border-gray-200">
      <TouchableOpacity onPress={onToggle} className="px-4 py-3">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center">
              <Text
                className="font-pbold text-gray-900 text-xl flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {pkg.name}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Text className="font-psemibold text-gray-500 text-sm">
                {pkg["combo-days"] === 0 ? "1" : pkg["combo-days"]} lần
              </Text>
            </View>
            {pkg.discount > 0 && (
              <View className="flex-row items-center mt-1">
                <Text className="font-pmedium text-green-600 text-sm">
                  Giảm {pkg.discount}%
                </Text>
              </View>
            )}
          </View>
          <Animated.View style={iconStyle}>
            <Ionicons name="chevron-down" size={24} color="#6B7280" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          style={contentAnimatedStyle}
          className="px-4 py-4 bg-gray-50"
        >
          <View className="mb-4">
            <Text className="font-pbold text-gray-800 text-base mb-1">
              Mô tả
            </Text>
            <Text className="font-pregular text-gray-600 text-md">
              {pkg.description}
            </Text>
          </View>

          {tasks ? (
            <View className="mb-2">
              <Text className="font-pbold text-gray-800 text-base mb-2">
                Gói bao gồm
              </Text>
              {tasks.map((task) => (
                <View
                  key={task.id}
                  className="py-3 border-b border-gray-300 last:border-b-2 rounded-lg px-3 mb-2 gap-2"
                >
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="font-pextrabold text-gray-800 flex-1"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {task["task-order"]}. {task.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-pregular text-gray-700 ">
                      {task["est-duration"]} phút
                    </Text>
                    <Text className="font-pregular text-gray-700 ">
                      {task.cost.toLocaleString()} VND / lần
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="font-pregular text-gray-500 text-sm mb-4">
              Đang tải tasks...
            </Text>
          )}

          <View className="pt-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-pmedium text-gray-800">Tổng thời gian</Text>
              <Text className="font-pbold text-red-600">
                {totalDuration} phút
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-pmedium text-gray-800">Tổng chi phí</Text>
              <Text className="font-pbold text-red-600">
                {totalPrice.toLocaleString()} VND
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onChoose(pkg)}
              className="bg-teal-500 py-2 rounded-full"
            >
              <Text className="font-pmedium text-white text-center text-base">
                Chọn dịch vụ
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};
const ChoosingPackScreen = () => {
  const { id, patient } = useLocalSearchParams();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [taskCache, setTaskCache] = useState<{ [key: string]: ServiceTask[] }>(
    {}
  );
  const [servicePackages, setServicePackages] = useState<ServicePack[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [filter, setFilter] = useState<"all" | "single" | "multi">("all");

  const fetchTasks = useCallback(
    async (packageId: string) => {
      if (taskCache[packageId]) return;

      setLoadingTasks((prev) => ({ ...prev, [packageId]: true }));
      try {
        const response = await serviceApiRequest.getListServiceTask(packageId);
        const tasks: ServiceTask[] = response.payload.data;
        setTaskCache((prev) => ({ ...prev, [packageId]: tasks }));
      } catch (error) {
        console.error(
          `Error fetching tasks for packageId ${packageId}:`,
          error
        );
      } finally {
        setLoadingTasks((prev) => ({ ...prev, [packageId]: false }));
      }
    },
    [taskCache]
  );

  const handleCategoryToggle = useCallback(
    async (packageName: string, packageId: string) => {
      if (expandedCategory !== packageName) {
        fetchTasks(packageId);
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedCategory((prev) =>
        prev === packageName ? null : packageName
      );
    },
    [expandedCategory, fetchTasks]
  );

  const handleChooseCategory = useCallback((pkg: ServicePack) => {
    setSelectedCategoryName(pkg.name);
    router.push({
      pathname: "/(create)/detail-pack",
      params: {
        id: pkg.id as string,
        serviceId: pkg["service-id"] as string,
        name: pkg.name as string,
        description: pkg.description as string,
        day: pkg["combo-days"] as number,
        timeInter: pkg["time-interval"] as number,
        patient: patient,
      },
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const response = await serviceApiRequest.getListServicePack(id);
      const packages: ServicePack[] = response.payload.data;
      setServicePackages(packages);
    } catch (error) {
      console.error("Error fetching service packages:", error);
    } finally {
      setLoadingPackages(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPackages = servicePackages.filter((pkg) => {
    if (filter === "all") return true;
    if (filter === "single") return pkg["combo-days"] < 2;
    if (filter === "multi") return pkg["combo-days"] >= 2;
    return false;
  });

  const renderCategorySection = (title: string, packages: ServicePack[]) => {
    if (packages.length === 0 && filter !== "all") {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Image
            source={{
              uri: "https://img.freepik.com/premium-vector/vector-illustration-about-concept-no-items-found-no-results-found_675567-6604.jpg?semt=ais_hybrid",
            }}
            style={{ width: 150, height: 150, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text className="font-pbold text-gray-500 text-lg text-center">
            Không có gói dịch vụ {title.toLowerCase()} nào hiện tại
          </Text>
        </View>
      );
    }

    if (packages.length === 0) return null;

    return (
      <View className="py-4">
        <Text className="font-pbold text-teal-500 text-2xl px-4 mb-3">
          {title}
        </Text>
        {packages.map((pkg) => (
          <ServiceCategoryCard
            key={pkg.id}
            package={pkg}
            isExpanded={expandedCategory === pkg.name}
            onToggle={() => handleCategoryToggle(pkg.name, pkg.id)}
            onChoose={handleChooseCategory}
            tasks={taskCache[pkg.id] || null}
            fetchTasks={fetchTasks}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="p-2"
        showsVerticalScrollIndicator={false}
      >
        <HeaderBack />
        <View className="flex-row justify-between px-4 mt-4 mb-6">
          <TouchableOpacity
            onPress={() => setFilter("all")}
            className={`mx-1 px-4 py-2 rounded-full ${
              filter === "all" ? "bg-teal-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-pbold text-base ${
                filter === "all" ? "text-white" : "text-gray-700"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("single")}
            className={`flex-1 mx-1 py-2 rounded-full ${
              filter === "single" ? "bg-teal-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-pbold text-base ${
                filter === "single" ? "text-white" : "text-gray-700"
              }`}
            >
              Gói 1 lần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("multi")}
            className={`flex-1 mx-1 py-2 rounded-full ${
              filter === "multi" ? "bg-teal-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-pbold text-base ${
                filter === "multi" ? "text-white" : "text-gray-700"
              }`}
            >
              Gói nhiều lần
            </Text>
          </TouchableOpacity>
        </View>

        {loadingPackages ? (
          <Text className="font-pregular text-gray-500 text-base text-center mt-4">
            Đang tải gói dịch vụ...
          </Text>
        ) : filter === "all" ? (
          <>
            {renderCategorySection(
              "Gói 1 lần",
              filteredPackages.filter((pkg) => pkg["combo-days"] < 2)
            )}
            {renderCategorySection(
              "Gói nhiều lần",
              filteredPackages.filter((pkg) => pkg["combo-days"] >= 2)
            )}
          </>
        ) : (
          renderCategorySection(
            filter === "single" ? "Gói 1 lần" : "Gói nhiều lần",
            filteredPackages
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default ChoosingPackScreen;
