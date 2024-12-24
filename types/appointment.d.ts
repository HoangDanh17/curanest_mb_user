import { GestureResponderEvent } from "react-native";

export type Status = "pending" | "upcoming" | "completed" | "cancelled"|"accepted";

export interface StatusStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  label: string;
}

export type AppointmentCardProps = {
  id: string;
  avatar: string;
  nurseName: string;
  time: string;
  date: Date;
  services: string[];
  status: Status;
};


