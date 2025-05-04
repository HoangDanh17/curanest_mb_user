import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import HeaderBack from "@/components/HeaderBack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import serviceApiRequest from "@/app/api/serviceApi";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

interface ServiceTask {
  id: string;
  "is-must-have": boolean;
  name: string;
  description?: string;
  "est-duration": number;
  cost: number;
  "additional-cost": number;
  unit: string;
  "price-of-step": number;
}

interface ServiceItemProps {
  service: ServiceTask;
  index: number;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onNoteChange: (id: string, note: string) => void;
  note: string;
}

const calculateServiceMetrics = (service: ServiceTask, quantity: number) => {
  const priceOfStep = service["price-of-step"] || 1;
  const initialQuantity = service.unit === "time" ? service["est-duration"] : 1;
  const excessQuantity = Math.max(0, quantity - initialQuantity);
  const additionalUnits =
    priceOfStep === 0 ? 0 : Math.floor(excessQuantity / priceOfStep);
  const additionalCost = service["additional-cost"] * additionalUnits;
  const totalCost = service.cost + additionalCost;
  const duration =
    service.unit === "time"
      ? quantity
      : service["est-duration"] * (quantity / priceOfStep);

  return {
    additionalCost,
    totalCost,
    duration,
    additionalUnits,
    displayQuantity:
      service.unit === "time" ? quantity : quantity / priceOfStep,
    unitLabel: service.unit === "time" ? "phút" : "lần",
  };
};

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  onDelete,
  onQuantityChange,
  onNoteChange,
  note,
}) => {
  const animation = useSharedValue(0);
  const initialQuantity = service.unit === "time" ? service["est-duration"] : 1;
  const [quantity, setQuantity] = useState(initialQuantity);

  React.useEffect(() => {
    animation.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
  }, [animation, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    transform: [{ translateY: (1 - animation.value) * 20 }],
  }));

  const confirmDelete = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa dịch vụ này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => onDelete(service.id),
      },
    ]);
  };

  const {
    additionalCost,
    totalCost,
    duration,
    additionalUnits,
    displayQuantity,
    unitLabel,
  } = calculateServiceMetrics(service, quantity);

  const priceOfStep = service["price-of-step"] || 1;
  const showAdditionalCost = additionalCost > 0;

  const handleQuantityUpdate = (newQuantity: number) => {
    setQuantity(newQuantity);
    onQuantityChange(service.id, newQuantity);
  };

  return (
    <Animated.View
      style={animatedStyle}
      className="p-4 bg-white rounded-lg mb-3 shadow gap-2"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-pbold text-gray-800 flex-1">
          {service.name}
        </Text>
        {!service["is-must-have"] && (
          <TouchableOpacity
            onPress={confirmDelete}
            className="w-10 h-10 bg-red-100 rounded-full items-center justify-center ml-1"
          >
            <SimpleLineIcons name="trash" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>
      {service.description && (
        <Text className="text-gray-600 mt-1 font-pmedium">
          {service.description}
        </Text>
      )}
      {service["price-of-step"] !== 0 && (
        <Text className="text-red-500 mt-1 font-pmedium">
          Chi phí nếu sử dụng thêm:{" "}
          {service["additional-cost"].toLocaleString()} VND /{" "}
          {service["price-of-step"]} {unitLabel}
        </Text>
      )}
      <View className="flex-col mt-3">
        <View className="flex flex-col items-end">
          <Text className="text-gray-600 font-pbold">{duration} phút</Text>
          <Text className="text-gray-700 font-pbold">
            {service.cost.toLocaleString()} VND
          </Text>
          {showAdditionalCost && (
            <Text className="text-red-700 font-pbold">
              + {additionalCost.toLocaleString()} VND (x{additionalUnits})
            </Text>
          )}
        </View>
      </View>
      {service["price-of-step"] !== 0 && (
        <View className="flex-row items-center justify-end space-x-2">
          <TouchableOpacity
            onPress={() =>
              handleQuantityUpdate(
                Math.max(initialQuantity, quantity - priceOfStep)
              )
            }
            className="w-9 h-9 bg-white rounded-full items-center justify-center border border-gray-200"
          >
            <Text className="text-lg">-</Text>
          </TouchableOpacity>
          <Text className="text-lg font-psemibold text-gray-800 mx-2">
            {displayQuantity} {unitLabel}
          </Text>
          <TouchableOpacity
            onPress={() => handleQuantityUpdate(quantity + priceOfStep)}
            className="w-9 h-9 bg-white rounded-full items-center justify-center border border-gray-200"
          >
            <Text className="text-lg">+</Text>
          </TouchableOpacity>
        </View>
      )}
      <View className="mb-2">
        <Text className="text-lg font-pbold text-gray-800">Ghi chú</Text>
        <TextInput
          placeholder="Nhập ghi chú cho task này"
          value={note}
          onChangeText={(text) => onNoteChange(service.id, text)}
          multiline
          numberOfLines={3}
          className="border rounded-lg p-2 mt-2 h-20 font-psemibold text-gray-500"
          style={{ textAlignVertical: "top", textAlign: "left" }}
        />
      </View>
    </Animated.View>
  );
};

const AdditionalTaskScreen = () => {
  const { id, name, serviceId, day, discount, description } =
    useLocalSearchParams();
  const [services, setServices] = useState<ServiceTask[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [availableTasks, setAvailableTasks] = useState<ServiceTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const modalKey = useRef(0); // Ref to generate unique modal keys

  // Debug state changes
  useEffect(() => {
    console.log("modalVisible changed:", modalVisible);
    console.log("services changed:", services);
    console.log("availableTasks changed:", availableTasks);
  }, [modalVisible, services, availableTasks]);

  const fetchAvailableTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await serviceApiRequest.getListServiceTask(serviceId);
      const apiData = response.payload.data;
      console.log("API Response:", apiData);
      if (!Array.isArray(apiData)) {
        console.warn("API data is not an array, defaulting to empty array");
        setAvailableTasks([]);
        return;
      }
      const mappedTasks: ServiceTask[] = apiData
        .filter((item: any) => !services.some((s) => s.id === item.id))
        .map((item: any) => ({
          id: item.id,
          "is-must-have": false,
          name: item.name,
          description: item.description,
          "est-duration": item["est-duration"],
          cost: item.cost,
          "additional-cost": item["additional-cost"],
          unit: item.unit,
          "price-of-step": item["price-of-step"],
        }));
      console.log("Filtered Tasks:", mappedTasks);
      setAvailableTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching available tasks:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách task. Vui lòng thử lại.");
      setAvailableTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const openModal = () => {
    console.log("Opening modal");
    modalKey.current += 1; // Increment key for fresh render
    setModalVisible(true);
    fetchAvailableTasks();
  };

  const closeModal = () => {
    console.log("Closing modal");
    setModalVisible(false);
  };

  const handleAddTask = (task: ServiceTask) => {
    console.log("Adding task:", task);
    setServices((prev) => {
      const newServices = [...prev, task];
      console.log("Updated services:", newServices);
      return newServices;
    });
    setQuantities((prev) => ({
      ...prev,
      [task.id]: task.unit === "time" ? task["est-duration"] : 1,
    }));
    setNotes((prev) => ({ ...prev, [task.id]: "" }));
    closeModal(); // Synchronous close after state updates
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }));
  };

  const handleNoteChange = (id: string, note: string) => {
    setNotes((prev) => ({ ...prev, [id]: note }));
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[id];
      return newQuantities;
    });
    setNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[id];
      return newNotes;
    });
  };

  const calculateTotals = () => {
    const totalDuration = services.reduce((sum, service) => {
      const quantity = quantities[service.id] || 1;
      return sum + calculateServiceMetrics(service, quantity).duration;
    }, 0);

    const totalPricePerDay = services.reduce((sum, service) => {
      const quantity = quantities[service.id] || 1;
      return sum + calculateServiceMetrics(service, quantity).totalCost;
    }, 0);

    const numberOfDays = Number(day) || 1;
    const discountPercent = Number(discount) || 0;

    const discountedPricePerDay =
      discountPercent > 0
        ? totalPricePerDay * (1 - discountPercent / 100)
        : totalPricePerDay;

    const totalPriceWithDays = totalPricePerDay * numberOfDays;
    const discountedPriceWithDays =
      discountPercent > 0
        ? totalPriceWithDays * (1 - discountPercent / 100)
        : totalPriceWithDays;

    return {
      totalDuration,
      totalPricePerDay,
      discountedPricePerDay: Math.round(discountedPricePerDay),
      totalPriceWithDays,
      discountedPriceWithDays: Math.round(discountedPriceWithDays),
      numberOfDays,
      hasDiscount: discountPercent > 0,
    };
  };

  const handleSubmit = () => {
    if (services.length === 0) {
      Alert.alert(
        "Thông báo",
        "Vui lòng thêm ít nhất một task trước khi tiếp tục."
      );
      return;
    }

    const {
      totalDuration,
      totalPricePerDay,
      discountedPricePerDay,
      totalPriceWithDays,
      discountedPriceWithDays,
      numberOfDays,
    } = calculateTotals();

    const packageInfo = {
      packageId: id,
      packageName: name,
      day,
      serviceId,
      totalDuration,
      totalPrice: numberOfDays > 1 ? totalPriceWithDays : totalPricePerDay,
      discountedPrice:
        numberOfDays > 1 ? discountedPriceWithDays : discountedPricePerDay,
      services: services.map((service) => {
        const quantity = quantities[service.id] || 1;
        const { additionalCost, totalCost, duration } = calculateServiceMetrics(
          service,
          quantity
        );
        return {
          id: service.id,
          name: service.name,
          quantity,
          baseCost: service.cost,
          additionalCost,
          totalCost,
          duration,
          note: notes[service.id] || "",
        };
      }),
      description,
    };

    console.log("Package Info:", packageInfo);
  };

  const {
    totalDuration,
    totalPricePerDay,
    discountedPricePerDay,
    totalPriceWithDays,
    discountedPriceWithDays,
    numberOfDays,
    hasDiscount,
  } = calculateTotals();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        contentContainerStyle={{ padding: 20, marginTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        <HeaderBack />
        <Text className="text-2xl font-pbold text-gray-800 my-5 mb-2">
          {name}
        </Text>
        {description && (
          <Text className="text-gray-600 font-pmedium mb-4 mx-2">
            {description}
          </Text>
        )}
        {services.length === 0 ? (
          <Text className="text-gray-600 text-center my-4">
            Chưa có task nào. Nhấn "Thêm Task" để bắt đầu.
          </Text>
        ) : (
          services.map((s, i) => (
            <ServiceItem
              key={s.id}
              service={s}
              index={i}
              onDelete={handleDelete}
              onQuantityChange={handleQuantityChange}
              onNoteChange={handleNoteChange}
              note={notes[s.id] || ""}
            />
          ))
        )}
        <TouchableOpacity
          onPress={openModal}
          className="bg-[#64D1CB] px-6 py-3 rounded-lg items-center mt-5"
        >
          <Text className="text-white text-base font-pbold">Thêm Task</Text>
        </TouchableOpacity>
        {services.length > 0 && (
          <View className="mt-5 p-4 bg-white rounded-lg shadow">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-pbold">Tổng thời gian:</Text>
              <Text className="text-red-600 font-pbold">
                {totalDuration} phút
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-600 font-pbold">
                Tổng giá {numberOfDays > 1 ? "1 ngày" : ""}:
              </Text>
              <View className="flex-col items-end">
                {hasDiscount && (
                  <Text className="text-gray-500 font-pmedium line-through">
                    {totalPricePerDay.toLocaleString()} VND
                  </Text>
                )}
                <Text className="text-red-600 font-pbold">
                  {discountedPricePerDay.toLocaleString()} VND
                </Text>
              </View>
            </View>
            {numberOfDays > 1 && (
              <View className="flex-row justify-between mt-1">
                <Text className="text-gray-600 font-pbold">
                  Tổng giá {numberOfDays} ngày:
                </Text>
                <View className="flex-col items-end">
                  {hasDiscount && (
                    <Text className="text-gray-500 font-pmedium line-through">
                      {totalPriceWithDays.toLocaleString()} VND
                    </Text>
                  )}
                  <Text className="text-red-600 font-pbold">
                    {discountedPriceWithDays.toLocaleString()} VND
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-[#64D1CB] px-6 py-3 rounded-lg items-center mt-5"
        >
          <Text className="text-white text-base font-pbold">Tiếp theo</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        key={`modal-${modalKey.current}`} // Unique key based on ref
        animationType="none" // Disable animation to rule out animation bugs
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View className="bg-white rounded-lg p-5 w-11/12 max-h-3/4">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Chọn Task
            </Text>
            {loadingTasks ? (
              <View className="p-10 items-center">
                <ActivityIndicator size="large" color="#64D1CB" />
                <Text className="text-gray-600 mt-2">
                  Đang tải danh sách task...
                </Text>
              </View>
            ) : availableTasks.length === 0 ? (
              <View className="p-10">
                <Text className="text-gray-600 text-center">
                  Không có task nào để thêm
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleAddTask(item)}
                    className="p-3 border-b border-gray-200"
                  >
                    <Text className="text-lg font-pmedium">{item.name}</Text>
                    {item.description && (
                      <Text className="text-gray-600">{item.description}</Text>
                    )}
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 300 }}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                showsVerticalScrollIndicator={true}
              />
            )}
            <TouchableOpacity
              onPress={closeModal}
              className="bg-gray-200 px-6 py-3 rounded-lg items-center mt-4"
            >
              <Text className="text-gray-800 text-base font-pbold">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdditionalTaskScreen;