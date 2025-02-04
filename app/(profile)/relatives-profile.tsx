import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import ApiService, { District } from "@/app/api/ApiService";

interface InfoItemProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}

interface SelectItemProps {
  label: string;
  value: string;
  items: string[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

interface NurseData {
  avatar: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  identityCard: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  gender: string;
}

const RelativesProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [nurseData, setNurseData] = useState<NurseData>({
    avatar: "https://mcdn.coolmate.me/image/March2023/cong-cu-anh-che-meme-moi-nhat-1456_232.jpg",
    firstName: "Nguyễn",
    lastName: "Văn A",
    phone: "0123456789",
    email: "nguyenvana@email.com",
    dateOfBirth: "01/01/1990",
    identityCard: "001099123456",
    address: "123 Đường Nguyễn Thị Minh Khai",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    gender: "Nam",
  });

  const [editData, setEditData] = useState<NurseData>(nurseData);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const apiService = ApiService.getInstance();
        const districtsData = await apiService.fetchDistricts();
        setDistricts(districtsData);
        
        if (nurseData.district) {
          const initialDistrict = districtsData.find(d => d.name === nurseData.district);
          if (initialDistrict) {
            const wardsData = await apiService.fetchWardsByDistrict(initialDistrict.code);
            setSelectedWards(wardsData);
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch initial data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSelectDistrict = async (districtName: string) => {
    try {
      setIsLoading(true);
      const selectedDistrict = districts.find((d) => d.name === districtName);

      if (selectedDistrict) {
        const apiService = ApiService.getInstance();
        const wardsData = await apiService.fetchWardsByDistrict(
          selectedDistrict.code
        );
        setSelectedWards(wardsData);
        setEditData((prev) => ({
          ...prev,
          district: districtName,
          ward: "",
          address: "",
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch wards");
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to change your avatar."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setEditData((prev) => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  const handleSave = () => {
    setNurseData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(nurseData);
    setIsEditing(false);
  };

  const InfoItem = ({ label, value, isEditing, onChangeText, disabled = false }: InfoItemProps) => (
    <View className="flex-row py-4 border-b border-gray-100 items-center">
      <View className="w-[40%]">
        <Text className="text-md font-pregular text-gray-500">{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          className={`flex-1 border border-gray-200 rounded-lg p-2 ${
            disabled ? "bg-gray-100" : "bg-white"
          }`}
          editable={!disabled}
        />
      ) : (
        <Text className="flex-1 text-md font-pmedium text-gray-800">
          {value}
        </Text>
      )}
    </View>
  );

  const SelectItem = ({ label, value, items, onValueChange, disabled = false }: SelectItemProps) => (
    <View className="flex-row py-4 border-b border-gray-100 items-center">
      <View className="w-[40%]">
        <Text className="text-md font-pregular text-gray-500">{label}</Text>
      </View>
      {isEditing ? (
        <View className="flex-1">
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            enabled={!disabled}
            style={{ backgroundColor: disabled ? "#f3f4f6" : "white" }}
          >
            <Picker.Item label="Chọn..." value="" />
            {items.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>
      ) : (
        <Text className="flex-1 text-md font-pmedium text-gray-800">
          {value}
        </Text>
      )}
    </View>
  );

  const SectionCard = ({ title, children }: SectionCardProps) => (
    <View className="bg-white/80 backdrop-blur-md mt-4 rounded-2xl overflow-hidden shadow-sm">
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.8)"]}
        className="p-5 gap-3"
      >
        <Text className="text-lg font-pbold text-gray-800">{title}</Text>
        {children}
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient
      colors={["#E0F2FE", "#EEF2FF", "#FAF5FF"]}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
          <LinearGradient
            colors={["rgba(240,245,255,0.9)", "rgba(255,255,255,0.8)"]}
            className="items-center p-8 gap-4"
          >
            <TouchableOpacity
              onPress={isEditing ? pickImage : undefined}
              className="rounded-full p-1.5 bg-white/80 shadow-lg"
            >
              <Image
                source={{ uri: editData.avatar }}
                className="w-[150px] h-[150px] rounded-xl"
              />
              {isEditing && (
                <View className="absolute inset-0 bg-black/30 rounded-xl items-center justify-center">
                  <Text className="text-white font-pmedium">Thay đổi ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
            <View className="items-center gap-2">
              <Text className="text-2xl font-pbold text-gray-800">
                {nurseData.firstName} {nurseData.lastName}
              </Text>
              {!isEditing ? (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="bg-blue-500 px-6 py-2 rounded-lg mt-2"
                >
                  <Text className="text-white font-pmedium">Chỉnh sửa</Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="bg-gray-100 px-6 py-2 rounded-lg"
                  >
                    <Text className="text-gray-700 font-pmedium">Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-500 px-6 py-2 rounded-lg"
                  >
                    <Text className="text-white font-pmedium">Lưu</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        <SectionCard title="Thông tin cá nhân">
          <View className="gap-1">
            <InfoItem
              label="Họ"
              value={editData.firstName}
              isEditing={isEditing}
              onChangeText={(text) =>
                setEditData({ ...editData, firstName: text })
              }
            />
            <InfoItem
              label="Tên"
              value={editData.lastName}
              isEditing={isEditing}
              onChangeText={(text) =>
                setEditData({ ...editData, lastName: text })
              }
            />
            <InfoItem
              label="Số điện thoại"
              value={editData.phone}
              isEditing={isEditing}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
            />
            <InfoItem
              label="Email"
              value={editData.email}
              isEditing={isEditing}
              onChangeText={(text) => setEditData({ ...editData, email: text })}
            />
            <InfoItem
              label="Ngày sinh"
              value={editData.dateOfBirth}
              isEditing={isEditing}
              onChangeText={(text) =>
                setEditData({ ...editData, dateOfBirth: text })
              }
            />
            <InfoItem
              label="CCCD"
              value={editData.identityCard}
              isEditing={isEditing}
              onChangeText={(text) =>
                setEditData({ ...editData, identityCard: text })
              }
            />
            <InfoItem
              label="Giới tính"
              value={editData.gender}
              isEditing={isEditing}
              onChangeText={(text) =>
                setEditData({ ...editData, gender: text })
              }
            />
          </View>
        </SectionCard>

        <SectionCard title="Địa chỉ">
          <View className="gap-1">
            <InfoItem
              label="Thành phố"
              value={editData.city}
              isEditing={isEditing}
              onChangeText={() => {}}
              disabled={true}
            />
            <SelectItem
              label="Quận"
              value={editData.district}
              items={districts.map((d) => d.name)}
              onValueChange={handleSelectDistrict}
              disabled={isLoading}
            />
            <SelectItem
              label="Phường"
              value={editData.ward}
              items={selectedWards}
              onValueChange={(value) =>
                setEditData((prev) => ({ ...prev, ward: value }))
              }
              disabled={!editData.district || isLoading}
            />
            <InfoItem
              label="Địa chỉ"
              value={editData.address}
              isEditing={isEditing}
              onChangeText={(text) =>
                setEditData((prev) => ({ ...prev, address: text }))
              }
              disabled={!editData.ward}
            />
          </View>
        </SectionCard>
      </ScrollView>
    </LinearGradient>
  );
};

export default RelativesProfileScreen;