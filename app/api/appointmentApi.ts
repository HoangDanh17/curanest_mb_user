import http from "@/lib/http";
import {
  AppointmentDetailRes,
  AppointmentListRes,
  CreateAppointment,
  CreateAppointmentRes,
  NurseTimeRes,
} from "@/types/appointment";
import { CheckTimeNurseRes, ListNurseDataRes } from "@/types/nurse";
import { CreatePatientRes } from "@/types/patient";

const appointmentApiRequest = {
  createAppointment: (body: CreateAppointment) =>
    http.post<CreateAppointmentRes>("cuspackage", body, {
      apiPrefix: "appointment",
    }),
  getListAppointment: (id: string) =>
    http.get<AppointmentListRes>(`appointments?patient-id=${id}`, {
      apiPrefix: "appointment",
    }),
  getListAppointmentNurse: (id: string) =>
    http.get<AppointmentListRes>(`appointments?nurse-id=${id}`, {
      apiPrefix: "appointment",
    }),
  getNurseTime: (nurseId: string, date: string) =>
    http.get<NurseTimeRes>(
      `appointments/nursing-timesheet?nursing-id=${nurseId}&est-date-from=${date}`,
      { apiPrefix: "appointment" }
    ),
  getAppointmentDetail: (packageId: string, date: string) =>
    http.get<AppointmentDetailRes>(
      `cuspackage?cus-package-id=${packageId}&est-date=${date}`,
      { apiPrefix: "appointment" }
    ),
  checkNurseTime: (body: any) =>
    http.post<CheckTimeNurseRes>("appointments/verify-nurses-dates", body, {
      apiPrefix: "appointment",
    }),
  getListNurseAvailableTime: (
    serviceId: string,
    date: string,
    duration: number
  ) =>
    http.get<ListNurseDataRes>(
      `appointments/nursing-available?service-id=${serviceId}&est-date=${date}&est-duration=${duration}`,
      { apiPrefix: "appointment" }
    ),
};

export default appointmentApiRequest;
