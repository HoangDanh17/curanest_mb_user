import http from "@/lib/http";
import { CategoryWithServicesRes, ServicePackRes, ServiceTaskRes } from "@/types/service";

const serviceApiRequest = {
  getListCateAndService: (serviceName: string | null) =>
    http.get<CategoryWithServicesRes>(
      `services/group-by-category${
        serviceName !== null && `?service-name=${serviceName}`
      }`,
      { apiPrefix: "appointment" }
    ),
  getListServicePack: (serviceId: string | string[]) =>
    http.get<ServicePackRes>(`services/${serviceId}/svcpackage`, {
      apiPrefix: "appointment",
    }),
  getListServiceTask: (serviceId: string | string[]) =>
    http.get<ServiceTaskRes>(`svcpackage/${serviceId}/svctask`, {
      apiPrefix: "appointment",
    }),
};

export default serviceApiRequest;
