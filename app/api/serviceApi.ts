import http from "@/lib/http";
import { CategoryWithServicesRes } from "@/types/service";

const serviceApiRequest = {
  getListCateAndService: (serviceName: string | null) =>
    http.get<CategoryWithServicesRes>(
      `services/group-by-category${
        serviceName !== null && `?service-name=${serviceName}`
      }`,
      { apiPrefix: "appointment" }
    ),
};

export default serviceApiRequest;
