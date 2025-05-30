import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import CustomInput from "@/components/CustomInput";
import CustomRadio from "@/components/CustomRadio";
import HeaderBack from "@/components/HeaderBack";
import DateTimePicker from "@react-native-community/datetimepicker";
import ApiService from "@/app/api/ApiService";
import patientApiRequest from "@/app/api/patientApi";
import { CreatePatient } from "@/types/patient";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

interface District {
  id: string;
  name: string;
  wards: string[];
  code: string;
}

interface PatientForm {
  fullName: string;
  dob: string;
  phone: string;
  district: string;
  ward: string;
  address: string;
  gender: boolean;
  medicalCondition: string;
  nursingNotes: string;
}

interface FormErrors {
  fullName?: string;
  dob?: string;
  phone?: string;
  district?: string;
  ward?: string;
  address?: string;
  medicalCondition?: string;
}

export const genderOptions = [
  { label: "Nam", value: true },
  { label: "Nữ", value: false },
];

const validateForm = (data: PatientForm): FormErrors => {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Vui lòng nhập họ và tên";
  } else if (data.fullName.length < 2) {
    errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
  }

  const dobRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!data.dob) {
    errors.dob = "Vui lòng nhập ngày sinh";
  } else if (!dobRegex.test(data.dob)) {
    errors.dob = "Ngày sinh không hợp lệ (YYYY-MM-DD)";
  }

  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  if (!data.phone) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!phoneRegex.test(data.phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  if (!data.district) {
    errors.district = "Vui lòng chọn quận";
  }

  if (data.district && !data.ward) {
    errors.ward = "Vui lòng chọn phường";
  }

  if (data.ward && !data.address.trim()) {
    errors.address = "Vui lòng nhập địa chỉ";
  }

  if (!data.medicalCondition.trim()) {
    errors.medicalCondition = "Vui lòng nhập mô tả bệnh lý";
  }

  return errors;
};

