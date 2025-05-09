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
import { Picker } from "@react-native-picker/picker";
import ApiService, { District } from "@/app/api/ApiService";
import { UserDataType } from "@/types/login";
import authApiRequest from "@/app/api/authApi";
import DateTimePicker from "@react-native-community/datetimepicker";

interface ValidationErrors {
  "full-name"?: string;
  "phone-number"?: string;
  email?: string;
  city?: string;
  address?: string;
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

const RelativesProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Initialize as null
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!editData["full-name"].trim()) {
      newErrors["full-name"] = "Vui lòng nhập họ và tên";
    } else if (editData["full-name"].length < 2) {
      newErrors["full-name"] = "Họ và tên phải có ít nhất 2 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(editData["full-name"])) {
      newErrors["full-name"] =
        "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
    }

    if (!editData["phone-number"]) {
      newErrors["phone-number"] = "Vui lòng nhập số điện thoại";
    } else if (
      !/^(0[1|3|5|7|8|9])+([0-9]{8})\b/.test(editData["phone-number"])
    ) {
      newErrors["phone-number"] = "Số điện thoại phải có 10 chữ số";
    }

    if (!editData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [nurseData, setNurseData] = useState<UserDataType>({
    id: "",
    role: "",
    "full-name": "",
    email: "",
    "phone-number": "",
    "created-at": "",
    gender: true,
    dob: "",
    address: "",
    ward: "",
    district: "",
    city: "",
  });

  const [editData, setEditData] = useState<UserDataType>({
    id: "",
    role: "",
    "full-name": "",
    email: "",
    "phone-number": "",
    "created-at": "",
    gender: true,
    dob: "",
    address: "",
    ward: "",
    district: "",
    city: "",
  });

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const apiService = ApiService.getInstance();
      const districtsData = await apiService.fetchDistricts();
      setDistricts(districtsData);

      // If district exists, fetch corresponding wards
      if (nurseData.district) {
        const initialDistrict = districtsData.find(
          (d) => d.name === nurseData.district
        );

        if (initialDistrict) {
          const wardsData = await apiService.fetchWardsByDistrict(
            initialDistrict.code
          );
          setSelectedWards(wardsData);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch initial data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await authApiRequest.relativeData();

      if (response && response.payload && response.payload.data) {
        const userData = response.payload.data;
        const formattedData: UserDataType = {
          id: userData.id || "",
          role: userData.role || "",
          "full-name": userData["full-name"] || "",
          email: userData.email || "",
          "phone-number": userData["phone-number"] || "",
          "created-at": userData["created-at"] || "",
          gender: userData.gender ?? true,
          dob: userData.dob || "",
          address: userData.address || "",
          ward: userData.ward || "",
          district: userData.district || "",
          city: userData.city || "",
        };

        setNurseData(formattedData);
        setEditData(formattedData);

        // Set selectedDate based on dob
        if (formattedData.dob) {
          const parsedDate = new Date(formattedData.dob);
          if (!isNaN(parsedDate.getTime())) {
            setSelectedDate(parsedDate);
          } else {
            setSelectedDate(new Date()); // Fallback to current date if invalid
          }
        } else {
          setSelectedDate(new Date()); // Fallback to current date if no dob
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (isEditing) {
      fetchInitialData();
    }
  }, [isEditing, nurseData.district]);

  const handleSelectDistrict = async (districtName: string) => {
    try {
      setIsLoading(true);
      const selectedDistrict = districts.find((d) => d.name === districtName);

      if (selectedDistrict) {
        const apiService = ApiService.getInstance();
        const wardsData = await apiService.fetchWardsByDistrict(
          selectedDistrict.code
        );

        setEditData((prev) => ({
          ...prev,
          district: districtName,
          ward: prev.district === districtName ? prev.ward : "",
          address: prev.district === districtName ? prev.address : "",
        }));

        setSelectedWards(wardsData);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch wards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin");
      return;
    }

    const { id, role, "created-at": createdAt, ...filteredData } = editData;
    try {
      setIsLoading(true);
      const response = await authApiRequest.updateRelativeData(
        id,
        filteredData
      );
      fetchUserData();
      setIsEditing(false);
      setErrors({});
    } catch (error: any) {
      if (error.payload.error.reason_field) {
        Alert.alert("Cập nhật thất bại", error.payload.error.reason_field);
      } else {
        Alert.alert("Cập nhật thất bại", "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(nurseData);
    // Reset selectedDate to nurseData.dob
    if (nurseData.dob) {
      const parsedDate = new Date(nurseData.dob);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      } else {
        setSelectedDate(new Date());
      }
    } else {
      setSelectedDate(new Date());
    }
    setIsEditing(false);
  };

  const handleChangeText = (field: keyof ValidationErrors, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateForm(),
      }));
    }
  };

  const renderPersonalInfo = () => (
    <View className="bg-white/80 backdrop-blur-md mt-4 rounded-2xl overflow-hidden shadow-sm">
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.8)"]}
        className="p-5 gap-3"
      >
        <Text className="text-lg font-pbold text-gray-800">
          Thông tin cá nhân
        </Text>
        <View className="gap-1">
          <View
            className={`${
              isEditing ? "flex-col gap-2" : "flex-row"
            } py-4 border-b border-gray-100 items-center`}
          >
            <View className={`${isEditing ? "w-full" : "w-[40%]"}`}>
              <Text className="text-md font-pregular text-gray-500">
                Họ và tên
              </Text>
            </View>
            {isEditing ? (
              <View className="w-full">
                <TextInput
                  value={editData?.["full-name"]}
                  onChangeText={(text) => handleChangeText("full-name", text)}
                  className={`w-full flex-1 border ${
                    errors["full-name"] ? "border-red-500" : "border-gray-200"
                  } rounded-lg p-2 bg-white`}
                />
                {errors["full-name"] && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors["full-name"]}
                  </Text>
                )}
              </View>
            ) : (
              <Text className="flex-1 text-md font-pmedium text-gray-800">
                {editData?.["full-name"]}
              </Text>
            )}
          </View>

          <View
            className={`${
              isEditing ? "flex-col gap-2" : "flex-row"
            } py-4 border-b border-gray-100 items-center`}
          >
            <View className={`${isEditing ? "w-full" : "w-[40%]"}`}>
              <Text className="text-md font-pregular text-gray-500">
                Số điện thoại
              </Text>
            </View>
            {isEditing ? (
              <View className="w-full">
                <TextInput
                  value={editData?.["phone-number"]}
                  onChangeText={(text) =>
                    handleChangeText("phone-number", text)
                  }
                  className={`w-full flex-1 border ${
                    errors["phone-number"]
                      ? "border-red-500"
                      : "border-gray-200"
                  } rounded-lg p-2 bg-white`}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {errors["phone-number"] && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors["phone-number"]}
                  </Text>
                )}
              </View>
            ) : (
              <Text className="flex-1 text-md font-pmedium text-gray-800">
                {editData?.["phone-number"]}
              </Text>
            )}
          </View>

          <View
            className={`${
              isEditing ? "flex-col gap-2" : "flex-row"
            } py-4 border-b border-gray-100 items-center`}
          >
            <View className={`${isEditing ? "w-full" : "w-[40%]"}`}>
              <Text className="text-md font-pregular text-gray-500">Email</Text>
            </View>
            {isEditing ? (
              <View className="w-full">
                <TextInput
                  value={editData?.email}
                  onChangeText={(text) => handleChangeText("email", text)}
                  className={`w-full flex-1 border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } rounded-lg p-2 bg-white`}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </Text>
                )}
              </View>
            ) : (
              <Text className="flex-1 text-md font-pmedium text-gray-800">
                {editData?.email}
              </Text>
            )}
          </View>

          <DateOfBirthItem />
          <GenderItem />
        </View>
      </LinearGradient>
    </View>
  );

  const SelectItem = ({
    label,
    value,
    items,
    onValueChange,
    disabled = false,
  }: SelectItemProps) => (
    <View className={` flex-row py-4 border-b border-gray-100 items-center`}>
      <View className={`w-[40%]`}>
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (event.type === "set" && selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setEditData((prev) => ({
        ...prev,
        dob: formattedDate,
      }));
    }
  };

  const DateOfBirthItem = () => (
    <View className="flex-row py-4 border-b border-gray-100 items-center">
      <View className="w-[40%]">
        <Text className="text-md font-pregular text-gray-500">Ngày sinh</Text>
      </View>
      {isEditing ? (
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-200 rounded-lg p-2"
          >
            <Text>{editData.dob || "Chọn ngày sinh"}</Text>
          </TouchableOpacity>

          {showDatePicker && selectedDate && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>
      ) : (
        <Text className="flex-1 text-md font-pmedium text-gray-800">
          {editData.dob}
        </Text>
      )}
    </View>
  );

  const GenderItem = () => (
    <View className="flex-row py-4 border-b border-gray-100 items-center">
      <View className="w-[40%]">
        <Text className="text-md font-pregular text-gray-500">Giới tính</Text>
      </View>
      {isEditing ? (
        <View className="flex-1">
          <Picker
            selectedValue={editData.gender ? "Nam" : "Nữ"}
            onValueChange={(itemValue) =>
              setEditData((prev) => ({
                ...prev,
                gender: itemValue === "Nam",
              }))
            }
            style={{ backgroundColor: "white" }}
          >
            <Picker.Item label="Nam" value="Nam" />
            <Picker.Item label="Nữ" value="Nữ" />
          </Picker>
        </View>
      ) : (
        <Text className="flex-1 text-md font-pmedium text-gray-800">
          {editData.gender ? "Nam" : "Nữ"}
        </Text>
      )}
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
        {renderPersonalInfo()}

        <SectionCard title="Địa chỉ">
          <View className="gap-1">
            <View
              className={`${
                isEditing ? "flex-col gap-2" : "flex-row"
              } py-4 border-b border-gray-100 items-center`}
            >
              <View className={`${isEditing ? "w-full" : "w-[40%]"}`}>
                <Text className="text-md font-pregular text-gray-500">
                  Thành phố
                </Text>
              </View>
              {isEditing ? (
                <TextInput
                  value={editData?.["city"]}
                  onChangeText={(text) => handleChangeText("city", text)}
                  className={`w-full flex-1 border border-gray-200 rounded-lg p-2 bg-gray-100`}
                  editable={false}
                />
              ) : (
                <Text className="flex-1 text-md font-pmedium text-gray-800">
                  {editData?.["city"]}
                </Text>
              )}
            </View>
            <SelectItem
              label="Quận"
              value={editData?.district}
              items={districts.map((d) => d.name)}
              onValueChange={handleSelectDistrict}
              disabled={isLoading}
            />
            <SelectItem
              label="Phường"
              value={editData?.ward}
              items={selectedWards}
              onValueChange={(value) =>
                setEditData((prev) => ({ ...prev, ward: value }))
              }
              disabled={!editData.district || isLoading}
            />
            <View
              className={`${
                isEditing ? "flex-col gap-2" : "flex-row"
              } py-4 border-b border-gray-100 items-center`}
            >
              <View className={`${isEditing ? "w-full" : "w-[40%]"}`}>
                <Text className="text-md font-pregular text-gray-500">
                  Địa chỉ
                </Text>
              </View>
              {isEditing ? (
                <TextInput
                  value={editData?.["address"]}
                  onChangeText={(text) => handleChangeText("address", text)}
                  className={`w-full flex-1 border border-gray-200 rounded-lg p-2 ${
                    !editData.ward ? "bg-gray-100" : "bg-white"
                  } bg-gray-100`}
                  editable={!!editData.ward}
                />
              ) : (
                <Text className="flex-1 text-md font-pmedium text-gray-800">
                  {editData?.["address"]}
                </Text>
              )}
            </View>
          </View>
        </SectionCard>
        <View className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm">
          <LinearGradient
            colors={["rgba(240,245,255,0.9)", "rgba(255,255,255,0.8)"]}
            className="items-end p-8 gap-4"
          >
            <View className="items-end gap-2">
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
      </ScrollView>
    </LinearGradient>
  );
};

export default RelativesProfileScreen;