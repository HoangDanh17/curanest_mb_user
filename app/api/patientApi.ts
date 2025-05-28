import http from "@/lib/http";
import {
  CreatePatient,
  CreatePatientRes,
  PatientByIdRes,
  PatientRes,
} from "@/types/patient";

const patientApiRequest = {
  getAllPatient: () =>
    http.get<PatientRes>("patients/relatives", { apiPrefix: "patient" }),
  getPatientById: (id: string) =>
    http.get<PatientByIdRes>(`patients/${id}`, { apiPrefix: "patient" }),
  createPatient: (body: CreatePatient) =>
    http.post<CreatePatientRes>("patients", body, { apiPrefix: "patient" }),
  updatePatient: (id: string | string[], body: CreatePatient) =>
    http.put<CreatePatientRes>(`patients/${id}`, body, {
      apiPrefix: "patient",
    }),
};

export default patientApiRequest;
