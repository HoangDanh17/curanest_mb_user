import { parse, differenceInYears } from "date-fns";

export const calculateAge = (dob: string): number => {
  try {
    const today = new Date();
    return differenceInYears(today, dob);
  } catch (error) {
    console.error("Error calculating age:", error);
    return 0;
  }
};

export const safeParse = (data: any, name: string) => {
  try {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    console.warn(`${name} không phải chuỗi, trả về nguyên bản:`, data);
    return data || null;
  } catch (error) {
    console.error(`Lỗi parse ${name}:`, error);
    return null;
  }
};