const CreatePatientScreen = () => {
  const [formData, setFormData] = useState<PatientForm>({
    fullName: "",
    dob: "",
    phone: "",
    district: "",
    ward: "",
    address: "",
    gender: true,
    medicalCondition: "",
    nursingNotes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [availableWards, setAvailableWards] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiService = ApiService.getInstance();
        const result = await apiService.fetchDistricts();
        setDistricts(result);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (event.type === "dismissed") {
      return;
    }
    if (selectedDate) {
      const formattedDate = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

      setFormData({ ...formData, dob: formattedDate });
      setErrors({ ...errors, dob: undefined });
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    const apiService = ApiService.getInstance();
    const selectedDistrict = districts.find(
      (district) => district.code === districtId
    );
    const districtName = selectedDistrict ? selectedDistrict.name : "";

    setFormData({ ...formData, district: districtName, ward: "" });
    if (!districtId) {
      setAvailableWards([]);
      return;
    }
    try {
      const wards = await apiService.fetchWardsByDistrict(districtId);
      setAvailableWards(Array.isArray(wards) ? wards : []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      setAvailableWards([]);
    }

    setErrors({ ...errors, district: undefined, ward: undefined });
  };

  const handleSubmit = async () => {
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const patientData: CreatePatient = {
        address: formData.address,
        city: "Hồ Chí Minh",
        "desc-pathology": formData.medicalCondition,
        district: formData.district,
        dob: formData.dob,
        "full-name": formData.fullName,
        gender: formData.gender,
        "note-for-nurse": formData.nursingNotes,
        "phone-number": formData.phone,
        ward: formData.ward,
      };

      const response = await patientApiRequest.createPatient(patientData);
      Toast.show({
        type: "success",
        text1: "Tạo hồ sơ thành công",
      });
      router.back();
    } catch (error: any) {
      if (
        error.payload.error.inner ===
        "Error 1062 (23000): Duplicate entry '0999999999' for key 'patients.unique_phone'"
      ) {
        Toast.show({
          type: "error",
          text1: "Tạo hồ sơ thất bại",
          text2: "Số điện thoại này đã tồn tại",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPickerStyle = (isDisabled: boolean) => ({
    color: isDisabled ? "#9CA3AF" : "#374151",
    opacity: isDisabled ? 0.5 : 1,
    padding: 0,
  });

  return (
    <LinearGradient
      colors={["#E0F2FE", "#EEF2FF", "#FAF5FF"]}
      className="flex-1 pb-0"
    >
      <ScrollView className="flex-1">
        <View className="p-4 mt-8">
          <View className="bg-white p-4 rounded-xl">
            <HeaderBack />
            <CustomInput
              label="Họ và tên"
              value={formData.fullName}
              onChangeText={(text) => {
                setFormData({ ...formData, fullName: text });
                setErrors({ ...errors, fullName: undefined });
              }}
              placeholder="Nhập họ và tên"
              containerClassName="bg-white rounded-lg shadow-sm"
              className="border rounded-xl"
              error={errors.fullName}
            />

            <View className="gap-2 mt-2">
              <Text className="text-black text-base mb-1 font-pbold">
                Ngày sinh
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border rounded-xl bg-white p-3"
              >
                <Text className="text-[#999] font-psemibold">
                  {formData.dob ? formData.dob : "Chọn ngày sinh"}
                </Text>
              </TouchableOpacity>
              {errors.dob && (
                <Text className="text-red-500 text-sm mt-1">{errors.dob}</Text>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={
                    formData.dob
                      ? new Date(formData.dob.split("/").reverse().join("-"))
                      : new Date()
                  }
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  locale="vi"
                />
              )}
            </View>

            <CustomInput
              label="Số điện thoại"
              value={formData.phone}
              onChangeText={(text) => {
                setFormData({ ...formData, phone: text });
                setErrors({ ...errors, phone: undefined });
              }}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              className="border rounded-xl"
              containerClassName="bg-white rounded-lg shadow-sm"
              error={errors.phone}
            />

            {/* District Selection */}
            <View className="bg-white rounded-lg shadow-sm gap-2 mt-2">
              <Text className="text-gray-700 text-base mb-1 font-pbold">
                Quận
              </Text>
              <View
                className={`border rounded-xl ${
                  !formData.district ? "bg-white" : "bg-white"
                }`}
              >
                <Picker
                  selectedValue={formData.district}
                  onValueChange={handleDistrictChange}
                  style={getPickerStyle(false)}
                >
                  <Picker.Item label="Chọn quận" value="" />
                  {districts.map((district: any) => (
                    <Picker.Item
                      key={district.code}
                      label={district.name}
                      value={district.code}
                    />
                  ))}
                </Picker>
              </View>
              {errors.district && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.district}
                </Text>
              )}
            </View>

            {/* Ward Selection */}
            <View className="bg-white rounded-lg shadow-sm gap-2 mt-2">
              <Text className="text-gray-700 text-base mb-1 font-pbold">
                Phường
              </Text>
              <View
                className={`border rounded-xl ${
                  !formData.district || availableWards.length === 0
                    ? "bg-gray-50"
                    : "bg-white"
                }`}
              >
                <Picker
                  selectedValue={formData.ward}
                  onValueChange={(text) => {
                    setFormData({ ...formData, ward: text });
                    setErrors({ ...errors, ward: undefined });
                  }}
                  enabled={!!formData.district && availableWards.length > 0}
                  style={getPickerStyle(
                    !formData.district || availableWards.length === 0
                  )}
                >
                  <Picker.Item label="Chọn phường" value="" />
                  {availableWards.map((ward: any, index: number) => (
                    <Picker.Item key={index} label={ward} value={ward} />
                  ))}
                </Picker>
              </View>
              {errors.ward && (
                <Text className="text-red-500 text-sm mt-1">{errors.ward}</Text>
              )}
            </View>

            {/* Address */}
            <CustomInput
              label="Địa chỉ cụ thể"
              value={formData.address}
              onChangeText={(text) => {
                setFormData({ ...formData, address: text });
                setErrors({ ...errors, address: undefined });
              }}
              placeholder="Nhập địa chỉ"
              className="border rounded-xl"
              containerClassName="bg-white rounded-lg shadow-sm"
              error={errors.address}
            />

            {/* Gender */}
            <View className="bg-white rounded-lg shadow-sm gap-2 mt-2">
              <CustomRadio
                value={formData.gender}
                label="Giới tính"
                onValueChange={(gender) => setFormData({ ...formData, gender })}
                options={genderOptions}
              />
            </View>

            {/* Medical Condition */}
            <CustomInput
              label="Mô tả bệnh lý"
              value={formData.medicalCondition}
              onChangeText={(text) => {
                setFormData({ ...formData, medicalCondition: text });
                setErrors({ ...errors, medicalCondition: undefined });
              }}
              placeholder="Mô tả bệnh lý"
              containerClassName="bg-white rounded-lg shadow-sm"
              className="border rounded-xl h-32"
              multiline={true}
              error={errors.medicalCondition}
              style={{ textAlignVertical: "top", textAlign: "left" }}
            />

            <CustomInput
              label="Ghi chú điều dưỡng"
              value={formData.nursingNotes}
              onChangeText={(text) =>
                setFormData({ ...formData, nursingNotes: text })
              }
              placeholder="Thêm ghi chú"
              containerClassName="bg-white rounded-lg shadow-sm"
              className="border rounded-xl h-32"
              style={{ textAlignVertical: "top", textAlign: "left" }}
              multiline={true}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`p-4 rounded-xl items-center mt-4 ${
                isLoading ? "bg-gray-300" : "bg-teal-400"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-pbold text-base uppercase">
                  Tạo hồ sơ
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default CreatePatientScreen;
