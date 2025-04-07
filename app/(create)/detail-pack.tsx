import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import HeaderBack from "@/components/HeaderBack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import serviceApiRequest from "@/app/api/serviceApi";
import { ServiceTask } from "@/types/service";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

interface ServiceItemProps {
  service: ServiceTask;
  index: number;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  note: string;
  onNoteChange: (id: string, text: string) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  onDelete,
  onQuantityChange,
  note,
  onNoteChange,
}) => {
  const animation = useSharedValue(0);
  const [quantity, setQuantity] = useState(
    service.unit === "time" ? service["est-duration"] : 1 // Mặc định 1 cho quantity
  );

  useEffect(() => {
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

  const priceOfStep = Number(service["price-of-step"]) || 1;
  const quantityMultiplier = priceOfStep === 0 ? 1 : quantity / priceOfStep;
  const additionalUnits = Math.floor(Math.max(0, quantityMultiplier - 1));
  const totalCost =
    Number(service.cost) + Number(service["additional-cost"]) * additionalUnits;
  const adjustedDuration =
    service.unit === "time"
      ? quantity
      : service["est-duration"] * quantityMultiplier;

  const unitLabel = service.unit === "time" ? "phút" : "lần";
  const displayQuantity =
    service.unit === "time" ? quantity : quantity / priceOfStep;

  return (
    <Animated.View
      style={animatedStyle}
      className="p-4 bg-white rounded-lg mb-3 shadow gap-2"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-pbold text-gray-800 flex-1">
          {service["task-order"]}. {service.name}
        </Text>
        {!service["is-must-have"] && (
          <TouchableOpacity
            onPress={confirmDelete}
            className="w-10 h-10 bg-red-100 rounded-full items-center justify-center ml-1 font-pextrabold"
          >
            <SimpleLineIcons name="trash" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-gray-600 mt-1 font-pmedium">
        {service.description}
      </Text>

      {service["price-of-step"] !== 0 && (
        <Text className="text-red-500 mt-1 font-pmedium">
          Chi phí nếu sử dụng thêm:{" "}
          {service["additional-cost"].toLocaleString()} VND /{" "}
          {service["price-of-step"]} {service.unit === "time" ? "phút" : "lần"}
        </Text>
      )}

      <View className="flex-col mt-3">
        <View className="flex flex-col items-end">
          <Text className="text-gray-600 font-pbold">
            {adjustedDuration} phút
          </Text>
          <Text className="text-gray-700 font-pbold">
            {totalCost.toLocaleString()} VND
          </Text>
        </View>
      </View>

      {service["price-of-step"] !== 0 && (
        <View className="flex-row items-center justify-end space-x-2">
          <TouchableOpacity
            onPress={() => {
              const newQuantity = Math.max(
                service.unit === "time" ? service["est-duration"] : 1, // Giới hạn tối thiểu là 1 cho quantity
                quantity - service["price-of-step"]
              );
              setQuantity(newQuantity);
              onQuantityChange(service.id, newQuantity);
            }}
            className="w-9 h-9 bg-white rounded-full items-center justify-center border border-gray-200"
          >
            <Text className="text-lg">-</Text>
          </TouchableOpacity>
          <Text className="text-lg font-psemibold text-gray-800 mx-2">
            {displayQuantity} {unitLabel}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const newQuantity = quantity + service["price-of-step"];
              setQuantity(newQuantity);
              onQuantityChange(service.id, newQuantity);
            }}
            className="w-9 h-9 bg-white rounded-full items-center justify-center border border-gray-200"
          >
            <Text className="text-lg">+</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-lg font-pbold text-gray-800">
        Ghi chú (optional)
      </Text>
      <TextInput
        placeholder="Nhập lưu ý cho task này"
        value={note}
        onChangeText={(text) => onNoteChange(service.id, text)}
        multiline
        numberOfLines={2}
        className="border rounded-lg p-2 mt-2 h-24 font-psemibold text-gray-400"
        style={{ textAlignVertical: "top", textAlign: "left" }}
      />
    </Animated.View>
  );
};

const DetailPackScreen = () => {
  const { id, name, day, description, serviceId, timeInter, patient } =
    useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<ServiceTask[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await serviceApiRequest.getListServiceTask(id);
      const apiData = response.payload.data;

      const mappedServices: ServiceTask[] = apiData.map((item: any) => ({
        id: item.id,
        "svcpackage-id": item["svcpackage-id"],
        "is-must-have": item["is-must-have"],
        "task-order": item["task-order"],
        name: item.name,
        description: item.description,
        "staff-advice": item["staff-advice"],
        "est-duration": item["est-duration"],
        cost: item.cost,
        "additional-cost": item["additional-cost"],
        "additional-cost-desc": item["additional-cost-desc"],
        unit: item.unit,
        "price-of-step": item["price-of-step"],
        status: item.status,
      }));

      setServices(mappedServices);
      const initialQuantities = mappedServices.reduce((acc, service) => {
        acc[service.id] =
          service.unit === "time" ? Number(service["est-duration"]) || 1 : 1; // Mặc định 1 cho quantity
        return acc;
      }, {} as { [key: string]: number });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching service tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: newQuantity,
    }));
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[id];
      return newNotes;
    });
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[id];
      return newQuantities;
    });
  };

  const handleNoteChange = (id: string, text: string) => {
    setNotes((prev) => ({ ...prev, [id]: text }));
  };

  const handleSubmit = () => {
    const packageInfo = {
      packageId: id,
      packageName: name,
      day: day,
      serviceId: serviceId,
      totalDuration: totalDuration,
      totalPrice: totalPrice,
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        quantity: quantities[service.id],
        note: notes[service.id] || "",
        cost: service.cost,
        additionalCost: service["additional-cost"],
        duration:
          service.unit === "time"
            ? quantities[service.id]
            : service["est-duration"] *
              (quantities[service.id] /
                (Number(service["price-of-step"]) || 1)),
      })),
      description: description,
    };

    const packageInfoData = JSON.stringify(packageInfo);
    router.push({
      pathname: "/(create)/select-type-and-time",
      params: {
        id: id,
        day: day,
        totalDuration: totalDuration,
        serviceId: serviceId,
        packageInfo: packageInfoData,
        timeInter: timeInter,
        patient: patient,
      },
    });
  };

  const totalDuration = services.reduce((sum, service) => {
    const priceOfStep = Number(service["price-of-step"]) || 1;
    const quantity = Number(quantities[service.id]) || 1;
    const quantityMultiplier = priceOfStep === 0 ? 1 : quantity / priceOfStep;
    const duration =
      service.unit === "time"
        ? quantity
        : service["est-duration"] * quantityMultiplier;
    return sum + duration;
  }, 0);

  const totalPrice = services.reduce((sum, service) => {
    const priceOfStep = Number(service["price-of-step"]) || 1;
    const quantity = Number(quantities[service.id]) || 1;
    const quantityMultiplier = priceOfStep === 0 ? 1 : quantity / priceOfStep;
    const additionalUnits = Math.floor(Math.max(0, quantityMultiplier - 1));
    return (
      sum +
      (Number(service.cost) +
        Number(service["additional-cost"]) * additionalUnits)
    );
  }, 0);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <Text className="text-center text-lg">Đang tải...</Text>
      </SafeAreaView>
    );
  }

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
        <Text className="text-gray-600 font-pmedium mb-4 mx-2">
          {description}
        </Text>
        {services.map((s, i) => (
          <ServiceItem
            key={s.id}
            service={s}
            index={i}
            onDelete={handleDelete}
            onQuantityChange={handleQuantityChange}
            note={notes[s.id] || ""}
            onNoteChange={handleNoteChange}
          />
        ))}
        <View className="mt-5 p-4 bg-white rounded-lg shadow">
          <View className="flex-row justify-between">
            <Text className="text-gray-600 font-pbold">Tổng thời gian:</Text>
            <Text className="text-red-600 font-pbold">
              {totalDuration} phút
            </Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-gray-600 font-pbold">Tổng giá:</Text>
            <Text className="text-red-600 font-pbold">
              {totalPrice.toLocaleString()} VND
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-[#64D1CB] px-6 py-3 rounded-lg items-center mt-5"
        >
          <Text className="text-white text-base font-pbold">Tiếp theo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailPackScreen;
