import http from "@/lib/http";
import { DetailNurseRes, ListNurseDataRes } from "@/types/nurse";

const nurseApiRequest = {
  getListNurse: (
    id: string | string[],
    page?: number,
    nurseName?: string | null
  ) =>
    http.get<ListNurseDataRes>(
      `nurses?service-id=${id}${
        nurseName ? `&nurse-name=${nurseName}` : ""
      }&page=${page}&size=20`,
      { apiPrefix: "nurse" }
    ),
  getDetailNurse: (id: string | string[]) =>
    http.get<DetailNurseRes>(`nurses/${id}`, { apiPrefix: "nurse" }),
};

export default nurseApiRequest;
