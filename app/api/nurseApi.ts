import http from "@/lib/http";
import { CreateAppointmentRes } from "@/types/appointment";
import { DetailNurseRes, FeedbackType, FeedbackTypeRes, ListNurseDataRes } from "@/types/nurse";

const nurseApiRequest = {
  getListNurse: (
    id?: string | string[],
    page?: number,
    nurseName?: string | null
  ) =>
    http.get<ListNurseDataRes>(
      `nurses?service-id=${id}${
        nurseName ? `&nurse-name=${nurseName}` : ""
      }&page=${page}&size=50`,
      { apiPrefix: "nurse" }
    ),
  getListNurseAll: () =>
    http.get<ListNurseDataRes>(`nurses?page=${1}&size=50`, {
      apiPrefix: "nurse",
    }),
  getDetailNurse: (id: string | string[]) =>
    http.get<DetailNurseRes>(`nurses/${id}`, { apiPrefix: "nurse" }),
  submitFeedback: (body: FeedbackType) =>
    http.post<CreateAppointmentRes>("feedbacks", body, {
      apiPrefix: "nurse",
    }),
  getFeedback: (id: string) =>
    http.get<FeedbackTypeRes>(`feedbacks/${id}`, {
      apiPrefix: "nurse",
    }),
};

export default nurseApiRequest;
