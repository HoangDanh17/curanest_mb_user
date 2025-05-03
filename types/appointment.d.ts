import { ListNurseData } from "@/types/nurse";
import { GestureResponderEvent } from "react-native";

export type Status =
  | "waiting"
  | "confirmed"
  | "success"
  | "upcoming"
  | "changed";

export interface StatusStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  label: string;
}

export type AppointmentCardProps = {
  id: string | undefined;
  avatar: string | undefined;
  nurseName: string | undefined;
  time: string;
  status: Status;
  packageId: string;
  nurseId: string;
  duration: number;
  patientId: string;
  actTime: string | null;
  selectName: string;
};

export type CreateAppointment = {
  "date-nurse-mappings": {
    date: string;
    "nursing-id"?: string;
  }[];
  "nursing-id"?: string;
  "patient-address": string;
  "patient-id": string;
  "svcpackage-id": string;
  "task-infos": {
    "client-note": string;
    "est-duration": number;
    "svctask-id": string;
    "total-cost": number;
    "total-unit": number;
  }[];
};

export type CreateAppointmentRes = {
  status: number;
  message: string;
  "object-id": string;
};

export type AppointmentList = {
  id: string;
  "service-id": string;
  "cuspackage-id": string;
  "nursing-id": string;
  "patient-id": string;
  "patient-address": string;
  "patient-lat-lng": string;
  "est-date": string;
  "act-date": string;
  status: Status;
  "total-est-duration": number;
  "created-at": string;
};

export type AppointmentListNurse = {
  id: string;
  "service-id": string;
  "cuspackage-id": string;
  "nursing-id": string;
  "patient-id": string;
  "patient-address": string;
  "patient-lat-lng": string;
  "est-date": string;
  "act-date": string;
  status: Status;
  "total-est-duration": number;
  "created-at": string;
  nurse: ListNurseData | null;
};

export type AppointmentListRes = {
  status: number;
  data: AppointmentList[];
  filters: {
    "service-id": string;
  };
};

export type AppointmentDetail = {
  package: {
    id: string;
    name: string;
    "total-fee": number;
    "paid-amount": number;
    "unpaid-amount": number;
    "payment-status": string;
    "created-at": string;
  };
  tasks: {
    id: string;
    "task-order": number;
    name: string;
    "client-note": string;
    "staff-advice": string;
    "est-duration": number;
    unit: string;
    "total-unit": number;
    status: string;
    "est-date": string;
  }[];
};

export type AppointmentDetailRes = {
  status: number;
  data: AppointmentDetail;
};

export interface Service {
  id: string;
  name: string;
  quantity: number;
  baseCost: number;
  additionalCost: number;
  totalCost: number;
  duration: number;
  note: string;
  totalUnit: number;
}

export interface PackageData {
  day: string;
  description: string;
  packageId: string;
  packageName: string;
  serviceId: string;
  services: Service[];
  totalDuration: number;
  totalPrice: number;
  discountedPrice?: number;
}

export interface PatientData {
  address: string;
  city: string;
  "desc-pathology": string;
  district: string;
  dob: string;
  "full-name": string;
  id: string;
  "note-for-nurse": string;
  "phone-number": string;
  ward: string;
}

export interface Appointment {
  date: string;
  "nursing-id"?: string;
  "nurse-name"?: string;
}

export interface NurseTime {
  "appointment-id": string;
  "patient-id": string;
  "est-date": string;
  "est-end-time": string;
  status: string;
  "total-est-duration": number;
  "est-travel-time": number;
}

export type NurseTimeRes = {
  status: number;
  data: NurseTime[];
};

export type GetReport = {
  id: string;
  "svc-package-id": string;
  "patient-id": string;
  "nursing-report": string;
  "staff-confirmation": string;
  status: string;
  "created-at": string;
};

export type GetReportRes = {
  status: number;
  data: GetReport;
};

export type NurseSchedule = {
  "appointment-id": string;
  "patient-id":string;
  "est-date": string;
  "est-end-time": string;
  status: string;
  "total-est-duration": number;
  "est-travel-time": number;
};

export type NurseScheduleRes = {
  status: number;
  data: NurseSchedule[];
};
