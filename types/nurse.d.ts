export type NurseData = {
    name: string;
    position: string;
    rating: number;
    reviews: number;
    location: string;
    experience: string;
    patientsChecked: number;
    slogan: string;
    image: string;
    services: string[];
  };
  
  export interface DayOfWeek {
    [key: string]: string;
  }
  
  export type AvailabilityData = {
    [key: string]: string[];
  };