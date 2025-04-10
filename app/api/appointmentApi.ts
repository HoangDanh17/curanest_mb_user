import http from "@/lib/http";
import {
  AppointmentDetailRes,
  AppointmentListRes,
  CreateAppointment,
  CreateAppointmentRes,
} from "@/types/appointment";

const appointmentApiRequest = {
  createAppointment: (body: CreateAppointment) =>
    http.post<CreateAppointmentRes>("cuspackage", body, {
      apiPrefix: "appointment",
    }),
  getListAppointment: (id: string) =>
    http.get<AppointmentListRes>(`appointments?patient-id=${id}`, {
      apiPrefix: "appointment",
    }),
  getAppointmentDetail: (packageId: string, date: string) =>
    http.get<AppointmentDetailRes>(
      `cuspackage?cus-package-id=${packageId}&est-date=${date}`,
      { apiPrefix: "appointment" }
    ),
};

export default appointmentApiRequest;
