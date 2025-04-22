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
import { ListNurseData } from "@/types/nurse";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 2;
const CARD_MARGIN = 8;
const CARD_WIDTH =
  (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN * 2) / NUM_COLUMNS;

const renderServiceChip = (service: string) => (
  <View
    key={service}
    style={{
      backgroundColor: "#F3F4F6",
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 4,
      marginBottom: 4,
    }}
  >
    <Text style={{ fontSize: 12, color: "#4B5563" }}>{service}</Text>
  </View>
);

const DoctorCardFlat = ({
  item,
  handlePress,
}: {
  item: ListNurseData;
  handlePress: (id: string) => void;
}) => (
  <TouchableWithoutFeedback onPress={() => handlePress(item["nurse-id"])}>
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        width: CARD_WIDTH,
        margin: CARD_MARGIN,
        overflow: "hidden",
      }}
    >
      <Image
        source={
          item["nurse-picture"]
            ? { uri: item["nurse-picture"] }
            : require("@/assets/images/icon.png")
        }
        style={{ width: "100%", height: 180, backgroundColor: "#E5E7EB" }}
        resizeMode="cover"
      />

      <View style={{ padding: 8 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#111827",
          }}
          numberOfLines={1}
        >
          {item["nurse-name"] || "Không rõ"}
        </Text>

        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
        >
          <Text style={{ fontSize: 12, color: "#6B7280" }} className="font-psemibold">
            {item["current-work-place"] ? `${item["current-work-place"]}` : ""}
          </Text>
        </View>

        {/* Rating and Reviews */}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
        >
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={{ fontSize: 14, fontWeight: "500", marginLeft: 4 }}>
            {item.rate ? item.rate.toFixed(2) : "Chưa có đánh giá"}
          </Text>
        </View>

        {/* Services
        {item.services && item.services.length > 0 && (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}
          >
            {item.services.slice(0, 2).map(renderServiceChip)}
            {item.services.length > 2 && (
              <View
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 12, color: "#4B5563" }}>
                  +{item.services.length - 2}
                </Text>
              </View>
            )}
          </View>
        )} */}
      </View>
    </View>
  </TouchableWithoutFeedback>
);

const NursingCard = ({
  data,
  handlePress,
  ListHeaderComponent,
}: {
  data: ListNurseData[] | undefined;
  handlePress: (id: string) => void;
  ListHeaderComponent?: () => React.JSX.Element;
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ alignItems: "center", marginTop: 16 }}>
        <Text style={{ fontSize: 16, color: "#6B7280" }}>
          Không có dữ liệu để hiển thị
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <DoctorCardFlat item={item} handlePress={handlePress} />
      )}
      keyExtractor={(item) => item["nurse-id"]}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={{
        padding: CARD_MARGIN,
        alignItems: "center",
      }}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={() => (
        <View style={{ marginVertical: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#9CA3AF" }}>
            Đã hết danh sách
          </Text>
        </View>
      )}
      removeClippedSubviews={false}
    />
  );
};

export default NursingCard;
