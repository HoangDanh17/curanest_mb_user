import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  RegisterBodyType,
  RegisterResType,
  UpdateUserDataType,
  UserDataRes,
} from "@/types/login";
import { CreatePatientRes } from "@/types/patient";

const authApiRequest = {
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("accounts/user-login", body, { apiPrefix: "auth" }),
  register: (body: RegisterBodyType) =>
    http.post<RegisterResType>("relatives", body, { apiPrefix: "patient" }),
  relativeData: () =>
    http.get<UserDataRes>("relatives/me", { apiPrefix: "patient" }),
  updateRelativeData: (id: string | undefined, body: UpdateUserDataType) =>
    http.put<CreatePatientRes>(`relatives/${id}`, body, {
      apiPrefix: "patient",
    }),
};

export default authApiRequest;
