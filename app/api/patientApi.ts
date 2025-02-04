import http from "@/lib/http";
import {
  CreatePatient,
  CreatePatientRes,
  Patient,
  PatientRes,
} from "@/types/patient";

const patientApiRequest = {
  getAllPatient: () =>
    http.get<PatientRes>("patients/relatives", { apiPrefix: "patient" }),
  createPatient: (body: CreatePatient) =>
    http.post<CreatePatientRes>("patients", body, { apiPrefix: "patient" }),
};

export default patientApiRequest;
