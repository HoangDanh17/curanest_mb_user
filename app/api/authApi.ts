import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  RegisterBodyType,
  RegisterResType,
} from "@/types/login";

const authApiRequest = {
  login: (body: LoginBodyType) =>
    http.post<LoginResType>('accounts/login', body, { apiPrefix: 'auth' }),
  register: (body: RegisterBodyType) =>
    http.post<RegisterResType>("relatives", body, { apiPrefix: "patient" }),
};

export default authApiRequest;
