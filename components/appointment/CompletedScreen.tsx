import React, { useState } from "react";
import {
  View,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppointmentProps } from "@/components/appointment/UpcomingScreen";
import AppointmentCard from "@/components/AppointmentCard";
import appointmentApiRequest from "@/app/api/appointmentApi";

const CompletedScreen = ({ appointment }: AppointmentProps) => {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackPress = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setFeedbackModalVisible(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedAppointmentId || !feedbackText.trim()) {
      alert("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Assuming an API endpoint to submit feedback
      // await appointmentApiRequest.submitFeedback({
      //   appointmentId: selectedAppointmentId,
      //   feedback: feedbackText,
      //   rating,
      // });
      alert("Đánh giá đã được gửi thành công!");
      setFeedbackModalVisible(false);
      setFeedbackText("");
      setRating(0);
      setSelectedAppointmentId(null);
    } catch (error) {
      alert("Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            disabled={isSubmitting}
          >
            <MaterialIcons
              name={star <= rating ? "star" : "star-border"}
              size={32}
              color={star <= rating ? "#FFD700" : "#888888"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", marginTop: 8 }}>
      <FlatList
        data={appointment}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <View>
            <AppointmentCard
              id={item.id}
              avatar={item.nurse?.["nurse-picture"]}
              nurseName={item.nurse?.["nurse-name"]}
              time={item["est-date"]}
              status={item.status}
              packageId={item["cuspackage-id"]}
              nurseId={item["nursing-id"]}
              patientId={item["patient-id"]}
              duration={item["total-est-duration"]}
            />
            {item.status === "success" && (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => handleFeedbackPress(item.id)}
                disabled={isSubmitting}
              >
                <Text style={styles.feedbackButtonText}>📝 Gửi đánh giá</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có lịch hẹn hoàn thành</Text>
          </View>
        }
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => {
          setFeedbackModalVisible(false);
          setFeedbackText("");
          setRating(0);
          setSelectedAppointmentId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đánh giá lịch hẹn</Text>
            <Text style={styles.modalSubtitle}>Chọn số sao</Text>
            {renderStarRating()}
            <Text style={styles.modalSubtitle}>Nội dung đánh giá</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Nhập đánh giá của bạn..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              editable={!isSubmitting}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setFeedbackModalVisible(false);
                  setFeedbackText("");
                  setRating(0);
                  setSelectedAppointmentId(null);
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitFeedback}
                disabled={isSubmitting}
              >
                <Text style={styles.modalButtonText}>
                  {isSubmitting ? "Đang gửi..." : "Gửi"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackButton: {
    backgroundColor: "#64CBDB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 8,
  },
  feedbackButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333333",
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#cccccc",
  },
  submitButton: {
    backgroundColor: "#64CBDB",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "500",
  },
});

export default CompletedScreen;