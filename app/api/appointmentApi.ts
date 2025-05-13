import http from "@/lib/http";
import {
  AddMoreAppointment,
  AddMoreAppointmentRes,
  AppointmentDetailRes,
  AppointmentListRes,
  CreateAppointment,
  CreateAppointmentRes,
  GetReportRes,
  NurseScheduleRes,
  NurseTimeRes,
} from "@/types/appointment";
import { InvoiceListRes } from "@/types/invoice";
import { CheckTimeNurseRes, ListNurseDataRes } from "@/types/nurse";

const appointmentApiRequest = {
  createAppointment: (body: CreateAppointment) =>
    http.post<CreateAppointmentRes>("cuspackage", body, {
      apiPrefix: "appointment",
    }),
  getListAppointment: (id: string) =>
    http.get<AppointmentListRes>(`appointments?patient-id=${id}`, {
      apiPrefix: "appointment",
    }),
  getListAppointmentNurse: (id: string, dateFrom?: string, dateTo?: string) =>
    http.get<AppointmentListRes>(
      `appointments?nurse-id=${id}${dateFrom && `&est-date-from=${dateFrom}`}${
        dateTo && `&est-date-to=${dateTo}`
      }`,
      {
        apiPrefix: "appointment",
      }
    ),
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
  getMedicalReport: (id: string) =>
    http.get<GetReportRes>(`medical-record/${id}`, {
      apiPrefix: "appointment",
    }),
  getInvoiceList: (body: { "patient-ids": string[] }) =>
    http.post<InvoiceListRes>("invoices/patient", body, {
      apiPrefix: "appointment",
    }),
  getNurseDate: (id: string, dateFrom: string, dateTo: string) =>
    http.get<NurseScheduleRes>(
      `appointments/nursing-timesheet?nursing-id=${id}&est-date-from=${dateFrom}&est-date-to=${dateTo}`,
      {
        apiPrefix: "appointment",
      }
    ),
  cancelAppointment: (id: string) =>
    http.patch<CreateAppointmentRes>(`cuspackage/${id}/cancel`, null, {
      apiPrefix: "appointment",
    }),
};

export default appointmentApiRequest;
