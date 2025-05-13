import invoiceApiRequest from "@/app/api/invoiceApi";
import { useLocalSearchParams, router } from "expo-router";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useEffect, useRef } from "react";
import { Invoice } from "@/types/invoice";

const MyQRCode = () => {
  const { id, qrCode } = useLocalSearchParams();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInvoice = async (svcpackageId: string) => {
    try {
      const response = await invoiceApiRequest.getInvoice(String(svcpackageId));
      return response.payload.data as Invoice[];
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const checkInvoiceStatus = async () => {
      const invoice = await fetchInvoice(String(id));
      if (invoice && invoice[0].status === "paid") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        router.push("/(tabs)/schedule");
      }
    };
    intervalRef.current = setInterval(checkInvoiceStatus, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/(tabs)/home")}
      >
        <Text style={styles.backButtonText}>Thanh toán sau</Text>
      </TouchableOpacity>

      <Text style={styles.title} className="font-pbold">
        Mã QR thanh toán
      </Text>

      <QRCode
        value={String(qrCode)}
        size={300}
        color="black"
        backgroundColor="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: "#7becf1",
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default MyQRCode;
