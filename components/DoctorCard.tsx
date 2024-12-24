import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Doctor = {
  id: string;
  name: string;
  services: string[];
  rating: number;
  image: string;
  role: string;
  location: string;
  reviews: number;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 2;
const CARD_MARGIN = 8;
const CARD_WIDTH =
  (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN * 2) / NUM_COLUMNS;

const renderServiceChip = (service: string) => (
  <View key={service} className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
    <Text className="text-xs text-gray-600">{service}</Text>
  </View>
);

const DoctorCardFlat = ({
  item,
  handlePress,
}: {
  item: Doctor;
  handlePress: (id: string) => void;
}) => (
  <TouchableWithoutFeedback onPress={() => handlePress(item.id)}>
    <View
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ width: CARD_WIDTH, margin: CARD_MARGIN }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-32 rounded-t-xl"
      />
      <View className="p-2">
        <Text className="font-pbold text-sm" numberOfLines={1}>
          {item.name}
        </Text>

        <View className="flex-row items-center mt-1">
          <Text className="text-gray-600 text-xs">
            {item.role} at {item.location}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text className="text-sm ml-1 font-pmedium">{item.rating}</Text>
          <Text className="text-xs text-gray-500 ml-1">
            ({item.reviews} reviews)
          </Text>
        </View>

        <View className="flex-row flex-wrap mt-2">
          {item.services.slice(0, 2).map(renderServiceChip)}
          {item.services.length > 2 && (
            <View className="bg-gray-100 rounded-full px-2 py-1">
              <Text className="text-xs text-gray-600">
                +{item.services.length - 2}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

const DoctorCard = ({
  data,
  handlePress,
}: {
  data: Doctor[];
  handlePress: (id: string) => void;
}) => (
  <FlatList
    data={data}
    renderItem={({ item }) => (
      <DoctorCardFlat item={item} handlePress={handlePress} />
    )}
    keyExtractor={(item) => item.id}
    numColumns={2}
    contentContainerStyle={{ padding: CARD_MARGIN }}
    showsVerticalScrollIndicator={false}
    ListFooterComponent={() => (
      <View className="my-4 mb-8 items-center">
        <Text className="font-psemibold text-gray-700/20">End of the list</Text>
      </View>
    )}
  />
);

export default DoctorCard;
